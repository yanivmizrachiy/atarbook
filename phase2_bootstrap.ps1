$ErrorActionPreference="Stop"
$ProgressPreference="SilentlyContinue"
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)

function Fail($m){Write-Host ("❌ "+$m) -ForegroundColor Red; exit 1}
function Ok($m){Write-Host ("✅ "+$m) -ForegroundColor Green}
function Info($m){Write-Host ("🔹 "+$m) -ForegroundColor Cyan}

git rev-parse --is-inside-work-tree *> $null 2>&1
if($LASTEXITCODE -ne 0){Fail "Not a git repo"}

if(git status --porcelain){Fail "Working tree not clean. Commit/stash first."}

$root=$PWD.Path
$rulesPath=Join-Path $root "rules.html"
$indexPath=Join-Path $root "index.html"
$appPath=Join-Path $root "assets\app.js"
$stylePath=(Test-Path (Join-Path $root "assets\styles.css")) ? (Join-Path $root "assets\styles.css") : ((Test-Path (Join-Path $root "assets\style.css")) ? (Join-Path $root "assets\style.css") : $null)
if(-not $stylePath){Fail "Missing assets/styles.css or assets/style.css"}
if(-not (Test-Path $rulesPath)){Fail "Missing rules.html"}
if(-not (Test-Path $indexPath)){Fail "Missing index.html"}
if(-not (Test-Path $appPath)){Fail "Missing assets/app.js"}

$ts=(Get-Date -Format "yyyyMMdd_HHmmss")
$bk=Join-Path $root ".backup_fix_$ts"
New-Item -ItemType Directory -Force -Path $bk *> $null
Copy-Item $rulesPath (Join-Path $bk "rules.html") -Force
Copy-Item $indexPath (Join-Path $bk "index.html") -Force
Copy-Item $appPath (Join-Path $bk "app.js") -Force
Copy-Item $stylePath (Join-Path $bk (Split-Path $stylePath -Leaf)) -Force
Info "Backup: $bk"

$enc=[Text.UTF8Encoding]::new($false)

# --- rules: add Change Log + entry
$rules=[IO.File]::ReadAllText($rulesPath,$enc)
if($rules -notmatch "<title>\s*כללים\s*</title>"){Fail "rules.html title must be כללים"}
if($rules -notmatch "<h1>\s*כללים\s*</h1>"){Fail "rules.html h1 must be כללים"}
if($rules -notmatch "Change Log"){
  $ins="`r`n<section>`r`n  <h2>Change Log</h2>`r`n  <p>כל שינוי חייב להיות מתועד כאן. ללא תיעוד – אין commit.</p>`r`n  <ul id=""changeLog""></ul>`r`n</section>`r`n"
  $rules=$rules -replace "</main>",$ins+"</main>"
}
$rules=[Regex]::Replace($rules,"<ul id=""changeLog""></ul>","<ul id=""changeLog"">`r`n<li>"+(Get-Date -Format "yyyy-MM-dd HH:mm")+" — Governance/PWA/Diagnostics bootstrap</li>`r`n</ul>",1)
[IO.File]::WriteAllText($rulesPath,$rules,$enc)
Info "rules.html updated"

# --- PWA files
$manifest=@('{','  "name": "atarbook",','  "short_name": "atarbook",','  "start_url": "./",','  "display": "standalone",','  "background_color": "#ffffff",','  "theme_color": "#2f6fe4",','  "icons": []','}')
[IO.File]::WriteAllText((Join-Path $root "manifest.webmanifest"),($manifest -join "`r`n"),$enc)

$sw=@("const CACHE='atarbook-v2';","const ASSETS=['./','./index.html','./rules.html','./assets/app.js','./assets/"+(Split-Path $stylePath -Leaf)+"','./manifest.webmanifest'];","self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));","self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));","self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));")
[IO.File]::WriteAllText((Join-Path $root "sw.js"),($sw -join "`r`n"),$enc)
Info "PWA files created"

# --- index: manifest + sw register
$idx=[IO.File]::ReadAllText($indexPath,$enc)
if($idx -notmatch "manifest\.webmanifest"){
  $idx=$idx -replace "</head>","  <link rel=""manifest"" href=""manifest.webmanifest"">`r`n  <meta name=""theme-color"" content=""#2f6fe4"">`r`n  <script>if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}</script>`r`n</head>"
  [IO.File]::WriteAllText($indexPath,$idx,$enc)
}
Info "index.html updated"

# --- css: body transition
$css=[IO.File]::ReadAllText($stylePath,$enc)
if($css -notmatch "--transition"){ $css=":root{ --transition:320ms ease; }`r`n"+$css }
if($css -notmatch "body\{[^}]*transition:"){ $css=[Regex]::Replace($css,"body\{","body{ transition: background var(--transition), color var(--transition); ",1) }
[IO.File]::WriteAllText($stylePath,$css,$enc)
Info "CSS updated"

# --- app: diagnostics
$app=[IO.File]::ReadAllText($appPath,$enc)
if($app -notmatch "activeProfile"){Fail "activeProfile missing in app.js"}
if($app -notmatch "window\.runDiagnostics"){
  $app+="`r`n`r`nwindow.runDiagnostics=function(){ const out={ok:true,issues:[]}; try{ const ap=localStorage.getItem('activeProfile'); if(!ap){out.ok=false; out.issues.push('missing activeProfile');}}catch(e){out.ok=false; out.issues.push(e.message);} console.log('[ATARBOOK DIAGNOSTICS]',out); return out; };"
  [IO.File]::WriteAllText($appPath,$app,$enc)
}
Info "app.js updated"

# --- governance script
$verify=@(
'$ErrorActionPreference="Stop"; $ProgressPreference="SilentlyContinue"; param([Parameter(Mandatory=$true)][string]$Message)',
'function Fail($m){Write-Host ("❌ "+$m) -ForegroundColor Red; exit 1}',
'function Ok($m){Write-Host ("✅ "+$m) -ForegroundColor Green}',
'git rev-parse --is-inside-work-tree *> $null 2>&1; if($LASTEXITCODE -ne 0){Fail "Not a git repo."}',
'git add -A',
'$st = git diff --name-only --cached',
'if(-not $st){Fail "Nothing staged."}',
'$changed = $st -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }',
'$nonDoc = $changed | Where-Object { $_ -notmatch "^(DEPLOYMENT_REPORT\.md|README\.md)$" }',
'if(($nonDoc.Count -gt 0) -and (-not ($changed -contains "rules.html"))){Fail "rules.html must be included in every change."}',
'$r = Get-Content -Raw -Encoding UTF8 "rules.html"; if($r -notmatch "<title>\s*כללים\s*</title>"){Fail "rules title wrong"}; if($r -notmatch "<h1>\s*כללים\s*</h1>"){Fail "rules h1 wrong"}',
'$a = Get-Content -Raw -Encoding UTF8 "assets/app.js"; if($a -notmatch "activeProfile"){Fail "activeProfile missing"}',
'Ok "VERIFY PASS"; git commit -m $Message; git push origin main; Ok "Pushed"'
)
[IO.File]::WriteAllText((Join-Path $root "verify-and-commit.ps1"),($verify -join "`r`n"),$enc)
Info "verify-and-commit.ps1 created"

git add -A
git commit -m "feat: governance + pwa + diagnostics bootstrap"
git push origin main
Ok "DONE ✅"
