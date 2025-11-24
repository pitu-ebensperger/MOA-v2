#!/usr/bin/env bash
set -euo pipefail

# Remove SQL comments (lines starting with --) producing a cleaned file
# Usage: ./strip_comments.sh path/to/input.sql path/to/output.sql

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 input.sql output.sql"
  exit 1
fi

INPUT="$1"
OUTPUT="$2"

awk '!/^\s*--/' "$INPUT" > "$OUTPUT"
echo "Wrote cleaned SQL to $OUTPUT"
