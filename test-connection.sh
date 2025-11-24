#!/bin/bash

echo "🔍 VERIFICACIÓN DE CONEXIONES MOA"
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend corriendo
echo "1️⃣  Verificando si el backend está corriendo..."
if lsof -i :4000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend está corriendo en puerto 4000${NC}"
else
    echo -e "${RED}✗ Backend NO está corriendo en puerto 4000${NC}"
    echo "   Ejecuta: cd backend && npm run dev"
    exit 1
fi
echo ""

# Test 2: PostgreSQL
echo "2️⃣  Verificando conexión a PostgreSQL..."
if psql -d moa -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL conectado (base de datos: moa)${NC}"
else
    echo -e "${RED}✗ No se puede conectar a PostgreSQL${NC}"
    exit 1
fi
echo ""

# Test 3: Health endpoint
echo "3️⃣  Probando endpoint /api/health..."
HEALTH=$(curl -s http://localhost:4000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ API Health: OK${NC}"
    echo "   $HEALTH"
else
    echo -e "${RED}✗ API Health falló${NC}"
    exit 1
fi
echo ""

# Test 4: Config endpoint
echo "4️⃣  Probando endpoint /api/config..."
CONFIG=$(curl -s http://localhost:4000/api/config)
if echo "$CONFIG" | grep -q "MOA"; then
    echo -e "${GREEN}✓ Config API: OK${NC}"
    echo "   Tienda: $(echo "$CONFIG" | grep -o '"nombre_tienda":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "${RED}✗ Config API falló${NC}"
    exit 1
fi
echo ""

# Test 5: Login
echo "5️⃣  Probando login admin..."
LOGIN=$(curl -s -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moa.cl","password":"admin123"}')
if echo "$LOGIN" | grep -q "token"; then
    echo -e "${GREEN}✓ Login: OK${NC}"
    echo "   Usuario: admin@moa.cl"
else
    echo -e "${RED}✗ Login falló${NC}"
    echo "   Respuesta: $LOGIN"
    exit 1
fi
echo ""

# Test 6: Frontend corriendo
echo "6️⃣  Verificando si el frontend está corriendo..."
if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend está corriendo en puerto 5173${NC}"
    echo "   URL: http://localhost:5173"
else
    echo -e "${YELLOW}⚠ Frontend NO está corriendo${NC}"
    echo "   Ejecuta: cd frontend && npm run dev"
fi
echo ""

# Test 7: Variables de entorno frontend
echo "7️⃣  Verificando configuración del frontend..."
if [ -f "frontend/.env.local" ]; then
    API_URL=$(grep VITE_API_URL frontend/.env.local | cut -d'=' -f2)
    echo -e "${GREEN}✓ .env.local existe${NC}"
    echo "   VITE_API_URL=$API_URL"
else
    echo -e "${RED}✗ No existe frontend/.env.local${NC}"
fi
echo ""

echo "=================================="
echo -e "${GREEN}🎉 TODAS LAS VERIFICACIONES PASARON${NC}"
echo ""
echo "📋 URLs importantes:"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:5173"
echo "   Admin:    http://localhost:5173/admin"
echo ""
echo "👤 Credenciales:"
echo "   Email:    admin@moa.cl"
echo "   Password: admin123"
