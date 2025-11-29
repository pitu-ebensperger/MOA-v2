import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login Fix...\n');
  
  try {
    // 1. Login como admin
    console.log('[1] Intentando login con admin@moa.cl...');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@moa.cl',
        password: 'admin123'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login falló: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    console.log('Login exitoso');
    console.log('   Token recibido:', loginData.token.substring(0, 20) + '...');
    console.log('   Usuario:', loginData.user);
    console.log('   rol_code:', loginData.user.rol_code);
    
    // Verificar que rol_code existe y es ADMIN
    if (!loginData.user.rol_code) {
      throw new Error('❌ FALLO: rol_code es undefined o null');
    }
    
    if (loginData.user.rol_code !== 'ADMIN') {
      throw new Error(`❌ FALLO: rol_code es "${loginData.user.rol_code}", esperaba "ADMIN"`);
    }
    
    console.log('rol_code es ADMIN correctamente\n');
    
    // 2. Probar endpoint de perfil
    console.log('[2] Probando GET /usuario con token admin...');
    const profileRes = await fetch(`${API_URL}/usuario`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!profileRes.ok) {
      throw new Error(`Profile falló: ${profileRes.status}`);
    }
    
    const profile = await profileRes.json();
    console.log('Perfil obtenido');
    console.log('   Perfil:', profile);
    console.log('   rol_code en perfil:', profile.rol_code);
    
    if (profile.rol_code !== 'ADMIN') {
      throw new Error(`❌ FALLO: rol_code en perfil es "${profile.rol_code}"`);
    }
    
    console.log('rol_code en perfil es ADMIN correctamente\n');
    
    // 3. Probar endpoint admin protegido
    console.log('[3] Probando endpoint admin GET /admin/categorias...');
    const adminRes = await fetch(`${API_URL}/admin/categorias`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    console.log('   Status:', adminRes.status);
    
    if (adminRes.status === 403) {
      throw new Error('❌ FALLO: Recibió 403 Forbidden - middleware verifyAdmin no reconoce al usuario como admin');
    }
    
    if (!adminRes.ok && adminRes.status !== 404) {
      throw new Error(`Admin endpoint falló: ${adminRes.status}`);
    }
    
    console.log('Acceso admin autorizado correctamente\n');
    
    console.log('🎉 TODAS LAS PRUEBAS PASARON - FIX EXITOSO!\n');
    console.log('Resumen:');
    console.log('- Login devuelve rol_code: ADMIN [OK]');
    console.log('- Perfil devuelve rol_code: ADMIN [OK]');
    console.log('- Middleware verifyAdmin autoriza correctamente [OK]');
    
  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error.message);
    process.exit(1);
  }
}

testAdminLogin();
