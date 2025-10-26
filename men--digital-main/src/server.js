import express from "express";
import pool from "./db.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("API del menú digital funcionando");
});

// Obtener todas las categorías
app.get("/api/categorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener categorías:", err.message);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// Agregar una nueva categoría
app.post("/api/categorias", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await pool.query(
      `INSERT INTO categorias (nombre, descripcion)
       VALUES ($1, $2) RETURNING *`,
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al agregar categoría:", err.message);
    res.status(500).json({ error: "Error al agregar categoría" });
  }
});

// Actualizar una categoría
app.put("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const result = await pool.query(
      `UPDATE categorias 
       SET nombre=$1, descripcion=$2 
       WHERE id=$3 RETURNING *`,
      [nombre, descripcion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar categoría:", err.message);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
});

// Eliminar una categoría
app.delete("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM categorias WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar categoría:", err.message);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});

// Iniciar servidor
console.clear();
console.log("Iniciando servidor...");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
