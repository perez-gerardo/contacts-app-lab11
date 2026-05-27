# Cloud Contacts Monolith — Laboratorio 11 (Virtualización)

Este repositorio contiene la solución completa desarrollada para el **Laboratorio 11** de la asignatura **Desarrollo de Soluciones en la Nube** en Tecsup, dictada por el profesor **Jaime Farfán**.

El proyecto implementa una aplicación CRUD monolítica para la gestión de contactos, diseñada con un enfoque de alto rendimiento, portabilidad absoluta y estética premium con Glassmorphism (Dark Mode).

---

## 👥 Integrante
*   **Estudiante:** Gerardo Perez
*   **Especialidad:** Desarrollo de Soluciones en la Nube (Semestre V - C24 ABCD)

---

## 🏗️ Arquitectura y Tecnologías
La aplicación ha sido construida siguiendo un patrón de diseño monolítico con las siguientes tecnologías clave:

1.  **Backend (Node.js & Express):** API REST ligera que maneja operaciones de lectura, creación, actualización y eliminación (CRUD).
2.  **Base de Datos (SQLite 3):** Base de datos relacional local basada en archivo físico (`src/contacts.db`), eliminando la necesidad de configurar servidores de base de datos pesados externos y garantizando rapidez en entornos de memoria limitada (`t2.micro` de 1 GB RAM).
3.  **Frontend (HTML5, JS Vanilla & Tailwind CSS CDN):** Interfaz premium de tipo Glassmorphism con animaciones sutiles, adaptabilidad móvil y un módulo dinámico de detección de host que expone en tiempo real si el servidor corre en **AWS Windows Server** o **AWS Debian/Linux** consultando la API `/api/health`.
4.  **Virtualización y Contenedores (Docker & Docker Compose):** Empaquetamiento completo para permitir despliegues deterministas en cualquier sistema operativo virtual.

---

## 🐳 Despliegue con Docker y Docker Compose (Recomendado en Debian/Linux)

La aplicación utiliza un volumen persistente de Docker para asegurar que los contactos ingresados no se borren cuando el contenedor sea reiniciado.

### Comandos de Despliegue Rápido:
1.  **Clonar el repositorio en el servidor virtual:**
    ```bash
    git clone https://github.com/perez-gerardo/contacts-app-lab11.git
    cd contacts-app-lab11
    ```
2.  **Construir y levantar el contenedor en background:**
    ```bash
    sudo docker-compose up -d --build
    ```
3.  **Verificar estado del contenedor:**
    ```bash
    sudo docker ps
    ```
4.  **Acceso Web:** Navegar a `http://<IP_PUBLICA_EC2>:3000`

---

## 🖥️ Despliegue en Windows Server (PowerShell)

1.  **Descargar e instalar Node.js 18+ LTS.**
2.  **Descargar el código fuente e instalar las dependencias:**
    ```powershell
    npm install
    ```
3.  **Habilitar el puerto 3000 en el Firewall de Windows:**
    ```powershell
    New-NetFirewallRule -DisplayName "Contacts App Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
    ```
4.  **Iniciar la aplicación:**
    ```powershell
    npm start
    ```
5.  **Acceso Web:** Navegar a `http://<IP_PUBLICA_EC2>:3000`
