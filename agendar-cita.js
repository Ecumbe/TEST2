const saveAppointmentButton = document.getElementById('save-appointment');
const message = document.getElementById('message');
const selectDateInput = document.getElementById('select-date');
const citasList = document.getElementById('citas-list');
const backButton = document.getElementById('back');
const logoutButton = document.getElementById('logout');

// Guardar cita usando las funciones de Electron
saveAppointmentButton.addEventListener('click', async () => {
    const citaDate = document.getElementById('cita-date').value;
    const personName = document.getElementById('person-name').value;
    const appointmentDescription = document.getElementById('appointment-description').value;
    const appointmentTime = document.getElementById('appointment-time').value;

    if (!citaDate || !personName || !appointmentDescription || !appointmentTime) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    try {
        // Agregar cita usando la función de Electron
        await window.electronAPI.agregarCita({
            fecha: citaDate,
            nombre: personName,
            descripcion: appointmentDescription,
            hora: appointmentTime,
            asistio: false
        });
        message.textContent = "Cita guardada exitosamente.";

        // Limpiar formulario después de guardar
        document.getElementById('cita-date').value = '';
        document.getElementById('person-name').value = '';
        document.getElementById('appointment-description').value = '';
        document.getElementById('appointment-time').value = '';

        loadAppointments(); // Actualizar la lista de citas
    } catch (error) {
        console.error("Error al guardar la cita:", error);
        message.textContent = "Hubo un error al guardar la cita.";
    }
});

// Mostrar citas de una fecha
selectDateInput.addEventListener('change', async () => {
    const selectedDate = selectDateInput.value;
    loadAppointments(selectedDate);
});

// Cargar citas usando la función de Electron
async function loadAppointments(date = "") {
    if (!date) return;

    try {
        const citas = await window.electronAPI.cargarCitas(date);
        citasList.innerHTML = ''; // Limpiar lista

        citas.forEach((cita) => {
            const citaItem = document.createElement('div');
            citaItem.innerHTML = `
                <p>${cita.fecha} - ${cita.nombre} - ${cita.descripcion} - ${cita.hora}</p>
                <div>
                    <button data-id="${cita.id}" class="asistio-btn">Sí</button>
                    <button data-id="${cita.id}" class="asistio-btn">No</button>
                </div>
            `;
            citasList.appendChild(citaItem);

            // Eventos para marcar asistencia
            citaItem.querySelectorAll('.asistio-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const docId = e.target.getAttribute('data-id');
                    const asistio = e.target.textContent === 'Sí';
                    await window.electronAPI.actualizarAsistencia(docId, asistio);
                    loadAppointments(date); // Recargar citas después de actualizar
                });
            });
        });
    } catch (error) {
        console.error("Error al cargar las citas:", error);
    }
}

// Volver a la página anterior
backButton.addEventListener('click', () => {
    window.history.back();
});

// Cerrar sesión
logoutButton.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
});
