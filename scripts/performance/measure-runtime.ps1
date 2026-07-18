param(
    [Parameter(Mandatory = $true)]
    [string]$ConnectionString,
    [ValidateSet("Current", "Reduced")]
    [string]$LoggingMode = "Reduced",
    [ValidateSet("Debug", "Release")]
    [string]$BackendConfiguration = "Debug",
    [ValidateSet("Development", "Production")]
    [string]$BackendEnvironment = "Development",
    [ValidateSet("Dev", "Start")]
    [string]$WebsiteMode = "Dev",
    [int]$ApiPort = 5300,
    [int]$WebsitePort = 3300,
    [int]$WarmSamples = 5
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$apiDirectory = Join-Path $repositoryRoot "apps/backend/src/TheDomain.Api"
$websiteDirectory = Join-Path $repositoryRoot "apps/website"
$backendDll = Join-Path $apiDirectory "bin/$BackendConfiguration/net8.0/TheDomain.Api.dll"
$apiCapture = $null
$websiteCapture = $null

function Start-CapturedProcess(
    [string]$FileName,
    [string]$Arguments,
    [string]$WorkingDirectory,
    [hashtable]$Environment
) {
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $FileName
    $startInfo.Arguments = $Arguments
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    foreach ($key in $Environment.Keys) {
        $startInfo.Environment[$key] = $Environment[$key]
    }

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) {
        throw "Unable to start $FileName."
    }

    return [pscustomobject]@{
        Process = $process
        Output = $process.StandardOutput.ReadToEndAsync()
        Error = $process.StandardError.ReadToEndAsync()
    }
}

function Get-DescendantProcessIds([int]$ParentId) {
    $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentId" -ErrorAction SilentlyContinue)
    foreach ($child in $children) {
        Get-DescendantProcessIds $child.ProcessId
        $child.ProcessId
    }
}

function Stop-CapturedProcess($Capture) {
    if ($null -eq $Capture) {
        return [pscustomobject]@{ Output = ""; Error = "" }
    }

    @(Get-DescendantProcessIds $Capture.Process.Id) |
        Sort-Object -Descending -Unique |
        ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    if (-not $Capture.Process.HasExited) {
        Stop-Process -Id $Capture.Process.Id -Force -ErrorAction SilentlyContinue
        $Capture.Process.WaitForExit()
    }

    return [pscustomobject]@{
        Output = $Capture.Output.GetAwaiter().GetResult()
        Error = $Capture.Error.GetAwaiter().GetResult()
    }
}

function Wait-ForHttp([string]$Url, [Diagnostics.Process]$Process) {
    $deadline = (Get-Date).AddSeconds(120)
    do {
        Start-Sleep -Milliseconds 250
        if ($Process.HasExited) {
            throw "Process exited while waiting for $Url."
        }
        try {
            if ((Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 3).StatusCode -eq 200) {
                return
            }
        }
        catch { }
    } while ((Get-Date) -lt $deadline)

    throw "Timed out waiting for $Url."
}

function Invoke-TimedGet([System.Net.Http.HttpClient]$Client, [string]$Url) {
    $watch = [Diagnostics.Stopwatch]::StartNew()
    $response = $Client.GetAsync($Url).GetAwaiter().GetResult()
    $body = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
    $watch.Stop()
    if (-not $response.IsSuccessStatusCode) {
        throw "$Url returned HTTP $([int]$response.StatusCode)."
    }

    return [pscustomobject]@{
        Milliseconds = [math]::Round($watch.Elapsed.TotalMilliseconds, 1)
        Bytes = $body.Length
    }
}

