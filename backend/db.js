import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "formacero_rrhh"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error conexión DB:", err);
  } else {
    console.log("✅ MySQL conectado");
  }
});