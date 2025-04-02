const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskList = document.getElementById("task-list");

const API_URL = "http://localhost:3000/tareas"; // Dirección del backend

// Cargar tareas al inicio
document.addEventListener("DOMContentLoaded", loadTasks);

// Filtrar tareas por estado
document.getElementById("filter").addEventListener("change", loadTasks);

// Agregar nueva tarea
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    
    if (title === "" || description === "") return;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            titulo: title,
            descripcion: description 
        }),
    });

    if (res.ok) {
        taskTitle.value = "";
        taskDescription.value = "";
        loadTasks();
    }
});

async function loadTasks() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar las tareas');
        
        const tasks = await res.json();
        localStorage.setItem("tareas", JSON.stringify(tasks));
        
        const filter = document.getElementById("filter").value;
        const filteredTasks = tasks.filter(task =>
            filter === "completed" ? task.completada :
            filter === "pending" ? !task.completada : true
        );

        taskList.innerHTML = "";
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-state";
            emptyMessage.innerHTML = `
                <p>No hay tareas por el momento</p>
                <small>${filter !== 'all' ? 'Prueba cambiando el filtro' : 'Crea una nueva tarea usando el formulario'}</small>
            `;
            taskList.appendChild(emptyMessage);
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="task-content ${task.completada ? "completed" : ""}">
                    <div class="task-title">${task.titulo}</div>
                    <div class="task-description">${task.descripcion}</div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-success" onclick="toggleTask(${task.id})"
                            ${task.completada ? 'disabled' : ''}>
                        ${task.completada ? '✓' : '✔️'}
                    </button>
                    <button class="btn btn-edit" onclick="editTask(${task.id}, '${task.titulo.replace(/'/g, "\\'")}', '${task.descripcion.replace(/'/g, "\\'")}')">✏️</button>
                    <button class="btn btn-danger" onclick="deleteTask(${task.id})">❌</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (error) {
        showMessage(error.message, 'error');
        taskList.innerHTML = `
            <div class="empty-state">
                <p>No hay tareas por el momento</p>
                <small>Crea una nueva tarea usando el formulario</small>
            </div>
        `;
    }
}


// Función para editar tarea
async function editTask(id, oldTitle, oldDescription) {
    const newTitle = prompt("Editar título:", oldTitle);
    const newDescription = prompt("Editar descripción:", oldDescription);
    if (!newTitle || newTitle.trim() === oldTitle || !newDescription || newDescription.trim() === oldDescription) return;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: newTitle, descripcion: newDescription }),
    });

    loadTasks();
}


// Marcar tarea como completada
async function toggleTask(id) {
    const tasks = JSON.parse(localStorage.getItem("tareas"));
    const task = tasks.find(t => t.id === id);
    const newCompletedState = !task.completada;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completada: newCompletedState })
    });
    
    loadTasks();
}

// Eliminar tarea
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTasks();
}
