# Script per creare certificati SSL auto-firmati per sviluppo locale
# Questo permette di testare Service Workers su dispositivi mobili

Write-Host "🔐 === CREAZIONE CERTIFICATI SSL AUTO-FIRMATI ===" -ForegroundColor Cyan
Write-Host ""

# Crea directory per i certificati
$certDir = ".\certs"
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
    Write-Host "✅ Directory certs creata" -ForegroundColor Green
}

# Ottieni l'IP locale
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -like "192.168.*"}).IPAddress
Write-Host "🌐 IP locale rilevato: $ip" -ForegroundColor Yellow
Write-Host ""

# Crea il certificato auto-firmato
Write-Host "📜 Creazione certificato SSL..." -ForegroundColor Yellow

$cert = New-SelfSignedCertificate `
    -DnsName "localhost", $ip, "*.local" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(10) `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -KeyUsage DigitalSignature, KeyEncipherment `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1,1.3.6.1.5.5.7.3.2") `
    -FriendlyName "Maskio Barber Development Certificate"

Write-Host "✅ Certificato creato: $($cert.Thumbprint)" -ForegroundColor Green

# Esporta certificato
$certPath = "$certDir\localhost.crt"
$keyPath = "$certDir\localhost.key"

# Esporta il certificato in formato PFX (con chiave privata)
$pfxPath = "$certDir\localhost.pfx"
$pfxPassword = ConvertTo-SecureString -String "maskio-dev" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pfxPassword | Out-Null

Write-Host "✅ Certificato PFX esportato: $pfxPath" -ForegroundColor Green
Write-Host "   Password: maskio-dev" -ForegroundColor Gray
Write-Host ""

# Converti PFX in formato PEM per Next.js
Write-Host "🔄 Conversione in formato PEM..." -ForegroundColor Yellow

# Esporta certificato pubblico
$certContent = @"
-----BEGIN CERTIFICATE-----
$([Convert]::ToBase64String($cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert), [System.Base64FormattingOptions]::InsertLineBreaks))
-----END CERTIFICATE-----
"@

$certContent | Out-File -FilePath $certPath -Encoding ASCII
Write-Host "✅ Certificato pubblico salvato: $certPath" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Per usare HTTPS con Next.js:" -ForegroundColor Yellow
Write-Host "   1. Installa: npm install --save-dev local-ssl-proxy" -ForegroundColor White
Write-Host "   2. Avvia proxy SSL: npx local-ssl-proxy --source 3002 --target 3001 --cert $certPath --key $certPath" -ForegroundColor White
Write-Host "   3. Oppure usa: npm run dev:https (se configurato)" -ForegroundColor White
Write-Host ""
Write-Host "📱 Sul telefono, accedi a: https://${ip}:3002" -ForegroundColor Cyan
Write-Host "   (Ignora l'avviso di sicurezza del browser)" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Certificati creati con successo!" -ForegroundColor Green
