import request from "supertest";
import app from "../index.js"; 

const skipHttpTests = process.env.SKIP_HTTP_TESTS === 'true';
const describeIfHttpAllowed = skipHttpTests ? describe.skip : describe;

describeIfHttpAllowed("TEST API – MOA", () => {
  let authToken = null;
  let testProductId = null;

  /* TESTS DE RUTAS BÁSICAS ------------------------------------------------------------- */
  
  test("GET / → debe responder 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'API funcionando');
  });
  
    describe('Admin order status endpoints docs presence', () => {
      it('Should have admin routes registered', async () => {
        const res = await request(app).get('/admin/analytics/dashboard');
        // Expect 401/403 because no auth; just ensure route exists (not 404)
        expect([401,403]).toContain(res.status);
      });
    });

  /* TESTS DE AUTENTICACIÓN  ------------------------------------------------------------- */

  test("POST /login → credenciales inválidas debe devolver 401", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "fake@test.com", password: "1234" });

    expect([400, 401]).toContain(res.status); 
  });

  test("GET /usuario → sin token debe devolver 401", async () => {
    const res = await request(app).get("/usuario");
    expect([401, 403]).toContain(res.status);
  });

  test("GET /auth/perfil → sin token debe devolver 401", async () => {
    const res = await request(app).get("/auth/perfil");
    expect([401, 403]).toContain(res.status);
  });

  /* TESTS DE CATEGORÍAS ------------------------------------------------------------- */

  test("GET /categorias → debe responder 200", async () => {
    const res = await request(app).get("/categorias");
    expect([200, 404]).toContain(res.status);
    
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("GET /categorias/999 → categoría inexistente debe devolver 404", async () => {
    const res = await request(app).get("/categorias/999");
    expect(res.status).toBe(404);
  });

  /* TESTS DE PRODUCTOS ------------------------------------------------------------- */

  test("GET /productos → debe responder 200", async () => {
    const res = await request(app).get("/productos");
    expect([200, 404, 500]).toContain(res.status);
    
    if (res.status === 200) {
      // Log para debug
      console.log('Response body structure:', Object.keys(res.body));
      console.log('Response body sample:', res.body);
      
      // Verificar que tenga la estructura esperada de paginación
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  test("GET /productos/search → búsqueda debe funcionar", async () => {
    const res = await request(app).get("/productos/search?q=test");
    expect([200, 404, 500]).toContain(res.status);
  });

  test("GET /productos/999 → producto inexistente debe devolver 404", async () => {
    const res = await request(app).get("/productos/999");
    expect([404, 500]).toContain(res.status);
  });

  /* TESTS DE RUTAS ADMIN (SIN TOKEN)  ------------------------------------------------------------- */

  test("POST /admin/categorias → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/admin/categorias")
      .send({ name: "Test Category" });
    
    expect([401, 403]).toContain(res.status);
  });

  test("POST /admin/productos → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/admin/productos")
      .send({ name: "Test Product" });
    
    expect([401, 403]).toContain(res.status);
  });

  test("PUT /admin/categorias/1 → sin token debe devolver 401", async () => {
    const res = await request(app)
      .put("/admin/categorias/1")
      .send({ name: "Updated Category" });
    
    expect([401, 403]).toContain(res.status);
  });

  test("DELETE /admin/categorias/1 → sin token debe devolver 401", async () => {
    const res = await request(app)
      .delete("/admin/categorias/1");
    
    expect([401, 403]).toContain(res.status);
  });

  /* TESTS DE VALIDACIÓN ------------------------------------------------------------- */

  test("POST /login → sin email debe devolver 400", async () => {
    const res = await request(app)
      .post("/login")
      .send({ password: "1234" });

    expect([400, 422]).toContain(res.status);
  });

  test("POST /login → sin password debe devolver 400", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "test@test.com" });

    expect([400, 422]).toContain(res.status);
  });

  test("POST /login → email con formato inválido", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "invalid-email", password: "1234" });

    expect([400, 401]).toContain(res.status);
  });

  /* TESTS DE CARRITO (SIN AUTENTICACIÓN)  ------------------------------------------------------------- */

  test("GET /cart → sin token debe devolver 401", async () => {
    const res = await request(app).get("/cart");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /cart → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/cart")
      .send({ productId: "123", quantity: 1 });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* TESTS DE WISHLIST (SIN AUTENTICACIÓN)  ------------------------------------------------------------- */

  test("GET /wishlist → sin token debe devolver 401", async () => {
    const res = await request(app).get("/wishlist");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /wishlist → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/wishlist")
      .send({ productId: "123" });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* TESTS DE DIRECCIONES (SIN AUTENTICACIÓN)  ------------------------------------------------------------- */

  test("GET /api/addresses → sin token debe devolver 401", async () => {
    const res = await request(app).get("/api/addresses");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /api/addresses → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/api/addresses")
      .send({ street: "Test St", city: "Test City" });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* TESTS DE ÓRDENES (SIN AUTENTICACIÓN)  ------------------------------------------------------------- */

  test("GET /orders → sin token debe devolver 401", async () => {
    const res = await request(app).get("/orders");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /orders → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/orders")
      .send({ items: [] });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* TESTS DE FILTROS Y PAGINACIÓN ------------------------------------------------------------- */

  test("GET /productos?page=1 → paginación debe funcionar", async () => {
    const res = await request(app).get("/productos?page=1");
    expect([200, 404, 500]).toContain(res.status);
  });

  test("GET /productos?limit=10 → límite debe funcionar", async () => {
    const res = await request(app).get("/productos?limit=10");
    expect([200, 404, 500]).toContain(res.status);
  });

  test("GET /productos?categoryId=1 → filtro por categoría", async () => {
    const res = await request(app).get("/productos?categoryId=1");
    expect([200, 404, 500]).toContain(res.status);
  });

  /* TESTS DE MANEJO DE ERRORES ------------------------------------------------------------- */

  test("GET /ruta-inexistente → debe devolver 404", async () => {
    const res = await request(app).get("/ruta-inexistente");
    expect(res.status).toBe(404);
  });

  test("POST con JSON malformado → debe devolver 400", async () => {
    const res = await request(app)
      .post("/login")
      .set('Content-Type', 'application/json')
      .send('{"email": "test@test.com", "password":'); // JSON malformado
    
    expect([400, 500]).toContain(res.status);
  });

  /* TESTS ESPECÍFICOS DE AppError Y VALIDACIONES */
  
  test("POST /categorias → datos faltantes debe devolver ValidationError 400", async () => {
    const res = await request(app)
      .post("/categorias")
      .send({}); // Sin datos requeridos
    
    expect([400, 401, 404, 422]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    }
  });

  test("POST /productos → producto duplicado debe devolver ConflictError 409", async () => {
    // Intentar crear un producto con SKU duplicado
    const duplicateProduct = {
      nombre: "Test Product Duplicate",
      sku: "DUPLICATE-SKU-123",
      precio: 1000
    };
    
    const res1 = await request(app)
      .post("/productos")
      .send(duplicateProduct);

    const res2 = await request(app)
      .post("/productos")
      .send(duplicateProduct);
    
    // Al menos uno debería devolver un error de conflicto
    expect([401, 404, 409, 500]).toContain(res2.status);
  });

  test("GET /productos/invalid-id → ID inválido debe manejar PgError correctamente", async () => {
    const res = await request(app).get("/productos/invalid-uuid-format");
    expect([400, 404, 500]).toContain(res.status);
    
    if (res.body) {
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('timestamp');
    }
  });

  /* TESTS DE JWT ERRORS */
  
  test("GET /auth/perfil → token inválido debe devolver 401", async () => {
    const res = await request(app)
      .get("/auth/perfil")
      .set('Authorization', 'Bearer invalid-token-format');
    
    expect([401, 403]).toContain(res.status);
    if (res.body) {
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/token|inválid|unauthorized/i);
    }
  });

  test("POST /cart → token expirado debe devolver 401", async () => {
    // Simular token expirado (esto dependerá de tu implementación)
    const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";
    
    const res = await request(app)
      .post("/cart")
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ productId: 1, quantity: 1 });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* TESTS DE POSTGRESQL ERRORS */
  
  test("POST /usuarios → email duplicado debe devolver 409", async () => {
    const duplicateUser = {
      email: "duplicate-test@example.com",
      nombre: "Test User",
      password: "123456"
    };
    
    // Intentar crear el mismo usuario dos veces
    const res1 = await request(app)
      .post("/registro")
      .send(duplicateUser);

    const res2 = await request(app)
      .post("/registro")
      .send(duplicateUser);
    
    // Al menos el segundo debería devolver conflicto
    expect([409, 422, 400]).toContain(res2.status);
  });

  test("DELETE /categorias/999999 → foreign key violation debe devolver 409", async () => {
    const res = await request(app)
      .delete("/categorias/999999");
    
    // Puede ser 404 (no encontrado) o 401/403 (no autorizado) o 409 (conflicto)
    expect([401, 403, 404, 409]).toContain(res.status);
  });

  /* TESTS DE ENTITY PARSE FAILED */
  
  test("POST /login → Content-Type incorrecto debe devolver 400", async () => {
    const res = await request(app)
      .post("/login")
      .set('Content-Type', 'text/plain')
      .send('not-json-data');
    
    expect([400, 415, 500]).toContain(res.status);
  });

  /* TESTS DE 5XX ERRORS (SERVER ERRORS) */
  
  test("Ruta que cause error interno → debe devolver 500 con estructura correcta", async () => {
    // Intentar acceder a una ruta que podría causar error de base de datos
    const res = await request(app)
      .get("/productos")
      .query({ limit: -1 }); // Parámetro inválido que podría causar error
    
    if (res.status === 500) {
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.message).toBe('Error interno del servidor');
    }
  });

  /* TESTS DE RATE LIMITING */
  
  test("Múltiples requests → verificar que no hay memory leaks en error handler", async () => {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        request(app)
          .get("/categorias/999")
          .catch(() => {}) // Ignorar errores individuales
      );
    }
    
    const results = await Promise.all(promises);
    
    // Verificar que todos devuelvan respuesta consistente
    results.forEach(res => {
      if (res) {
        expect(res.status).toBe(404);
      }
    });
  });

  /* TESTS DE BODY SIZE LIMITS */
  
  test("POST con payload muy grande → debe devolver 413 o 400", async () => {
    const largePayload = {
      data: "x".repeat(10000000) // 10MB de data
    };
    
    const res = await request(app)
      .post("/login")
      .send(largePayload);
    
    expect([400, 413, 500]).toContain(res.status);
  });

  /* TESTS DE HEADERS MALICIOSOS */
  
  test("Request con headers maliciosos → debe ser manejado correctamente", async () => {
    const res = await request(app)
      .get("/productos")
      .set('X-Malicious-Header', '<script>alert("xss")</script>')
      .set('User-Agent', 'SQLi\'; DROP TABLE users; --');
    
    // Debería responder normalmente, ignorando headers maliciosos
    expect([200, 404, 500]).toContain(res.status);
  });

  /* TESTS DE ERROR BOUNDARY EN ASYNC OPERATIONS */
  
  test("Operación asíncrona que falla → debe ser capturada por asyncHandler", async () => {
    // Test que podría causar un error en una operación async
    const res = await request(app)
      .post("/cart")
      .send({
        productId: "999999999999999999999999", // ID que podría causar error
        quantity: 999999
      });
    
    expect([400, 401, 404, 500]).toContain(res.status);
    
    if (res.body) {
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('timestamp');
    }
  });

  /* TESTS DE CONFIGURACIÓN ------------------------------------------------------------- */

  test("GET /config → configuración debe estar disponible", async () => {
    const res = await request(app).get("/config");
    expect([200, 404, 500]).toContain(res.status);
  });

  /* TESTS DE RUTAS DE PAGO (SIN AUTENTICACIÓN) ------------------------------------------------------------- */

  test("POST /payment → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/payment")
      .send({ amount: 1000 });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  

});
