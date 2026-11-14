param(
  [switch]$ConfirmDevelopmentDatabase,
  [string]$EnvironmentFile = ".env.local"
)

$ErrorActionPreference = "Stop"
$manifestPath = Join-Path $PSScriptRoot ".demo-content-manifest.json"
if (-not $ConfirmDevelopmentDatabase) { throw "Pass -ConfirmDevelopmentDatabase to reset local demo content." }
if ($env:ASPNETCORE_ENVIRONMENT -and $env:ASPNETCORE_ENVIRONMENT -ne "Development") { throw "Demo reset is allowed only in Development." }
if (-not (Test-Path -LiteralPath $manifestPath)) { throw "Demo manifest was not found. Nothing can be safely reset." }

function Read-DotEnv([string]$Path) { $values=@{};foreach($line in Get-Content -LiteralPath $Path){if($line-match'^\s*#'-or$line-notmatch'='){continue};$pair=$line-split'=',2;$values[$pair[0].Trim()]=$pair[1].Trim().Trim('"').Trim("'")};$values }
$settings=Read-DotEnv $EnvironmentFile
if($settings['POSTGRES_DB']-ne'the_domain'){throw "Refusing to reset an unknown database."}
$api=if($settings['API_URL']){$settings['API_URL']}else{'http://localhost:5000'}
if($api-notmatch'^http://(localhost|127\.0\.0\.1):5000/?$'){throw "Refusing a non-local API target."}
$manifest=Get-Content -LiteralPath $manifestPath -Raw|ConvertFrom-Json
if($manifest.marker-ne'THE_DOMAIN_DEMO'){throw "Manifest marker is invalid."}
$login=Invoke-RestMethod -Method Post -Uri "$api/api/auth/login" -ContentType application/json -Body (@{email=$settings['InitialAdmin__Email'];password=$settings['InitialAdmin__Password']}|ConvertTo-Json)
$headers=@{Authorization="Bearer $($login.accessToken)"}
function Api([string]$Method,[string]$Path,$Body=$null){$p=@{Method=$Method;Uri="$api$Path";Headers=$headers;ContentType='application/json'};if($null-ne$Body){$p.Body=$Body|ConvertTo-Json -Depth 20};try{Invoke-RestMethod @p}catch{throw "$Method $Path failed with HTTP $([int]$_.Exception.Response.StatusCode): $($_.ErrorDetails.Message)"}}

if($manifest.originalHomepage){$h=$manifest.originalHomepage;$b=$h.builder;$floatingEnabled=if($null-ne$b.isFloatingVideoEnabled){[bool]$b.isFloatingVideoEnabled}else{$false};Api Put '/api/admin/homepage' @{isPublished=$h.isPublished;heroMediaAssetId=$b.heroMediaAssetId;galleryCollectionId=$b.galleryCollectionId;isFloatingVideoEnabled=$floatingEnabled;floatingVideoMediaAssetId=$b.floatingVideoMediaAssetId;floatingVideoPosterMediaAssetId=$b.floatingVideoPosterMediaAssetId}|Out-Null}
foreach($stat in @($manifest.originalStatistics)){Api Put "/api/admin/statistics/$($stat.id)" @{label=$stat.label;value=$stat.value;suffix=$stat.suffix;description=$stat.description;sortOrder=$stat.sortOrder;isVisible=$true;isVerified=$true}|Out-Null}
if($manifest.originalBranding){$b=$manifest.originalBranding;Api Put '/api/admin/branding' @{siteName=$b.siteName;brandDescription=$b.brandDescription;defaultSeoTitle=$b.defaultSeoTitle;defaultSeoDescription=$b.defaultSeoDescription;primaryLogoMediaAssetId=$b.primaryLogoMediaAssetId;alternateLogoMediaAssetId=$b.alternateLogoMediaAssetId;faviconMediaAssetId=$b.faviconMediaAssetId;socialImageMediaAssetId=$b.socialImageMediaAssetId;publicEmail=$b.publicEmail;publicPhone=$b.publicPhone;whatsApp=$b.whatsApp;publicAddress=$b.publicAddress;socialLinks=$b.socialLinks}|Out-Null}
if($manifest.originalAbout -and "$($manifest.originalAbout)" -ne 'null'){$a=$manifest.originalAbout;Api Put '/api/admin/about' @{isPublished=$a.isPublished;isHeroEnabled=$a.isHeroEnabled;heroEyebrow=$a.heroEyebrow;heroHeading=$a.heroHeading;heroText=$a.heroText;heroMediaAssetId=$a.heroMediaAssetId;heroPresentation=$a.heroPresentation;introStatement=$a.introStatement;isStoryEnabled=$a.isStoryEnabled;storyHeading=$a.storyHeading;storyText=$a.storyText;storyHighlight=$a.storyHighlight;isTeamEnabled=$a.isTeamEnabled;teamHeading=$a.teamHeading;teamText=$a.teamText;isPartnersEnabled=$a.isPartnersEnabled;partnersHeading=$a.partnersHeading;partnersText=$a.partnersText;isReachOutEnabled=$a.isReachOutEnabled;reachOutHeading=$a.reachOutHeading;reachOutText=$a.reachOutText;reachOutCtaLabel=$a.reachOutCtaLabel;reachOutCtaHref=$a.reachOutCtaHref;seoTitle=$a.seoTitle;seoDescription=$a.seoDescription;socialImageMediaAssetId=$a.socialImageMediaAssetId}|Out-Null}

foreach($id in @($manifest.teamIds)){try{Api Delete "/api/admin/team/$id"|Out-Null}catch{}}
foreach($id in @($manifest.eventIds)){try{Api Post "/api/admin/events/$id/archive"|Out-Null}catch{}}
foreach($id in @($manifest.collectionIds)){try{Api Post "/api/admin/gallery/collections/$id/unpublish"|Out-Null}catch{};try{$items=@(Api Get "/api/admin/media-collections/$id/items");foreach($item in $items){Api Delete "/api/admin/media-collections/$id/items/$($item.mediaAssetId)"|Out-Null};Api Post "/api/admin/media-collections/$id/archive"|Out-Null;Api Delete "/api/admin/media-collections/$id"|Out-Null}catch{}}
foreach($id in @($manifest.mediaIds)){try{Api Post "/api/admin/media/$id/archive"|Out-Null}catch{}}

$partnerIds=@($manifest.partnerIds)|ForEach-Object{[Guid]$_}
$partnerList=($partnerIds|ForEach-Object{"'$($_)'"})-join','
$sql=@"
BEGIN;
DELETE FROM partners WHERE "Id" IN ($partnerList) AND "Description" LIKE 'THE_DOMAIN_DEMO%';
COMMIT;
"@
$sql|docker compose -f docker/compose/docker-compose.local.yml exec -T postgres psql -U the_domain -d the_domain -v ON_ERROR_STOP=1|Out-Null
Write-Output 'Demo records were reset. Uploaded Cloudinary assets were only archived, never permanently deleted.'
