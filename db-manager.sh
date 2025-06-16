#!/usr/bin/env bash

# Script di gestione database per Maskio Barber
# Assicurati che il server sia avviato su localhost:3000

API_BASE="http://localhost:3000"

echo "🗄️ MASKIO BARBER - Database Management Tool"
echo "============================================="

if [ "$1" = "status" ]; then
    echo "📊 Recuperando stato del database..."
    curl -s "$API_BASE/api/admin/database-status" | jq '.' || echo "❌ Errore: assicurati che il server sia avviato e che jq sia installato"

elif [ "$1" = "clean" ]; then
    ACTION=${2:-"all"}
    echo "🧹 Pulizia database: $ACTION"
    echo "⚠️  ATTENZIONE: Questa operazione è IRREVERSIBILE!"
    read -p "Sei sicuro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -s -X POST "$API_BASE/api/admin/database-cleanup" \
             -H "Content-Type: application/json" \
             -d "{\"action\":\"$ACTION\"}" | jq '.' || echo "❌ Errore nella pulizia"
    else
        echo "❌ Operazione annullata"
    fi

elif [ "$1" = "promote" ]; then
    EMAIL=$2
    ROLE=${3:-"admin"}
    
    if [ -z "$EMAIL" ]; then
        echo "❌ Errore: Specificare l'email dell'utente"
        echo "📖 Uso: ./db-manager.sh promote <email> [admin|barber|user]"
        exit 1
    fi
    
    echo "👑 Promozione utente $EMAIL a $ROLE"
    curl -s -X POST "$API_BASE/api/admin/promote-user" \
         -H "Content-Type: application/json" \
         -d "{\"email\":\"$EMAIL\",\"role\":\"$ROLE\"}" | jq '.' || echo "❌ Errore nella promozione"

else
    echo "📖 Comandi disponibili:"
    echo "  ./db-manager.sh status                    - Mostra stato database"
    echo "  ./db-manager.sh clean [users|bookings|all] - Pulisci database"
    echo "  ./db-manager.sh promote <email> [role]    - Promuovi utente"
    echo ""
    echo "📋 Esempi:"
    echo "  ./db-manager.sh status"
    echo "  ./db-manager.sh clean all"
    echo "  ./db-manager.sh promote fabio.cassano97@icloud.com admin"
    echo ""
    echo "⚠️  NOTA: Il server deve essere avviato su localhost:3000"
fi
