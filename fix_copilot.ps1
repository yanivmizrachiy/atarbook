# 1. סגירת VS Code כדי לאפשר ניקוי
Write-Host "Closing VS Code..." -ForegroundColor Cyan
Stop-Process -Name "Code" -ErrorAction SilentlyContinue

# 2. עדכון VS Code לגרסה הכי חדשה שיש בשוק
Write-Host "Updating VS Code to the latest version..." -ForegroundColor Cyan
winget upgrade Microsoft.VisualStudioCode --silent --accept-source-agreements

# 3. ניקוי ה-Cache והקבצים הפגומים של הקופיילוט (זה הלב של התיקון)
Write-Host "Cleaning corrupted API cache..." -ForegroundColor Yellow
Remove-Item -Path "$env:USERPROFILE\.vscode\extensions\github.copilot*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Code\User\globalStorage\github.copilot*" -Recurse -Force -ErrorAction SilentlyContinue

# 4. התקנה מחדש של הגרסאות הכי חזקות (Pre-Release) דרך שורת הפקודה
Write-Host "Installing the BEST versions (Pre-Release) for Gemini 3 Pro..." -ForegroundColor Green
& "code" --install-extension github.copilot --pre-release
& "code" --install-extension github.copilot-chat --pre-release

Write-Host "SUCCESS! Everything is fresh and updated." -ForegroundColor Cyan
Write-Host "Now, open VS Code and sign in again if asked." -ForegroundColor White
