param(
    [Parameter(Mandatory = $true)]
    [string]$ConnectionString,
    [int]$ApiPort = 5105,
    [int]$WebsitePort = 3105,
    [string]$BrowserExecutable = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    [string]$ScreenshotPath = "",
    [string]$DesktopScreenshotPath = ""
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$backendDirectory = Join-Path $repositoryRoot "apps/backend"
$apiWorkingDirectory = Join-Path $backendDirectory "src/TheDomain.Api"
$websiteDirectory = Join-Path $repositoryRoot "apps/website"
$backendDll = Join-Path $backendDirectory "src/TheDomain.Api/bin/Debug/net10.0/TheDomain.Api.dll"
$apiCapture = $null
$websiteCapture = $null
$originalUrls = $env:ASPNETCORE_URLS
$originalEnvironment = $env:ASPNETCORE_ENVIRONMENT
$originalDatabaseEnabled = $env:Database__Enabled
$originalConnectionString = $env:Database__ConnectionString
$originalApiBaseUrl = $env:THE_DOMAIN_API_BASE_URL

function Start-CapturedProcess([string]$FileName, [string]$Arguments, [string]$WorkingDirectory) {
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $FileName
    $startInfo.Arguments = $Arguments
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) { throw "Unable to start $FileName." }
    return [pscustomobject]@{
        Process = $process
        Output = $process.StandardOutput.ReadToEndAsync()
        Error = $process.StandardError.ReadToEndAsync()
    }
}

function Wait-ForHttp([string]$Url, [Diagnostics.Process]$Process) {
    $deadline = (Get-Date).AddSeconds(45)
    do {
        Start-Sleep -Milliseconds 200
        if ($Process.HasExited) { return $false }
        try {
            if ((Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2).StatusCode -eq 200) {
                return $true
            }
        }
        catch { }
    } while ((Get-Date) -lt $deadline)
    return $false
}

function Stop-CapturedProcess($Capture) {
    if (-not $Capture.Process.HasExited) {
        Stop-Process -Id $Capture.Process.Id -Force
        $Capture.Process.WaitForExit()
    }
    return [pscustomobject]@{
        Output = $Capture.Output.GetAwaiter().GetResult()
        Error = $Capture.Error.GetAwaiter().GetResult()
    }
}

