param(
  [switch]$ConfirmDevelopmentDatabase,
  [string]$EnvironmentFile = ".env.local"
)

$ErrorActionPreference = "Stop"
$marker = "THE_DOMAIN_DEMO"
$manifestPath = Join-Path $PSScriptRoot ".demo-content-manifest.json"
$previousManifest = if (Test-Path -LiteralPath $manifestPath) { Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json } else { $null }

if (-not $ConfirmDevelopmentDatabase) { throw "Pass -ConfirmDevelopmentDatabase to seed local demo content." }
if ($env:ASPNETCORE_ENVIRONMENT -and $env:ASPNETCORE_ENVIRONMENT -ne "Development") { throw "Demo seeding is allowed only in Development." }
if (-not (Test-Path -LiteralPath $EnvironmentFile)) { throw "Development environment file was not found: $EnvironmentFile" }

function Read-DotEnv([string]$Path) {
  $values = @{}
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $pair = $line -split '=', 2
    $values[$pair[0].Trim()] = $pair[1].Trim().Trim('"').Trim("'")
  }
  $values
}

$settings = Read-DotEnv $EnvironmentFile
$database = $settings['POSTGRES_DB']
$api = $settings['API_URL']
if (-not $api) { $api = 'http://localhost:5000' }
if ($database -ne 'the_domain' -or $api -notmatch '^http://(localhost|127\.0\.0\.1):5000/?$') {
  throw "Refusing unknown database/API target. Expected local database 'the_domain' and localhost:5000."
}

$login = Invoke-RestMethod -Method Post -Uri "$api/api/auth/login" -ContentType 'application/json' -Body (@{
  email = $settings['InitialAdmin__Email']; password = $settings['InitialAdmin__Password']
} | ConvertTo-Json)
$token = $login.accessToken
if (-not $token) { throw "Admin authentication did not return an access token." }
$headers = @{ Authorization = "Bearer $token" }

function Invoke-Api([string]$Method, [string]$Path, $Body = $null) {
  $parameters = @{ Method = $Method; Uri = "$api$Path"; Headers = $headers; ContentType = 'application/json' }
  if ($null -ne $Body) { $parameters.Body = $Body | ConvertTo-Json -Depth 20 }
  try { Invoke-RestMethod @parameters }
  catch { throw "$Method $Path failed with HTTP $([int]$_.Exception.Response.StatusCode): $($_.ErrorDetails.Message)" }
}

function Find-ByProperty($Items, [string]$Property, $Value) {
  foreach ($item in Expand-Items $Items) {
    if ($item.$Property -eq $Value) { return $item }
  }
  return $null
}

function Expand-Items($Items) {
  foreach ($item in @($Items)) {
    if ($item -is [array]) {
      foreach ($nestedItem in $item) { $nestedItem }
    } else {
      $item
    }
  }
}

function Upload-DemoImage([string]$FileName, [string]$Caption, [string]$AltText) {
  $media = Invoke-Api Get '/api/admin/media?page=1&pageSize=100&includeArchived=true'
  $existing = Find-ByProperty $media.items 'originalFileName' $FileName
  if ($existing) {
    if ($existing.isArchived) { Invoke-Api Post "/api/admin/media/$($existing.id)/restore" | Out-Null }
    if ($existing.approvalStatus -ne 2 -and $existing.approvalStatus -ne 'Approved') { Invoke-Api Post "/api/admin/media/$($existing.id)/approve" | Out-Null }
    return $existing.id
  }
  $path = Join-Path $PSScriptRoot "..\..\assets\sample-media\demo\$FileName"
  if (-not (Test-Path -LiteralPath $path)) { throw "Demo asset is missing: $path" }
  $json = & curl.exe -sS -X POST "$api/api/admin/media/upload" -H "Authorization: Bearer $token" `
    -F "file=@$path;type=image/png" -F 'approvalStatus=Approved' -F 'category=THE_DOMAIN_DEMO' `
    -F "caption=$Caption" -F "altText=$AltText"
  if ($LASTEXITCODE -ne 0) { throw "Media upload failed for $FileName." }
  ($json | ConvertFrom-Json).id
}

