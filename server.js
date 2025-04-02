const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

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
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    completada BOOLEAN DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para obtener todas las tareas
app.get("/tareas", (req, res) => {
  db.all("SELECT * FROM tareas", [], (err, filas) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Siempre devolver un array, incluso si está vacío
    res.json(filas || []);
  });
});

// Endpoint para agregar una nueva tarea
app.post("/tareas", (req, res) => {
  const { titulo, descripcion } = req.body;
  
  if (!titulo || !descripcion) {
    return res.status(400).json({ error: "El título y la descripción son requeridos" });
  }

  db.run(
    "INSERT INTO tareas (titulo, descripcion, completada) VALUES (?, ?, ?)",
    [titulo.trim(), descripcion.trim(), false],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        titulo,
        descripcion, 
        completada: false,
        fecha_creacion: new Date().toISOString()
      });
    }
  );
});

// Endpoint para marcar una tarea como completada
app.put("/tareas/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, completada } = req.body || {};

  let completadaValue = completada;
  if (completadaValue !== undefined) {
    completadaValue = completadaValue ? 1 : 0;
  }
  
  db.run(
    "UPDATE tareas SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion), completada = COALESCE(?, completada), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?",
    [titulo, descripcion, completadaValue, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Tarea actualizada correctamente" });
      }
    }
  );
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
