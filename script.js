const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const API_URL = "http://localhost:3000/tareas"; // Dirección del backend

// Cargar tareas al inicio
document.addEventListener("DOMContentLoaded", loadTasks);

// Filtrar tareas por estado
document.getElementById("filter").addEventListener("change", loadTasks);

// Agregar nueva tarea
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: taskText }),
    });

    if (res.ok) {
        taskInput.value = "";
        loadTasks(); // Recargar la lista
    }
});

async function loadTasks() {
    const storedTasks = localStorage.getItem("tareas");
    let tasks = storedTasks ? JSON.parse(storedTasks) : [];

    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            tasks = await res.json();
            localStorage.setItem("tareas", JSON.stringify(tasks)); // Actualizar LocalStorage
        }
    } catch (error) {
        console.error("Error al conectar con el backend:", error);
    }

    taskList.innerHTML = "";
    const filter = document.getElementById("filter").value;
    tasks = tasks.filter(task =>
        filter === "completed" ? task.completada
            : filter === "pending" ? !task.completada
                : true
    );

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="${task.completada ? "completed" : ""}" ondblclick="editTask(${task.id}, '${task.descripcion}')">${task.descripcion}</span>
            <button onclick="toggleTask(${task.id})">✔️</button>
            <button onclick="deleteTask(${task.id})">❌</button>
        `;
        taskList.appendChild(li);
    });
}


// Función para editar tarea
async function editTask(id, oldText) {
    const newText = prompt("Editar tarea:", oldText);
    if (!newText || newText.trim() === oldText) return;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: newText }),
    });

    loadTasks();
}


// Marcar tarea como completada
async function toggleTask(id) {
    await fetch(`${API_URL}/${id}`, { method: "PUT" });
    loadTasks();
}

// Eliminar tarea
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTasks();
}
