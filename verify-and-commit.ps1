$ErrorActionPreference="Stop"; $ProgressPreference="SilentlyContinue"; param([Parameter(Mandatory=$true)][string]$Message)
function Fail($m){Write-Host ("❌ "+$m) -ForegroundColor Red; exit 1}
function Ok($m){Write-Host ("✅ "+$m) -ForegroundColor Green}
git rev-parse --is-inside-work-tree *> $null 2>&1; if($LASTEXITCODE -ne 0){Fail "Not a git repo."}
git add -A
$st = git diff --name-only --cached
if(-not $st){Fail "Nothing staged."}
$changed = $st -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$nonDoc = $changed | Where-Object { $_ -notmatch "^(DEPLOYMENT_REPORT\.md|README\.md)$" }
if(($nonDoc.Count -gt 0) -and (-not ($changed -contains "rules.html"))){Fail "rules.html must be included in every change."}
$r = Get-Content -Raw -Encoding UTF8 "rules.html"; if($r -notmatch "<title>\s*כללים\s*</title>"){Fail "rules title wrong"}; if($r -notmatch "<h1>\s*כללים\s*</h1>"){Fail "rules h1 wrong"}
$a = Get-Content -Raw -Encoding UTF8 "assets/app.js"; if($a -notmatch "activeProfile"){Fail "activeProfile missing"}
Ok "VERIFY PASS"; git commit -m $Message; git push origin main; Ok "Pushed"