$manifest = [ordered]@{ marker = $marker; createdAtUtc = if ($previousManifest) { $previousManifest.createdAtUtc } else { [DateTimeOffset]::UtcNow.ToString('o') }; mediaIds = @(); statisticIds = @(); partnerIds = @(); teamIds = @(); eventIds = @(); collectionIds = @() }
$manifest.originalBranding = if ($previousManifest) { $previousManifest.originalBranding } else { Invoke-Api Get '/api/admin/branding' }
$manifest.originalHomepage = if ($previousManifest) { $previousManifest.originalHomepage } else { Invoke-Api Get '/api/admin/homepage' }
$manifest.originalAbout = if ($previousManifest) { $previousManifest.originalAbout } else { Invoke-Api Get '/api/admin/about' }
$manifest.originalStatistics = if ($previousManifest -and $previousManifest.originalStatistics) { $previousManifest.originalStatistics } else { @(Expand-Items (Invoke-Api Get '/api/admin/statistics')) }

$stageMediaId = Upload-DemoImage 'demo-cinematic-stage.png' 'Development cinematic stage' 'A dark event venue with a gold-lit stage and audience silhouettes.'
$productionMediaId = Upload-DemoImage 'demo-production-space.png' 'Development production space' 'A modern stage being prepared under gold and violet production lighting.'
$northstarLogoId = Upload-DemoImage 'partner-northstar.png' 'Northstar demo partner mark' 'Abstract gold Northstar partner logo on black.'
$orbitLogoId = Upload-DemoImage 'partner-orbit.png' 'Orbit demo partner mark' 'Abstract gold Orbit partner logo on black.'
$prismLogoId = Upload-DemoImage 'partner-prism.png' 'Prism demo partner mark' 'Abstract gold Prism partner logo on black.'
$manifest.mediaIds = @($stageMediaId, $productionMediaId, $northstarLogoId, $orbitLogoId, $prismLogoId)

$branding = $manifest.originalBranding
Invoke-Api Put '/api/admin/branding' @{
  siteName = if ($branding.siteName) { $branding.siteName } else { 'The Domain Entertainment' }
  brandDescription = if ($branding.brandDescription) { $branding.brandDescription } else { 'Distinctive entertainment, live events, and memorable experiences created by The Domain.' }
  defaultSeoTitle = if ($branding.defaultSeoTitle) { $branding.defaultSeoTitle } else { 'The Domain Entertainment' }
  defaultSeoDescription = if ($branding.defaultSeoDescription) { $branding.defaultSeoDescription } else { 'Distinctive entertainment, live events, and memorable experiences created by The Domain.' }
  primaryLogoMediaAssetId = $branding.primaryLogoMediaAssetId; alternateLogoMediaAssetId = $branding.alternateLogoMediaAssetId
  faviconMediaAssetId = $branding.faviconMediaAssetId; socialImageMediaAssetId = if ($branding.socialImageMediaAssetId) { $branding.socialImageMediaAssetId } else { $stageMediaId }
  publicEmail = if ($branding.publicEmail) { $branding.publicEmail } else { 'hello@example.test' }
  publicPhone = if ($branding.publicPhone) { $branding.publicPhone } else { '+962 00 000 0000' }
  whatsApp = $branding.whatsApp; publicAddress = if ($branding.publicAddress) { $branding.publicAddress } else { 'Amman, Jordan (development demo)' }
  socialLinks = @{}
} | Out-Null

