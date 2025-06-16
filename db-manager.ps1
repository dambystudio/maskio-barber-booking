# Script PowerShell per gestione database Maskio Barber
# Assicurati che il server sia avviato su localhost:3000

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Parameter1,
    
    [Parameter(Mandatory=$false)]
    [string]$Parameter2
)

$API_BASE = "http://localhost:3000"

Write-Host "Database Management Tool - MASKIO BARBER" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

switch ($Command) {
    "status" {
        Write-Host "Recuperando stato del database..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "$API_BASE/api/admin/database-status" -Method GET
            $response | ConvertTo-Json -Depth 10
        } catch {
            Write-Host "Errore: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Assicurati che il server sia avviato su localhost:3000" -ForegroundColor Yellow
        }
    }
    
    "clean" {
        $action = if ($Parameter1) { $Parameter1 } else { "all" }
        Write-Host "Pulizia database: $action" -ForegroundColor Yellow
        Write-Host "ATTENZIONE: Questa operazione e' IRREVERSIBILE!" -ForegroundColor Red
        
        $confirm = Read-Host "Sei sicuro? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            try {
                $body = @{ action = $action } | ConvertTo-Json
                $response = Invoke-RestMethod -Uri "$API_BASE/api/admin/database-cleanup" -Method POST -Body $body -ContentType "application/json"
                $response | ConvertTo-Json -Depth 10
            } catch {
                Write-Host "Errore nella pulizia: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "Operazione annullata" -ForegroundColor Red
        }
    }
    
    "promote" {
        $email = $Parameter1
        $role = if ($Parameter2) { $Parameter2 } else { "admin" }
        
        if (-not $email) {
            Write-Host "Errore: Specificare l'email dell'utente" -ForegroundColor Red
            Write-Host "Uso: .\db-manager.ps1 promote EMAIL [admin|barber|user]" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Promozione utente $email a $role" -ForegroundColor Yellow
        try {
            $body = @{ email = $email; role = $role } | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$API_BASE/api/admin/promote-user" -Method POST -Body $body -ContentType "application/json"
            $response | ConvertTo-Json -Depth 10
        } catch {
            Write-Host "Errore nella promozione: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "Comandi disponibili:" -ForegroundColor Green
        Write-Host "  .\db-manager.ps1 status                        - Mostra stato database" -ForegroundColor White
        Write-Host "  .\db-manager.ps1 clean [users|bookings|all]    - Pulisci database" -ForegroundColor White
        Write-Host "  .\db-manager.ps1 promote EMAIL [role]          - Promuovi utente" -ForegroundColor White
        Write-Host ""
        Write-Host "Esempi:" -ForegroundColor Green
        Write-Host "  .\db-manager.ps1 status" -ForegroundColor Gray
        Write-Host "  .\db-manager.ps1 clean all" -ForegroundColor Gray
        Write-Host "  .\db-manager.ps1 promote fabio.cassano97@gmail.com barber" -ForegroundColor Gray
        Write-Host ""
        Write-Host "NOTA: Il server deve essere avviato su localhost:3000" -ForegroundColor Yellow
    }
}
