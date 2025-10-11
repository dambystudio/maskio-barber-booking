# Script per scaricare ngrok
Write-Host "Download ngrok..." -ForegroundColor Cyan

$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$downloadPath = "$env:TEMP\ngrok.zip"
$extractPath = "$PSScriptRoot"

try {
    # Download
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "Download completato!" -ForegroundColor Green
    
    # Estrazione
    Write-Host "Estrazione ngrok.exe..." -ForegroundColor Yellow
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    Remove-Item $downloadPath -Force
    
    Write-Host ""
    Write-Host "SUCCESSO! ngrok installato" -ForegroundColor Green
    Write-Host ""
    Write-Host "PROSSIMI PASSI:" -ForegroundColor Cyan
    Write-Host "1. Vai su: https://dashboard.ngrok.com/signup" -ForegroundColor White
    Write-Host "2. Registrati GRATIS" -ForegroundColor White
    Write-Host "3. Copia il tuo authtoken da: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "4. Esegui: .\ngrok.exe config add-authtoken [TUO_TOKEN]" -ForegroundColor White
    Write-Host "5. Avvia: .\ngrok.exe http 3001" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "ERRORE: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa - Download manuale da: https://ngrok.com/download" -ForegroundColor Yellow
}
