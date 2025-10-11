# Script per avviare ngrok e testare le notifiche push da telefono
# Ngrok crea un tunnel HTTPS pubblico al tuo server locale

Write-Host "🌐 === SETUP NGROK PER TEST NOTIFICHE PUSH ===" -ForegroundColor Cyan
Write-Host ""

# Verifica se ngrok è installato
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (!$ngrokInstalled) {
    Write-Host "❌ ngrok non è installato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Per installare ngrok:" -ForegroundColor Yellow
    Write-Host "   1. Vai su: https://ngrok.com/download" -ForegroundColor White
    Write-Host "   2. Scarica ngrok per Windows" -ForegroundColor White
    Write-Host "   3. Estrai ngrok.exe in questa cartella o in C:\Windows" -ForegroundColor White
    Write-Host "   4. Registrati su ngrok.com e ottieni un auth token" -ForegroundColor White
    Write-Host "   5. Esegui: ngrok config add-authtoken <il-tuo-token>" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Oppure usa Chocolatey:" -ForegroundColor Yellow
    Write-Host "   choco install ngrok" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host "✅ ngrok trovato!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Avvio tunnel HTTPS per porta 3001..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Quando ngrok si avvia, vedrai un URL tipo:" -ForegroundColor Cyan
Write-Host "   https://abc123.ngrok-free.app" -ForegroundColor White
Write-Host ""
Write-Host "📋 Usa quell'URL dal telefono per testare le notifiche!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  NOTA: Il tunnel gratuito ha un banner, ma funziona!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Premere Ctrl+C per fermare ngrok" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Avvia ngrok
ngrok http 3001
