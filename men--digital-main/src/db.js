import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool; // ESTA LÍNEA ES LA CLAVE

// Solo si querés probar conexión manualmente
// (podés comentar esta parte cuando el servidor ya funcione)
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conectado a Neon con éxito:', result.rows[0]);
  } catch (error) {
    console.error('Error al conectar con Neon:', error.message);
  } finally {
    pool.end();
  }
}

// testConnection(); // Comentá o borra esta línea si ya no la necesitás
