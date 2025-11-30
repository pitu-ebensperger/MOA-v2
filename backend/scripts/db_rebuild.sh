#!/usr/bin/env bash
set -euo pipefail

# Uso: ./db_rebuild.sh [OPTIONS]
# Opciones:
#   --no-backup       Skip backup creation
#   --no-confirm      Skip confirmation prompt
#   --db NAME         Database name (default: moa)
#   --user NAME       PostgreSQL user (default: postgres)
#   -h, --help        Show this help

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DB_NAME="moa"
DB_USER="${PGUSER:-postgres}"
DO_BACKUP=true
DO_CONFIRM=true

# Directories
DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_DIR="$DIR/database/backups"
SCHEMA_DIR="$DIR/database/schema"

# Functions
print_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_help() {
    head -n 11 "$0" | tail -n 8
    exit 0
}

check_postgres_running() {
    if ! pg_isready -U "$DB_USER" -q; then
        print_error "PostgreSQL is not running or not accessible"
        exit 1
    fi
}

check_schema_files() {
    local missing=0
    
    if [ ! -f "$SCHEMA_DIR/DDL_base.sql" ]; then
        print_error "Schema file not found: DDL_base.sql"
        missing=1
    fi
    
    if [ ! -f "$SCHEMA_DIR/DDL_admin.sql" ]; then
        print_error "Schema file not found: DDL_admin.sql"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        exit 1
    fi
}

database_exists() {
    psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

create_backup() {
    if ! database_exists; then
        print_warning "Database '$DB_NAME' does not exist, skipping backup"
        return 0
    fi
    
    mkdir -p "$BACKUP_DIR"
    local backup_file="$BACKUP_DIR/${DB_NAME}-$(date +%F-%H%M%S).dump"
    
    print_info "Creating backup: $(basename "$backup_file")"
    if pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$backup_file" 2>/dev/null; then
        print_success "Backup created successfully"
        
        # Guardar solo 10 copias de seguridad + recientes
        ls -t "$BACKUP_DIR"/*.dump 2>/dev/null | tail -n +11 | xargs -r rm
    else
        print_warning "Backup failed, but continuing..."
    fi
}

confirm_action() {
    if [ "$DO_CONFIRM" = false ]; then
        return 0
    fi
    
    echo
    print_warning "This will DESTROY all data in database '$DB_NAME'"
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Operation cancelled"
        exit 0
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            DO_BACKUP=false
            shift
            ;;
        --no-confirm)
            DO_CONFIRM=false
            shift
            ;;
        --db)
            DB_NAME="$2"
            shift 2
            ;;
        --user)
            DB_USER="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Main execution
main() {
    print_info "Database Rebuild Script"
    print_info "Database: $DB_NAME | User: $DB_USER"
    echo
    
    # Pre-flight checks
    check_postgres_running
    check_schema_files
    
    # Confirm destructive action
    confirm_action
    
    # Backup if requested
    if [ "$DO_BACKUP" = true ]; then
        create_backup
    fi
    
    # Drop and recreate database
    print_info "Dropping database '$DB_NAME'..."
    psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" -q
    
    print_info "Creating database '$DB_NAME'..."
    psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" -q
    
    # Apply schemas
    print_info "Applying base schema..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_DIR/DDL_base.sql" -q
    print_success "Base schema applied"
    
    print_info "Applying admin schema..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_DIR/DDL_admin.sql" -q
    print_success "Admin schema applied"
    
    echo
    print_success "Database rebuild complete!"
    print_info "Next step: npm run -w backend seed:all"
}

# Run main function
main
