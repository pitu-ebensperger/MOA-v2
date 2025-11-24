#!/bin/bash

################################################################################
# Script de Backup PostgreSQL para MOA
# Descripción: Crea respaldo completo de la base de datos con timestamp
# Uso: ./backup-db.sh [output_dir]
################################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: Archivo .env no encontrado${NC}"
    exit 1
fi

# Configuración
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="moa_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
DAYS_TO_KEEP=7  # Mantener backups de los últimos 7 días

# Validar variables requeridas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_DATABASE" ]; then
    echo -e "${RED}Error: Variables DB_HOST, DB_USER o DB_DATABASE no definidas en .env${NC}"
    exit 1
fi

echo -e "${YELLOW}=== MOA Database Backup ===${NC}"
echo "Base de datos: ${DB_DATABASE}"
echo "Usuario: ${DB_USER}"
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Directorio: ${BACKUP_DIR}"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Ejecutar pg_dump
echo -e "${YELLOW}Iniciando backup...${NC}"

# Exportar PGPASSWORD para evitar prompt (solo durante el comando)
export PGPASSWORD="$DB_PASSWORD"

if pg_dump -h "$DB_HOST" \
           -p "${DB_PORT:-5432}" \
           -U "$DB_USER" \
           -d "$DB_DATABASE" \
           --clean \
           --if-exists \
           --create \
           --format=plain \
           --verbose \
           --file="$BACKUP_PATH" 2>&1; then
    
    # Comprimir backup
    echo -e "${YELLOW}Comprimiendo backup...${NC}"
    gzip "$BACKUP_PATH"
    COMPRESSED_FILE="${BACKUP_PATH}.gz"
    
    # Calcular tamaño
    SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup completado exitosamente${NC}"
    echo "Archivo: ${BACKUP_FILE}.gz"
    echo "Tamaño: ${SIZE}"
    echo "Ruta completa: ${COMPRESSED_FILE}"
    
    # Limpiar backups antiguos
    echo -e "${YELLOW}Limpiando backups antiguos (> ${DAYS_TO_KEEP} días)...${NC}"
    find "$BACKUP_DIR" -name "moa_backup_*.sql.gz" -type f -mtime +$DAYS_TO_KEEP -delete
    
    REMAINING=$(find "$BACKUP_DIR" -name "moa_backup_*.sql.gz" -type f | wc -l)
    echo -e "${GREEN}Backups actuales: ${REMAINING}${NC}"
    
else
    echo -e "${RED}✗ Error al crear backup${NC}"
    unset PGPASSWORD
    exit 1
fi

# Limpiar password de ambiente
unset PGPASSWORD

echo ""
echo -e "${GREEN}=== Backup finalizado ===${NC}"
echo ""
echo "Para restaurar este backup:"
echo "  gunzip -c ${COMPRESSED_FILE} | psql -h \$DB_HOST -U \$DB_USER -d postgres"
echo ""
