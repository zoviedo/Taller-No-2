const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database("./tareas.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

// Crear la tabla de tareas si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descripcion TEXT,
      completada BOOLEAN
  )
`);

// Endpoint para obtener todas las tareas
app.get("/tareas", (req, res) => {
  db.all("SELECT * FROM tareas", [], (err, filas) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(filas);
    }
  });
});

// Endpoint para agregar una nueva tarea
app.post("/tareas", (req, res) => {
  const { titulo, descripcion } = req.body;
  db.run(
      "INSERT INTO tareas (titulo, descripcion, completada) VALUES (?, ?, ?)",
      [titulo, descripcion, false],
      function (err) {
          if (err) {
              res.status(500).json({ error: err.message });
          } else {
              res.json({ id: this.lastID, titulo, descripcion, completada: false });
          }
      }
  );
});

// Endpoint para marcar una tarea como completada
app.put("/tareas/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, completada } = req.body; 

  if (titulo !== undefined && descripcion !== undefined) {
      db.run(
        "UPDATE tareas SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion) WHERE id = ?",
        [titulo, descripcion, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "Tarea actualizada correctamente" });
            }
        }
    );
  } else if (completada !== undefined) {
      db.run("UPDATE tareas SET completada = ? WHERE id = ?", [completada, id], function (err) {
          if (err) {
              res.status(500).json({ error: err.message });
          } else {
              res.json({ message: "Estado actualizado" });
          }
      });
  } else {
      res.status(400).json({ error: "Datos inválidos" });
  }
});



// Endpoint para eliminar una tarea
app.delete("/tareas/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tareas WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Tarea eliminada correctamente" });
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
