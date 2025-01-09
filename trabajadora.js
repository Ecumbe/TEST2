// js/trabajadora.js

const trabajadoraForm = document.getElementById('trabajadora-form');
const workerList = document.getElementById('worker-list');
const backButton = document.getElementById('back');

// Agregar una nueva trabajadora
trabajadoraForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const workerName = document.getElementById('worker-name').value;
    const workerPercentage = parseFloat(document.getElementById('worker-percentage').value);
    
    if (!workerName || isNaN(workerPercentage)) {
        alert("Por favor, ingrese un nombre válido y un porcentaje de ganancia.");
        return;
    }

    try {
        const newWorker = { name: workerName, percentage: workerPercentage };
        await window.electronAPI.agregarTrabajadora(newWorker); // Llamada al proceso principal de Electron
        document.getElementById('worker-name').value = '';
        document.getElementById('worker-percentage').value = '';
        loadWorkers(); // Recargar la lista de trabajadoras
    } catch (error) {
        console.error("Error al agregar la trabajadora:", error);
    }
});

// Cargar trabajadoras desde SQLite
const loadWorkers = async () => {
    try {
        const workers = await window.electronAPI.cargarTrabajadoras(); // Llamada al proceso principal de Electron
        workerList.innerHTML = ''; // Limpiar la lista antes de cargar
        workers.forEach((worker) => {
            const workerItem = document.createElement('div');
            workerItem.classList.add('worker-item');
            workerItem.innerHTML = `
                <span>${worker.name} - ${worker.percentage}%</span>
                <div>
                    <button onclick="editWorker(${worker.id}, '${worker.name}', ${worker.percentage})">Editar</button>
                    <button onclick="deleteWorker(${worker.id})">Borrar</button>
                </div>
            `;
            workerList.appendChild(workerItem);
        });
    } catch (error) {
        console.error("Error al cargar las trabajadoras:", error);
    }
};

// Borrar una trabajadora
window.deleteWorker = async (id) => {
    try {
        await window.electronAPI.borrarTrabajadora(id); // Llamada al proceso principal de Electron
        loadWorkers(); // Recargar la lista después de eliminar
    } catch (error) {
        console.error("Error al borrar la trabajadora:", error);
    }
};

// Editar una trabajadora
window.editWorker = async (id, currentName, currentPercentage) => {
    const newName = prompt("Nuevo nombre de la trabajadora:", currentName);
    const newPercentage = parseFloat(prompt("Nuevo porcentaje de ganancia (%):", currentPercentage));

    if (newName && !isNaN(newPercentage)) {
        try {
            const updatedWorker = { id, name: newName, percentage: newPercentage };
            await window.electronAPI.editarTrabajadora(updatedWorker); // Llamada al proceso principal de Electron
            loadWorkers(); // Recargar la lista después de editar
        } catch (error) {
            console.error("Error al editar la trabajadora:", error);
        }
    } else {
        alert("Por favor ingrese valores válidos.");
    }
};

// Cargar trabajadoras al iniciar la página
loadWorkers();

// Manejar el botón de atrás
backButton.addEventListener('click', () => {
    window.location.href = "menu.html";
});
