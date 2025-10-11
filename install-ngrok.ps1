# Script per scaricare e installare ngrok manualmente
Write-Host "📥 === DOWNLOAD E INSTALLAZIONE NGROK ===" -ForegroundColor Cyan
Write-Host ""

$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$downloadPath = "$env:TEMP\ngrok.zip"
$extractPath = "$PSScriptRoot"

Write-Host "⬇️  Download ngrok da equinox.io..." -ForegroundColor Yellow

try {
    # Download con progress bar
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "✅ Download completato!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📦 Estrazione ngrok.exe..." -ForegroundColor Yellow
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    
    # Rimuovi il file zip
    Remove-Item $downloadPath -Force
    
    Write-Host "✅ ngrok.exe estratto in: $extractPath" -ForegroundColor Green
    Write-Host ""
    
    # Verifica installazione
    if (Test-Path "$extractPath\ngrok.exe") {
        Write-Host "🎉 ngrok installato con successo!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 PROSSIMI PASSI:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Registrati su ngrok (GRATIS):" -ForegroundColor Yellow
        Write-Host "   https://dashboard.ngrok.com/signup" -ForegroundColor White
        Write-Host ""
        Write-Host "2. Copia il tuo authtoken da:" -ForegroundColor Yellow
        Write-Host "   https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Esegui questo comando (sostituisci con il tuo token):" -ForegroundColor Yellow
        Write-Host "   .\ngrok.exe config add-authtoken [IL_TUO_TOKEN]" -ForegroundColor White
        Write-Host ""
        Write-Host "4. Avvia il tunnel:" -ForegroundColor Yellow
        Write-Host "   .\ngrok.exe http 3001" -ForegroundColor White
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "💡 Vuoi che avvii ngrok automaticamente? (y/n)" -ForegroundColor Cyan
        $response = Read-Host
        
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host ""
            Write-Host "🚀 Avvio ngrok http 3001..." -ForegroundColor Yellow
            Write-Host ""
            & "$extractPath\ngrok.exe" http 3001
        }
    } else {
        Write-Host "❌ Errore: ngrok.exe non trovato dopo l'estrazione" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Errore durante il download: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Alternativa - Download manuale:" -ForegroundColor Yellow
    Write-Host "1. Vai su: https://ngrok.com/download" -ForegroundColor White
    Write-Host "2. Scarica la versione per Windows" -ForegroundColor White
    Write-Host "3. Estrai ngrok.exe in questa cartella" -ForegroundColor White
}
