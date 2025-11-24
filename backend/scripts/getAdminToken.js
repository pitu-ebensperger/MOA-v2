async function main() {
  try {
    const res = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@moa.cl', password: 'admin123' })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    if (e?.cause?.code === 'ECONNREFUSED') {
      console.error('Token request failed: backend is not reachable on http://localhost:4000. Start it with `npm run -w backend dev`.');
    } else {
      console.error('Token request failed', e);
    }
    process.exit(1);
  }
}
main();
