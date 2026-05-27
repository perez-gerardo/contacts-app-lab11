document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const contactForm = document.getElementById('contactForm');
  const contactIdInput = document.getElementById('contactId');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const notesInput = document.getElementById('notes');
  
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  const contactsGrid = document.getElementById('contactsGrid');
  const contactsCount = document.getElementById('contactsCount');
  const refreshBtn = document.getElementById('refreshBtn');
  
  const hostIpSpan = document.getElementById('hostIp');
  const osBadge = document.getElementById('osBadge');
  const envOS = document.getElementById('envOS');
  const envArch = document.getElementById('envArch');
  const envUptime = document.getElementById('envUptime');

  let isEditing = false;

  // 1. Obtener información de red y del servidor
  async function fetchNetworkInfo() {
    try {
      // Obtener IP pública del cliente/servidor
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      hostIpSpan.textContent = ipData.ip;
    } catch (e) {
      hostIpSpan.textContent = window.location.hostname;
    }

    try {
      // Obtener estado y sistema operativo de la instancia en la nube
      const healthRes = await fetch('/api/health');
      const health = await healthRes.json();
      
      envOS.textContent = health.os;
      envArch.textContent = health.arch;
      
      // Formatear uptime
      const hours = Math.floor(health.uptime / 3600);
      const minutes = Math.floor((health.uptime % 3600) / 60);
      envUptime.textContent = `${hours}h ${minutes}m`;
      
      // Badge del sistema operativo
      if (health.os.toLowerCase().includes('win')) {
        osBadge.textContent = 'AWS Windows Server';
        osBadge.className = 'text-[10px] bg-sky-900 border border-sky-700 text-sky-200 px-2 py-0.5 rounded uppercase font-bold tracking-wider';
      } else {
        osBadge.textContent = 'AWS Debian/Linux';
        osBadge.className = 'text-[10px] bg-red-950 border border-red-800 text-red-200 px-2 py-0.5 rounded uppercase font-bold tracking-wider';
      }
    } catch (e) {
      console.error('Error al conectar con el healthcheck:', e);
      envOS.textContent = 'Error';
      envArch.textContent = 'Desconocido';
    }
  }

  // 2. Cargar lista de contactos (READ)
  async function loadContacts() {
    contactsGrid.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center gap-4">
        <div class="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-slate-400 text-sm">Cargando directorio de contactos...</p>
      </div>
    `;

    try {
      const res = await fetch('/api/contacts');
      const contacts = await res.json();
      
      contactsCount.textContent = contacts.length;
      
      if (contacts.length === 0) {
        contactsGrid.innerHTML = `
          <div class="col-span-full py-16 text-center">
            <p class="text-3xl">📭</p>
            <p class="text-slate-400 text-sm mt-3">Sin contactos registrados.</p>
            <p class="text-xs text-slate-600 mt-1">Usa el formulario de la izquierda para registrar el primero.</p>
          </div>
        `;
        return;
      }

      contactsGrid.innerHTML = '';
      contacts.forEach(contact => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between group relative overflow-hidden';
        
        // Efecto hover sutil
        card.innerHTML = `
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">
                ${contact.name.charAt(0).toUpperCase()}
              </div>
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                <button onclick="editContact(${contact.id})" class="p-1.5 bg-slate-800 hover:bg-indigo-500 hover:text-white rounded-lg text-slate-400 transition-all" title="Editar">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button onclick="deleteContact(${contact.id})" class="p-1.5 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-lg text-slate-400 transition-all" title="Eliminar">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <h3 class="font-bold text-slate-100 group-hover:text-indigo-300 transition-all truncate text-base" title="${contact.name}">${contact.name}</h3>
            
            <div class="mt-3 space-y-1.5 text-xs text-slate-400">
              ${contact.phone ? `
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>${contact.phone}</span>
                </div>
              ` : ''}
              
              ${contact.email ? `
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z"></path>
                  </svg>
                  <span class="truncate" title="${contact.email}">${contact.email}</span>
                </div>
              ` : ''}
            </div>
            
            ${contact.notes ? `
              <p class="mt-3 text-xs bg-slate-950/40 border border-slate-900 rounded-xl p-2.5 text-slate-400 line-clamp-2" title="${contact.notes}">
                ${contact.notes}
              </p>
            ` : ''}
          </div>
        `;
        contactsGrid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      contactsGrid.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <p class="text-3xl">⚠️</p>
          <p class="text-rose-400 text-sm mt-3 font-semibold">Error de conexión con la API</p>
          <p class="text-xs text-slate-500 mt-1">Verifica que el servidor monolítico de Node.js esté activo.</p>
        </div>
      `;
    }
  }

  // 3. Crear o Editar contacto (CREATE & UPDATE)
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contactData = {
      name: nameInput.value,
      phone: phoneInput.value,
      email: emailInput.value,
      notes: notesInput.value
    };

    try {
      let res;
      if (isEditing) {
        // Modo Edición
        const id = contactIdInput.value;
        res = await fetch(`/api/contacts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
      } else {
        // Modo Creación
        res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
      }

      if (res.ok) {
        resetForm();
        loadContacts();
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error en la llamada REST al guardar.');
    }
  });

  // 4. Preparar formulario para Edición
  window.editContact = async (id) => {
    try {
      const res = await fetch(`/api/contacts/${id}`);
      const contact = await res.json();
      
      contactIdInput.value = contact.id;
      nameInput.value = contact.name;
      phoneInput.value = contact.phone || '';
      emailInput.value = contact.email || '';
      notesInput.value = contact.notes || '';
      
      isEditing = true;
      formTitle.innerHTML = `
        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        <span>Editar Contacto</span>
      `;
      submitBtn.textContent = 'Actualizar Cambios';
      cancelEditBtn.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('No se pudo cargar el contacto para editar.');
    }
  };

  // 5. Eliminar contacto (DELETE)
  window.deleteContact = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contacto?')) return;
    
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadContacts();
      } else {
        alert('Error al intentar eliminar el contacto.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  function resetForm() {
    contactIdInput.value = '';
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    notesInput.value = '';
    
    isEditing = false;
    formTitle.innerHTML = `
      <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
      </svg>
      <span>Crear Nuevo Contacto</span>
    `;
    submitBtn.textContent = 'Guardar Contacto';
    cancelEditBtn.classList.add('hidden');
  }

  cancelEditBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', loadContacts);

  // Inicializar
  fetchNetworkInfo();
  loadContacts();
});
