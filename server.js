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
db.run(
  `CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT,
    completada BOOLEAN
  )`
);

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
  const { descripcion } = req.body;
  db.run(
    "INSERT INTO tareas (descripcion, completada) VALUES (?, ?)",
    [descripcion, false],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, descripcion, completada: false });
      }
    }
  );
});

// Endpoint para marcar una tarea como completada
app.put("/tareas/:id", (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  if (descripcion !== undefined) {
      db.run("UPDATE tareas SET descripcion = ? WHERE id = ?", [descripcion, id], function (err) {
          if (err) {
              res.status(500).json({ error: err.message });
          } else {
              res.json({ message: "Tarea editada correctamente" });
          }
      });
  } else {
      db.run("UPDATE tareas SET completada = NOT completada WHERE id = ?", [id], function (err) {
          if (err) {
              res.status(500).json({ error: err.message });
          } else {
              res.json({ message: "Estado de tarea actualizado" });
          }
      });
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
