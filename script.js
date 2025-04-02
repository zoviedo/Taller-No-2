const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
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
    const titleText = taskTitle.value.trim();
    const taskText = taskInput.value.trim();
    if (titleText === "" || taskText === "") return;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titleText, descripcion: taskText }),
    });

    if (res.ok) {
        taskTitle.value = "";
        taskInput.value = "";
        loadTasks();
    }
});

//actualizar tareas
async function loadTasks() {
    const storedTasks = localStorage.getItem("tareas");
    let tasks = storedTasks ? JSON.parse(storedTasks) : [];

    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            tasks = await res.json();
            localStorage.setItem("tareas", JSON.stringify(tasks));
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
        if (task.completada) {
            li.classList.add("task-item", "completed");
        } else {
            li.classList.add("task-item");
        }

        li.innerHTML = `
            <span class="task-title">${task.titulo}</span>
            <span class="task-desc">${task.descripcion}</span>
            <span class="task-editar" 
                    onclick="editTask(${task.id}, '${task.titulo}', '${task.descripcion}')">
                    Editar
                </span>
            <span class="task-status">${task.completada ? "Completada" : "Pendiente"}</span>
            <div class="task-buttons">
                <button onclick="toggleTask(${task.id})">✔️</button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}


// Función para editar tarea
async function editTask(id, oldTitle, oldDesc) {
    const newTitle = prompt("Editar título:", oldTitle);
    const newDesc = prompt("Editar descripción:", oldDesc);
    if (!newTitle || !newDesc) return;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: newTitle, descripcion: newDesc }),
    });

    loadTasks();
}


// Marcar tarea como completada
async function toggleTask(id) {
    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completada: true }) // Alternar el estado
    });
    loadTasks();
}

// Eliminar tarea
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTasks();
}