$originalHomepage = $manifest.originalHomepage
$homepageBody = @{
  heroEyebrow = 'The Domain · Jordan'; heroTitle = 'Where unforgettable moments begin'; heroAccent = $null
  heroDescription = 'Live entertainment, bold ideas, and experiences designed to stay with you.'
  primaryCtaLabel = 'Explore events'; primaryCtaHref = '/events'; secondaryCtaLabel = 'View the gallery'; secondaryCtaHref = '/gallery'
  whyTitle = 'Built around memorable moments'; whyDescription = 'Every experience begins with a clear idea and grows through collaboration, production, and attention to atmosphere.'
  servicesTitle = 'From first idea to final atmosphere'; servicesDescription = 'Creative direction, production, and entertainment brought together under one considered vision.'
  partnersTitle = 'Created with trusted collaborators'; partnersDescription = 'A development showcase of the partners that help ideas move from concept to experience.'
  contactTitle = 'Let us create what comes next'; contactDescription = 'Bring us the ambition. We will help shape the experience.'; contactCtaLabel = 'Start a conversation'; contactCtaHref = '/contact'
  isPublished = $true; heroMediaAssetId = $stageMediaId; galleryCollectionId = $null
  sectionOrder = @('events','statistics','why','previous','gallery','services','partners','contact'); disabledSections = @()
  eventsTitle = 'Experiences on the horizon'; eventsDescription = 'Discover the next live moments taking shape at The Domain.'
  previousEventsTitle = 'The night ends. The story remains.'; previousEventsDescription = 'Return to the stages, rooms, and audiences that shaped earlier experiences.'
  galleryTitle = 'Moments with their own afterlife'; galleryDescription = 'A curated view of live atmosphere and the craft behind every event.'
  isFloatingVideoEnabled = $false; floatingVideoMediaAssetId = $null; floatingVideoPosterMediaAssetId = $null
}
Invoke-Api Put '/api/admin/homepage' $homepageBody | Out-Null
Invoke-Api Put '/api/admin/statistics/presentation' @{ phrase = 'We create moments that move with you'; isEnabled = $true } | Out-Null

$statistics = @(
  @{label='Years creating experiences';value='10';suffix='+'}, @{label='Events produced';value='75';suffix='+'},
  @{label='Guests welcomed';value='120';suffix='K+'}, @{label='Creative partners';value='50';suffix='+'}
)
$adminStats = @(Expand-Items (Invoke-Api Get '/api/admin/statistics')) | Sort-Object slotNumber
for ($index=0; $index -lt $statistics.Count; $index++) {
  $existing = $adminStats[$index]
  if (-not $existing) { throw "The database must contain four permanent statistic slots before demo seeding." }
  $body = @{label=$statistics[$index].label;value=$statistics[$index].value;suffix=$statistics[$index].suffix;description=$null;sortOrder=$index;isVisible=$true;isVerified=$true}
  $saved = Invoke-Api Put "/api/admin/statistics/$($existing.id)" $body
  $manifest.statisticIds += $saved.id
}

$partnerNames = @('Northstar','Orbit','Pulse','Frame','Nova','Atlas','Horizon','Tempo','Prism')
$partnerLogoIds = @($northstarLogoId, $orbitLogoId, $null, $null, $null, $null, $null, $null, $prismLogoId)
$adminPartners = @(Expand-Items (Invoke-Api Get '/api/admin/partners'))
$partnersBySlug = @{}
foreach ($item in $adminPartners) { $partnersBySlug[[string]$item.slug] = $item }
for ($index=0; $index -lt $partnerNames.Count; $index++) {
  $name=$partnerNames[$index];$slug="demo-$($name.ToLowerInvariant())";$existing=$partnersBySlug[[string]$slug]
  $body=@{name=$name;slug=$slug;logoUrl=$null;websiteUrl=$null;description="$marker original graphical demo identity";sortOrder=$index;isVisible=$true;isFeatured=($index-lt3);logoMediaAssetId=$partnerLogoIds[$index]}
  $saved=if($existing){Invoke-Api Put "/api/admin/partners/$($existing.id)" $body}else{Invoke-Api Post '/api/admin/partners' $body};$manifest.partnerIds+=$saved.id
}

