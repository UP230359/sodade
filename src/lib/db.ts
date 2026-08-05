import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "sodade_app",
  password: process.env.DB_PASSWORD || "changeme",
  database: process.env.DB_NAME || "sodade",
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
// Prueba rápida de conexión (puedes borrar esto después)
async function testConnection() {
  try {
    // Intenta obtener una conexión del pool
    const connection = await pool.getConnection();
    console.log("✅ ¡Conexión exitosa a la base de datos MySQL!");

    // Opcional: Hacer una consulta real para ver tu usuario
    const [rows] = await connection.query("SELECT email FROM users;");
    console.log("Usuarios en la BD:", rows);

    // Siempre libera la conexión cuando termines
    connection.release();
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error.message);
  }
}

testConnection();