function Add-Marker([string]$Name) {
    try {
        $null = Invoke-WebRequest -UseBasicParsing `
            "http://127.0.0.1:$ApiPort/measurement-marker-$Name" -TimeoutSec 3
    }
    catch { }
}

if (-not (Test-Path $backendDll)) {
    throw "Backend binary was not found at $backendDll. Build it before measuring."
}

$apiEnvironment = @{
    ASPNETCORE_ENVIRONMENT = $BackendEnvironment
    ASPNETCORE_URLS = "http://127.0.0.1:$ApiPort"
    Database__Enabled = "true"
    Database__ConnectionString = $ConnectionString
    Cors__AllowedOrigins__0 = "http://127.0.0.1:$WebsitePort"
    "Serilog__MinimumLevel__Override__Microsoft.AspNetCore" = "Information"
    "Serilog__MinimumLevel__Override__Microsoft.AspNetCore_OutputCaching" = "Information"
}
if ($LoggingMode -eq "Current") {
    $apiEnvironment.Serilog__MinimumLevel__Default = "Debug"
    $apiEnvironment.Serilog__MinimumLevel__Override__Microsoft_EntityFrameworkCore = "Debug"
}
else {
    $apiEnvironment.Serilog__MinimumLevel__Default = "Information"
    $apiEnvironment.Serilog__MinimumLevel__Override__Microsoft_EntityFrameworkCore = "Warning"
}

# Environment-variable configuration keys use double underscores for hierarchy;
# dots remain part of the category name.
$apiEnvironment["Serilog__MinimumLevel__Override__Microsoft.AspNetCore.OutputCaching"] = "Information"
$apiEnvironment["Serilog__MinimumLevel__Override__Microsoft.EntityFrameworkCore"] =
    if ($LoggingMode -eq "Current") { "Debug" } else { "Warning" }
$apiEnvironment.Remove("Serilog__MinimumLevel__Override__Microsoft.AspNetCore_OutputCaching")
$apiEnvironment.Remove("Serilog__MinimumLevel__Override__Microsoft_EntityFrameworkCore")

$websiteArguments = if ($WebsiteMode -eq "Dev") {
    "node_modules/next/dist/bin/next dev --port $WebsitePort"
}
else {
    "node_modules/next/dist/bin/next start --port $WebsitePort"
}

$labels = [Collections.Generic.List[string]]::new()
$records = @()
$client = $null

try {
    $apiCapture = Start-CapturedProcess (Get-Command dotnet).Source `
        ('"' + $backendDll + '"') $apiDirectory $apiEnvironment
    Wait-ForHttp "http://127.0.0.1:$ApiPort/health" $apiCapture.Process

    $websiteCapture = Start-CapturedProcess (Get-Command node).Source `
        $websiteArguments $websiteDirectory @{
            THE_DOMAIN_API_BASE_URL = "http://127.0.0.1:$ApiPort"
            NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:$ApiPort"
            NEXT_PUBLIC_WEBSITE_URL = "http://127.0.0.1:$WebsitePort"
        }
    Wait-ForHttp "http://127.0.0.1:$WebsitePort/robots.txt" $websiteCapture.Process

    $client = [System.Net.Http.HttpClient]::new()
    $client.Timeout = [TimeSpan]::FromSeconds(120)
    $targets = @(
        [pscustomobject]@{ Name = "homepage-api"; Url = "http://127.0.0.1:$ApiPort/api/public/homepage" },
        [pscustomobject]@{ Name = "upcoming-api"; Url = "http://127.0.0.1:$ApiPort/api/public/events/upcoming" },
        [pscustomobject]@{ Name = "featured-api"; Url = "http://127.0.0.1:$ApiPort/api/public/events/featured" },
        [pscustomobject]@{ Name = "previous-api"; Url = "http://127.0.0.1:$ApiPort/api/public/events/previous" },
        [pscustomobject]@{ Name = "home-route"; Url = "http://127.0.0.1:$WebsitePort/" },
        [pscustomobject]@{ Name = "events-route"; Url = "http://127.0.0.1:$WebsitePort/events" }
    )

    foreach ($target in $targets) {
        $label = "cold-$($target.Name)"
        $labels.Add($label)
        Add-Marker $label
        $result = Invoke-TimedGet $client $target.Url
        $records += [pscustomobject]@{
            Target = $target.Name
            Phase = "cold"
            Samples = @($result.Milliseconds)
            MedianMilliseconds = $result.Milliseconds
            MaximumMilliseconds = $result.Milliseconds
            Bytes = $result.Bytes
        }
    }

    foreach ($target in $targets) {
        $label = "warm-$($target.Name)"
        $labels.Add($label)
        Add-Marker $label
        $samples = @()
        $bytes = 0
        1..$WarmSamples | ForEach-Object {
            $result = Invoke-TimedGet $client $target.Url
            $samples += $result.Milliseconds
            $bytes = $result.Bytes
        }
        $sorted = @($samples | Sort-Object)
        $records += [pscustomobject]@{
            Target = $target.Name
            Phase = "warm"
            Samples = $samples
            MedianMilliseconds = $sorted[[math]::Floor($sorted.Count / 2)]
            MaximumMilliseconds = ($samples | Measure-Object -Maximum).Maximum
            Bytes = $bytes
        }
    }

    Add-Marker "end"
}
finally {
    if ($client) { $client.Dispose() }
    $websiteLogs = Stop-CapturedProcess $websiteCapture
    $websiteCapture = $null
    $apiLogs = Stop-CapturedProcess $apiCapture
    $apiCapture = $null
}

$segments = @()
for ($index = 0; $index -lt $labels.Count; $index++) {
    $needle = "/measurement-marker-$($labels[$index])"
    $start = $apiLogs.Output.IndexOf($needle)
    $nextNeedle = if ($index + 1 -lt $labels.Count) {
        "/measurement-marker-$($labels[$index + 1])"
    }
    else {
        "/measurement-marker-end"
    }
    $finish = if ($start -ge 0) { $apiLogs.Output.IndexOf($nextNeedle, $start + 1) } else { -1 }
    $segment = if ($start -ge 0 -and $finish -gt $start) {
        $apiLogs.Output.Substring($start, $finish - $start)
    }
    else { "" }

    $commandDurations = [regex]::Matches(
        $segment,
        'Executed DbCommand \((?<ms>[0-9.,]+)ms\)'
    ) | ForEach-Object { [double]($_.Groups["ms"].Value -replace ',', '') }
    $readerDurations = [regex]::Matches(
        $segment,
        '(?:data reader.*?(?:after spending|duration[:=]?)\s*)(?<ms>[0-9.,]+)\s*ms',
        [Text.RegularExpressions.RegexOptions]::IgnoreCase
    ) | ForEach-Object { [double]($_.Groups["ms"].Value -replace ',', '') }

    $segments += [pscustomobject]@{
        Label = $labels[$index]
        DatabaseCommands = $commandDurations.Count
        SqlMillisecondsTotal = [math]::Round(($commandDurations | Measure-Object -Sum).Sum, 1)
        SqlMillisecondsMaximum = [math]::Round(($commandDurations | Measure-Object -Maximum).Maximum, 1)
        ReaderMillisecondsMaximum = [math]::Round(($readerDurations | Measure-Object -Maximum).Maximum, 1)
        CacheHitLogCount = ([regex]::Matches(
            $segment,
            'Serving response from cache|served from cache',
            [Text.RegularExpressions.RegexOptions]::IgnoreCase
        )).Count
    }
}

[pscustomobject]@{
    LoggingMode = $LoggingMode
    BackendConfiguration = $BackendConfiguration
    BackendEnvironment = $BackendEnvironment
    WebsiteMode = $WebsiteMode
    WarmSampleCount = $WarmSamples
    Records = $records
    Segments = $segments
    ApiStandardOutputBytes = [Text.Encoding]::UTF8.GetByteCount($apiLogs.Output)
    WebsiteStandardOutputBytes = [Text.Encoding]::UTF8.GetByteCount($websiteLogs.Output)
    ApiStandardErrorPresent = -not [string]::IsNullOrWhiteSpace($apiLogs.Error)
    WebsiteStandardErrorPresent = -not [string]::IsNullOrWhiteSpace($websiteLogs.Error)
} | ConvertTo-Json -Depth 8
