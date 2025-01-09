const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funciones para manejar productos (ya existentes)
  agregarProducto: (producto) => ipcRenderer.invoke('agregar-producto', producto),
  cargarProductos: () => ipcRenderer.invoke('cargar-productos'),
  borrarProducto: (id) => ipcRenderer.invoke('borrar-producto', id),
  editarProducto: (producto) => ipcRenderer.invoke('editar-producto', producto),
  
  // Funciones para manejar facturas (ya existentes)
  guardarFactura: (factura) => ipcRenderer.invoke('guardar-factura', factura),
  
  // Funciones para manejar trabajadoras (ya existentes)
  agregarTrabajadora: (trabajadora) => ipcRenderer.invoke('agregar-trabajadora', trabajadora),
  cargarTrabajadoras: () => ipcRenderer.invoke('cargar-trabajadoras'),
  borrarTrabajadora: (id) => ipcRenderer.invoke('borrar-trabajadora', id),
  editarTrabajadora: (trabajadora) => ipcRenderer.invoke('editar-trabajadora', trabajadora),
  
  // Funciones para manejar citas
  agregarCita: (cita) => ipcRenderer.invoke('agregar-cita', cita),
  cargarCitas: (fecha) => ipcRenderer.invoke('cargar-citas', fecha),
  actualizarAsistencia: (citaId, asistio) => ipcRenderer.invoke('actualizar-asistencia', citaId, asistio),
  
  // Funciones para manejar facturas de la ventana de revisión
  cargarFacturas: (fecha) => ipcRenderer.invoke('cargar-facturas', fecha),
  eliminarFactura: (idFactura) => ipcRenderer.invoke('eliminar-factura', idFactura)
});
