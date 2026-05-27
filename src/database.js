const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta del archivo de base de datos local
const dbPath = path.resolve(__dirname, 'contacts.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err.message);
  } else {
    console.log('Conectado exitosamente a la base de datos SQLite local.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla contacts:', err.message);
    } else {
      console.log('Tabla de contactos verificada / creada.');
      seedData();
    }
  });
}

function seedData() {
  db.get('SELECT COUNT(*) as count FROM contacts', [], (err, row) => {
    if (err) return console.error(err.message);
    
    if (row.count === 0) {
      console.log('Insertando datos semilla de prueba...');
      const stmt = db.prepare('INSERT INTO contacts (name, phone, email, notes) VALUES (?, ?, ?, ?)');
      stmt.run('Jaime Farfán', '987654321', 'jfarfan@tecsup.edu.pe', 'Profesor de Soluciones en la Nube');
      stmt.run('Agustin Perez', '912345678', 'agustin.perez@tecsup.edu.pe', 'Estudiante de Cloud Solutions');
      stmt.run('AWS Academy Support', '800-123-456', 'support@awsacademy.com', 'Soporte del entorno virtual de AWS');
      stmt.finalize();
      console.log('Datos semilla insertados con éxito.');
    }
  });
}

module.exports = {
  all: (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  get: (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  run: (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};
