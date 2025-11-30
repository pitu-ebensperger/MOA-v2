#!/usr/bin/env bash
set -euo pipefail

# Install PostgreSQL database from schema files (non-destructive).
# Only creates database if it doesn't exist. Safe for first-time setup.
# Usage: ./db_install.sh [OPTIONS]
# Options:
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

# Directories
DIR=$(cd "$(dirname "$0")/.." && pwd)
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
    head -n 10 "$0" | tail -n 7
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

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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
    print_info "Database Install Script (non-destructive)"
    print_info "Database: $DB_NAME | User: $DB_USER"
    echo
    
    # Pre-flight checks
    check_postgres_running
    check_schema_files
    
    # Check if database already exists
    if database_exists; then
        print_success "Database '$DB_NAME' already exists"
        print_info "Skipping installation (use db_rebuild.sh for full reset)"
        exit 0
    fi
    
    # Create database
    print_info "Creating database '$DB_NAME'..."
    psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" -q
    print_success "Database created"
    
    # Apply schemas
    print_info "Applying base schema..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_DIR/DDL_base.sql" -q
    print_success "Base schema applied"
    
    print_info "Applying admin schema..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_DIR/DDL_admin.sql" -q
    print_success "Admin schema applied"
    
    echo
    print_success "Database installation complete!"
    print_info "Next step: npm run -w backend seed:all"
}

# Run main function
main