try {
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$ApiPort"
    $env:Database__Enabled = "true"
    $env:Database__ConnectionString = $ConnectionString
    $apiCapture = Start-CapturedProcess (Get-Command dotnet).Source `
        ('"' + $backendDll + '"') $apiWorkingDirectory
    if (-not (Wait-ForHttp "http://127.0.0.1:$ApiPort/health" $apiCapture.Process)) {
        $failure = Stop-CapturedProcess $apiCapture
        $apiCapture = $null
        throw "API failed to start. $($failure.Error)"
    }

    $env:THE_DOMAIN_API_BASE_URL = "http://127.0.0.1:$ApiPort"
    $websiteCapture = Start-CapturedProcess (Get-Command node).Source `
        "node_modules/next/dist/bin/next start --port $WebsitePort" $websiteDirectory
    if (-not (Wait-ForHttp "http://127.0.0.1:$WebsitePort/robots.txt" $websiteCapture.Process)) {
        $failure = Stop-CapturedProcess $websiteCapture
        $websiteCapture = $null
        throw "Website failed to start. $($failure.Error)"
    }

    $routeWatch = [Diagnostics.Stopwatch]::StartNew()
    $page = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$WebsitePort/" -TimeoutSec 45
    $routeWatch.Stop()
    try {
        $null = Invoke-WebRequest -UseBasicParsing `
            "http://127.0.0.1:$ApiPort/measurement-marker-initial" -TimeoutSec 5
    }
    catch { }
    Start-Sleep -Milliseconds 200
    $html = $page.Content
    $scripts = [regex]::Matches($html, 'src="(?<path>/_next/static/[^\"]+\.js)"') |
        ForEach-Object { $_.Groups["path"].Value } |
        Sort-Object -Unique
    $javascriptBytes = 0
    foreach ($script in $scripts) {
        $asset = Invoke-WebRequest -UseBasicParsing ("http://127.0.0.1:$WebsitePort" + $script) -TimeoutSec 15
        $javascriptBytes += $asset.RawContentStream.Length
    }

    $homepageWatch = [Diagnostics.Stopwatch]::StartNew()
    $homepageApi = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$ApiPort/api/public/homepage" -TimeoutSec 30
    $homepageWatch.Stop()
    $brandingWatch = [Diagnostics.Stopwatch]::StartNew()
    $brandingApi = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$ApiPort/api/public/branding" -TimeoutSec 30
    $brandingWatch.Stop()
    $browserScript = Join-Path $PSScriptRoot "collect-browser-metrics.mjs"
    $browserOutput = & (Get-Command node).Source $browserScript `
        "http://127.0.0.1:$WebsitePort/" $BrowserExecutable `
        $(if ($ScreenshotPath) { $ScreenshotPath } else { "-" }) 390 844
    if ($LASTEXITCODE -ne 0) { throw "Browser measurement failed." }
    $browserMetrics = $browserOutput | ConvertFrom-Json
    $desktopOutput = & (Get-Command node).Source $browserScript `
        "http://127.0.0.1:$WebsitePort/" $BrowserExecutable `
        $(if ($DesktopScreenshotPath) { $DesktopScreenshotPath } else { "-" }) 1440 900
    if ($LASTEXITCODE -ne 0) { throw "Desktop browser measurement failed." }
    $desktopMetrics = $desktopOutput | ConvertFrom-Json
    Start-Sleep -Milliseconds 500

    $websiteLogs = Stop-CapturedProcess $websiteCapture
    $websiteCapture = $null
    $apiLogs = Stop-CapturedProcess $apiCapture
    $apiCapture = $null
    $healthIndex = $apiLogs.Output.IndexOf("HTTP GET /health responded")
    $apiSegment = if ($healthIndex -ge 0) { $apiLogs.Output.Substring($healthIndex) } else { $apiLogs.Output }
    $markerIndex = $apiSegment.IndexOf("HTTP GET /measurement-marker-initial")
    $initialSegment = if ($markerIndex -ge 0) { $apiSegment.Substring(0, $markerIndex) } else { $apiSegment }

    [pscustomobject]@{
        status = $page.StatusCode
        routeMs = [math]::Round($routeWatch.Elapsed.TotalMilliseconds, 1)
        htmlBytes = [Text.Encoding]::UTF8.GetByteCount($html)
        initialApiRequests = ([regex]::Matches($initialSegment, "HTTP GET /api/public/")).Count
        homepageRequests = ([regex]::Matches($initialSegment, "HTTP GET /api/public/homepage")).Count
        brandingRequests = ([regex]::Matches($initialSegment, "HTTP GET /api/public/branding")).Count
        sqlCommands = ([regex]::Matches($initialSegment, "Executed DbCommand")).Count
        homepageApiBytes = [Text.Encoding]::UTF8.GetByteCount($homepageApi.Content)
        homepageWarmMs = [math]::Round($homepageWatch.Elapsed.TotalMilliseconds, 1)
        brandingApiBytes = [Text.Encoding]::UTF8.GetByteCount($brandingApi.Content)
        brandingWarmMs = [math]::Round($brandingWatch.Elapsed.TotalMilliseconds, 1)
        scriptFiles = $scripts.Count
        javascriptBytes = $javascriptBytes
        imageElements = ([regex]::Matches($html, "<img ")).Count
        lazyImages = ([regex]::Matches($html, 'loading="lazy"')).Count
        priorityImages = ([regex]::Matches($html, 'fetchPriority="high"')).Count
        videoElements = ([regex]::Matches($html, "<video")).Count
        videosWithSource = ([regex]::Matches($html, '<video[^>]+src="')).Count
        preloads = ([regex]::Matches($html, '<link[^>]+rel="preload"')).Count
        homeSections = ([regex]::Matches($html, "data-home-section=")).Count
        hasGreyLoader = $html.Contains("Framing the experience")
        lcpMs = $browserMetrics.lcpMs
        cls = $browserMetrics.cls
        longTasks = $browserMetrics.longTasks
        browserRequests = $browserMetrics.requests
        mediaRequests = $browserMetrics.mediaRequests
        idleRequestsAfterTwoSeconds = $browserMetrics.idleRequestsAfterTwoSeconds
        browserResourceTransferBytes = $browserMetrics.resourceTransferBytes
        consoleErrors = $browserMetrics.consoleErrors
        pageErrors = $browserMetrics.pageErrors
        logoScrollY = $browserMetrics.logoScrollY
        logoHardReloaded = $browserMetrics.logoHardReloaded
        mobileMenuClosed = $browserMetrics.mobileMenuClosed
        internalLogoPathname = $browserMetrics.internalLogoPathname
        internalLogoScrollY = $browserMetrics.internalLogoScrollY
        internalLogoHardReloaded = $browserMetrics.internalLogoHardReloaded
        navigationOverlayStuck = $browserMetrics.navigationOverlayStuck
        desktopLcpMs = $desktopMetrics.lcpMs
        desktopCls = $desktopMetrics.cls
        desktopConsoleErrors = $desktopMetrics.consoleErrors
        desktopPageErrors = $desktopMetrics.pageErrors
        desktopLogoScrollY = $desktopMetrics.logoScrollY
        desktopInternalLogoPathname = $desktopMetrics.internalLogoPathname
        desktopInternalLogoScrollY = $desktopMetrics.internalLogoScrollY
        desktopNavigationOverlayStuck = $desktopMetrics.navigationOverlayStuck
    } | ConvertTo-Json
}
finally {
    if ($websiteCapture) { $null = Stop-CapturedProcess $websiteCapture }
    if ($apiCapture) { $null = Stop-CapturedProcess $apiCapture }
    $env:ASPNETCORE_URLS = $originalUrls
    $env:ASPNETCORE_ENVIRONMENT = $originalEnvironment
    $env:Database__Enabled = $originalDatabaseEnabled
    $env:Database__ConnectionString = $originalConnectionString
    $env:THE_DOMAIN_API_BASE_URL = $originalApiBaseUrl
}
