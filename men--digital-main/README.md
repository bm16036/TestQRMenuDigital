#  Proyecto Menú Digital

Sistema de gestión de menú digital con conexión a **Neon PostgreSQL**, desarrollado en **Node.js + Express** (backend) y **Angular** (frontend).  
El entorno se ejecuta mediante **Docker Compose** para garantizar portabilidad y despliegue rápido.

---

##  Incremento 1 — CRUD de Categorías

**Rol:** Developer (DEVS)  
**Responsable:** Steven Duran  
**Objetivo:** Implementar y probar el CRUD completo de **categorías**, conectando el backend a la base de datos **Neon**.

---

###  Funcionalidades implementadas

- Crear categorías (POST)
- Listar categorías (GET)
- Actualizar categorías (PUT)
- Eliminar categorías (DELETE)
- Conexión activa a **Neon PostgreSQL**
- Servidor Express ejecutándose correctamente con **Docker**

---

##  Configuración inicial

###  Instalar dependencias
```bash
npm install

DATABASE_URL=postgresql://neondb_owner:<CONTRASEÑA>@ep-rapid-art-a4yhy0k8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
PORT=3000

## Ejecutar el servidor
npm run dev

## Servidor escuchando en http://localhost:3000