Invoke-Api Put '/api/admin/about' @{
  isPublished=$true;isHeroEnabled=$true;heroEyebrow='About The Domain';heroHeading='We turn ideas into experiences'
  heroText='The Domain brings creative direction, production, and entertainment together under one vision.';heroMediaAssetId=$productionMediaId;heroPresentation=3
  introStatement='We build entertainment around people, atmosphere, and the details that make a moment stay.';isStoryEnabled=$true;storyHeading='Built around memorable moments'
  storyText="Every event starts with a clear idea and becomes real through planning, collaboration, and careful execution.`n`nFrom intimate gatherings to large live experiences, we focus on atmosphere, people, and the details that shape how a moment feels."
  storyHighlight='Ideas become memorable when every detail serves the experience.';isTeamEnabled=$true;teamHeading='The people behind the experience';teamText='A multidisciplinary team connecting creative thinking with precise delivery.'
  isPartnersEnabled=$true;partnersHeading='Made through collaboration';partnersText='Trusted relationships help each experience reach its full potential.'
  isReachOutEnabled=$true;reachOutHeading='Create the next moment with us';reachOutText='Tell us what you are planning and where The Domain can add perspective.';reachOutCtaLabel='Start a conversation';reachOutCtaHref='/contact'
  seoTitle='About The Domain';seoDescription='Meet The Domain and discover how creative direction, production, and entertainment come together.';socialImageMediaAssetId=$productionMediaId
} | Out-Null

$team = @(Expand-Items (Invoke-Api Get '/api/admin/team'))
$teamByName = @{}
foreach ($item in $team) { $teamByName[[string]$item.name] = $item }
$roles = @('Creative Direction','Event Production','Guest Experience','Visual Design')
for($index=0;$index -lt 4;$index++){$name=('Demo Team Member {0:d2}' -f ($index+1));$existing=$teamByName[[string]$name];$body=@{name=$name;role=$roles[$index];biography="$marker professional development profile.";photoMediaAssetId=if($index % 2 -eq 0){$stageMediaId}else{$productionMediaId};profileUrl=$null;isVisible=$true};$saved=if($existing){Invoke-Api Put "/api/admin/team/$($existing.id)" $body}else{Invoke-Api Post '/api/admin/team' $body};$manifest.teamIds+=$saved.id}

$eventSpecs=@(
  @{slug='demo-midnight-pulse';title='Midnight Pulse';days=30;description='A high-energy evening of live music, immersive light, and a crowd-led atmosphere.';featured=$true},
  @{slug='demo-city-lights-live';title='City Lights Live';days=60;description='An open-air entertainment experience shaped around sound, movement, and the city after dark.';featured=$false},
  @{slug='demo-afterglow-sessions';title='Afterglow Sessions';days=90;description='A curated night bringing artists, audiences, and cinematic production into one shared space.';featured=$false}
)
# Events intentionally have no archived-to-draft API transition. Restore only marker-owned local
# demo rows so a reset/seed cycle remains repeatable without touching real development content.
@"
UPDATE events
SET "PublicationStatus" = 'Draft'
WHERE "Slug" LIKE 'demo-%'
  AND "LongDescription" LIKE '%THE_DOMAIN_DEMO%'
  AND "PublicationStatus" = 'Archived';
