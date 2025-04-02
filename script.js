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

// Función para mostrar mensajes de estado
function showMessage(message, type = 'success') {
    const msg = document.createElement('div');
    msg.className = `alert alert-${type}`;
    msg.textContent = message;
    document.querySelector('.container').insertBefore(msg, taskList);
    setTimeout(() => msg.remove(), 3000);
}

// Mejorar la función de carga de tareas
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
        filteredTasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="${task.completada ? "completed" : ""}" 
                      ondblclick="editTask(${task.id}, '${task.descripcion}')">
                    ${task.descripcion}
                </span>
                <div class="task-actions">
                    <button class="btn btn-success" onclick="toggleTask(${task.id})">✔️</button>
                    <button class="btn btn-edit" onclick="editTask(${task.id}, '${task.descripcion}')">✏️</button>
                    <button class="btn btn-danger" onclick="deleteTask(${task.id})">❌</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (error) {
        showMessage(error.message, 'error');
        const storedTasks = localStorage.getItem("tareas");
        if (storedTasks) {
            taskList.innerHTML = "<p>Usando datos almacenados localmente</p>";
            // Mostrar tareas desde localStorage
        }
    }
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
