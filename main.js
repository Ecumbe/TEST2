const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear la base de datos SQLite y abrirla
const db = new sqlite3.Database('productos.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conexión exitosa con la base de datos');
    // Crear las tablas necesarias si no existen
    db.run('CREATE TABLE IF NOT EXISTS productos (id INTEGER PRIMARY KEY, name TEXT, price REAL)', (err) => {
      if (err) {
        console.error('Error al crear la tabla productos:', err);
      }
    });
    db.run('CREATE TABLE IF NOT EXISTS ventas (id INTEGER PRIMARY KEY, fecha TEXT, productos TEXT, t_pago TEXT, cuenta TEXT, banco TEXT, trabajadora TEXT, valor REAL)', (err) => {
      if (err) {
        console.error('Error al crear la tabla ventas:', err);
      }
    });
    db.run('CREATE TABLE IF NOT EXISTS trabajadoras (id INTEGER PRIMARY KEY, name TEXT, percentage REAL)', (err) => {
      if (err) {
        console.error('Error al crear la tabla trabajadoras:', err);
      }
    });
    db.run('ALTER TABLE trabajadoras ADD COLUMN percentage REAL', (err) => {
      if (err && err.code !== 'SQLITE_ERROR') {
        console.error('Error al agregar la columna percentage a trabajadoras:', err);
      } else {
        console.log('Columna percentage agregada correctamente a la tabla trabajadoras');
      }
    });
    // Crear la tabla de citas
    db.run('CREATE TABLE IF NOT EXISTS citas (id INTEGER PRIMARY KEY, fecha TEXT, nombre TEXT, descripcion TEXT, hora TEXT, asistio BOOLEAN)', (err) => {
      if (err) {
        console.error('Error al crear la tabla citas:', err);
      }
    });
  }
});

// Función para cargar facturas por fecha
ipcMain.handle('cargar-facturas', (event, fecha) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM ventas WHERE fecha = ?', [fecha], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // Devuelve las facturas filtradas por fecha
      }
    });
  });
});

// Función para eliminar una factura
ipcMain.handle('eliminar-factura', (event, invoiceId) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM ventas WHERE id = ?', [invoiceId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(`Factura con ID ${invoiceId} eliminada.`); // Confirma que la factura fue eliminada
      }
    });
  });
});

// Función para agregar un nuevo producto
ipcMain.handle('agregar-producto', (event, producto) => {
  const { name, price } = producto;
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO productos (name, price) VALUES (?, ?)', [name, price], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Retorna el ID del nuevo producto insertado
      }
    });
  });
});

// Función para cargar todos los productos
ipcMain.handle('cargar-productos', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM productos', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // Devuelve todos los productos
      }
    });
  });
});

// Función para borrar un producto
ipcMain.handle('borrar-producto', (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM productos WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

// Función para editar un producto
ipcMain.handle('editar-producto', (event, producto) => {
  const { id, name, price } = producto;
  return new Promise((resolve, reject) => {
    db.run('UPDATE productos SET name = ?, price = ? WHERE id = ?', [name, price, id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

// Función para guardar una factura
ipcMain.handle('guardar-factura', (event, factura) => {
  const { fecha, productos, t_pago, cuenta, banco, trabajadora, valor } = factura;
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO ventas (fecha, productos, t_pago, cuenta, banco, trabajadora, valor) VALUES (?, ?, ?, ?, ?, ?, ?)', [fecha, productos, t_pago, cuenta, banco, trabajadora, valor], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Devuelve el ID de la factura guardada
      }
    });
  });
});

// Funciones para manejar trabajadoras
ipcMain.handle('agregar-trabajadora', (event, trabajadora) => {
  const { name, percentage } = trabajadora;
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO trabajadoras (name, percentage) VALUES (?, ?)', [name, percentage], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Retorna el ID de la nueva trabajadora
      }
    });
  });
});

ipcMain.handle('cargar-trabajadoras', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM trabajadoras', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // Devuelve todas las trabajadoras
      }
    });
  });
});

ipcMain.handle('borrar-trabajadora', (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM trabajadoras WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

ipcMain.handle('editar-trabajadora', (event, trabajadora) => {
  const { id, name, percentage } = trabajadora;
  return new Promise((resolve, reject) => {
    db.run('UPDATE trabajadoras SET name = ?, percentage = ? WHERE id = ?', [name, percentage, id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

// Funciones para manejar citas
// Agregar una cita
ipcMain.handle('agregar-cita', (event, cita) => {
  const { fecha, nombre, descripcion, hora, asistio } = cita;
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO citas (fecha, nombre, descripcion, hora, asistio) VALUES (?, ?, ?, ?, ?)', [fecha, nombre, descripcion, hora, asistio], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Retorna el ID de la nueva cita insertada
      }
    });
  });
});

// Cargar citas por fecha
ipcMain.handle('cargar-citas', (event, fecha) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM citas WHERE fecha = ?', [fecha], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // Devuelve las citas filtradas por fecha
      }
    });
  });
});

// Actualizar la asistencia de una cita
ipcMain.handle('actualizar-asistencia', (event, citaId, asistio) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE citas SET asistio = ? WHERE id = ?', [asistio, citaId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(`Cita con ID ${citaId} actualizada.`); // Confirma que la cita fue actualizada
      }
    });
  });
});

// Crear la ventana principal
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
}

// Event listeners para la aplicación
app.whenReady().then(createWindow);

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
