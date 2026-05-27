const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints

// 1. Listar contactos
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await db.all('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los contactos de la base de datos: ' + error.message });
  }
});

// 2. Obtener un contacto por ID
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el contacto: ' + error.message });
  }
});

// 3. Crear contacto
app.post('/api/contacts', async (req, res) => {
  const { name, phone, email, notes } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  
  try {
    const result = await db.run(
      'INSERT INTO contacts (name, phone, email, notes) VALUES (?, ?, ?, ?)',
      [name.trim(), phone || '', email || '', notes || '']
    );
    const newContact = await db.get('SELECT * FROM contacts WHERE id = ?', [result.id]);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el contacto: ' + error.message });
  }
});

// 4. Actualizar contacto
app.put('/api/contacts/:id', async (req, res) => {
  const { name, phone, email, notes } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio para actualizar' });
  }
  
  try {
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado para actualizar' });
    }
    
    await db.run(
      'UPDATE contacts SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?',
      [name.trim(), phone || '', email || '', notes || '', req.params.id]
    );
    
    const updated = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el contacto: ' + error.message });
  }
});

// 5. Eliminar contacto
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado para eliminar' });
    }
    
    await db.run('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contacto eliminado con éxito', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el contacto: ' + error.message });
  }
});

// Health check para monitoreo en la nube
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    os: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Ruta comodín para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 Monolito de Contactos activo en puerto: ${PORT}`);
  console.log(`🔗 Accede localmente: http://localhost:${PORT}`);
  console.log(`🖥️  Disponible en red local y nube (0.0.0.0)`);
  console.log(`===================================================`);
});
