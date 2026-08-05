import mysql from "mysql2/promise";

console.log("🔍 DATABASE_URL configured:", !!process.env.DATABASE_URL);

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sodade",
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error conectando a la base de datos:", message);
  }
}

export default pool;