"@ | docker compose -f docker/compose/docker-compose.local.yml exec -T postgres psql -U the_domain -d the_domain -v ON_ERROR_STOP=1 | Out-Null
$events=@(Expand-Items (Invoke-Api Get '/api/admin/events'))
foreach($spec in $eventSpecs){$existing=Find-ByProperty $events 'slug' $spec.slug;$start=[DateTimeOffset]::UtcNow.AddDays($spec.days).Date.AddHours(18);$body=@{slug=$spec.slug;title=$spec.title;shortDescription=$spec.description;longDescription="$($spec.description) $marker local development event.";eventType='Live Entertainment';startAtUtc=$start.ToString('o');endAtUtc=$start.AddHours(4).ToString('o');timeZoneId='Asia/Amman';city='Amman';venueName='The Domain Demo Venue';venueAddress='Amman, Jordan';mapUrl=$null;externalBookingUrl=$null;isBookingEnabled=$false;bookingOpensAtUtc=$null;bookingClosesAtUtc=$null;isFeatured=$spec.featured;showOnHomepage=$true;bookingStatus=1};$saved=if($existing){Invoke-Api Put "/api/admin/events/$($existing.id)" $body}else{Invoke-Api Post '/api/admin/events' $body};$eventMedia=@(Invoke-Api Get "/api/admin/events/$($saved.id)/media");$assetIds=@($stageMediaId,$productionMediaId,'0eaf1f6a-1a6e-46b2-8a87-00fbfdfad5bb');for($i=0;$i-lt$assetIds.Count;$i++){if(-not(Find-ByProperty $eventMedia 'mediaAssetId' $assetIds[$i])){Invoke-Api Post "/api/admin/events/$($saved.id)/media" @{mediaAssetId=$assetIds[$i];usage=if($i-eq0){2}else{4};sortOrder=$i;isFeatured=($i-eq0)}|Out-Null}};$eventMedia=@(Invoke-Api Get "/api/admin/events/$($saved.id)/media");$cover=Find-ByProperty $eventMedia 'mediaAssetId' $stageMediaId;if($cover){Invoke-Api Post "/api/admin/events/$($saved.id)/media/$($cover.id)/cover"|Out-Null;Invoke-Api Put "/api/admin/events/$($saved.id)/media/$($cover.id)/presentation" @{focalPointX=0.5;focalPointY=0.5;zoom=1.0}|Out-Null};Invoke-Api Post "/api/admin/events/$($saved.id)/publish"|Out-Null;$manifest.eventIds+=$saved.id}

$collectionSpecs=@(@{name='Demo · Live Moments';title='Live Moments';description='Highlights from live stages, audience moments, and immersive entertainment experiences.'},@{name='Demo · Behind the Scenes';title='Behind the Scenes';description='A closer look at planning, production, setup, and the people behind each experience.'})
$collectionSpecs[0].name = "Demo $([char]0x00B7) Live Moments"
$collectionSpecs[1].name = "Demo $([char]0x00B7) Behind the Scenes"
$collections=@(Expand-Items (Invoke-Api Get '/api/admin/media-collections?includeArchived=true'))
for($index=0;$index -lt $collectionSpecs.Count;$index++){$spec=$collectionSpecs[$index];$existing=Find-ByProperty $collections 'name' $spec.name;if($existing -and $existing.isArchived){$existing=Invoke-Api Post "/api/admin/media-collections/$($existing.id)/restore"};$saved=if($existing){$existing}else{Invoke-Api Post '/api/admin/media-collections' @{name=$spec.name}};$assets=if($index -eq 0){@($stageMediaId,$productionMediaId,'0eaf1f6a-1a6e-46b2-8a87-00fbfdfad5bb','8cc3cda9-fe56-4d64-9886-000e9efb0638')}else{@($productionMediaId,$stageMediaId,'8cc3cda9-fe56-4d64-9886-000e9efb0638','0e95456b-e168-4185-8425-d36780498458')};$items=@(Invoke-Api Get "/api/admin/media-collections/$($saved.id)/items");foreach($asset in $assets){if(-not(Find-ByProperty $items 'mediaAssetId' $asset)){Invoke-Api Post "/api/admin/media-collections/$($saved.id)/items" @{mediaAssetId=$asset}|Out-Null}};Invoke-Api Put "/api/admin/gallery/collections/$($saved.id)/presentation" @{title=$spec.title;description=$spec.description;layoutPreset=if($index -eq 0){3}else{2};featuredMediaAssetId=$assets[0]}|Out-Null;Invoke-Api Post "/api/admin/gallery/collections/$($saved.id)/publish"|Out-Null;$manifest.collectionIds+=$saved.id;if($index -eq 0){$homepageBody.galleryCollectionId=$saved.id}}
Invoke-Api Put '/api/admin/homepage' $homepageBody | Out-Null

$manifest | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $manifestPath -Encoding utf8
Write-Output "Demo seed complete. Manifest: $manifestPath"
Write-Output "Media: $($manifest.mediaIds.Count); Statistics: $($manifest.statisticIds.Count); Partners: $($manifest.partnerIds.Count); Team: $($manifest.teamIds.Count); Events: $($manifest.eventIds.Count); Collections: $($manifest.collectionIds.Count)"
