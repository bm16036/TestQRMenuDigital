# 🍽️ Menú Digital — Incremento Frontend

Interfaz administrativa desarrollada en **Angular 17+** para gestionar menús digitales multiempresa. Este incremento se centra en las vistas del administrador y deja listos los puntos de integración con el backend (Spring/Node) y la base de datos Neon PostgreSQL.

## 📦 Contenido del repositorio

- `men--digital-main/`: código fuente de la aplicación Angular, Docker y scripts auxiliares.
- `package.json`: marcador del workspace raíz (no contiene dependencias).

> Sitúate dentro de `men--digital-main/` para ejecutar cualquier comando de desarrollo.

## ✨ Funcionalidades incluidas

- **Inicio de sesión** con selección de empresa y manejo de sesión mediante JWT (mock en esta versión).
- **Panel de control** con métricas generales de categorías, productos y usuarios.
- **Gestión de categorías**: crear, editar, activar/inactivar y eliminar.
- **Gestión de menús**: crear, editar, activar/inactivar y eliminar.
- **Gestión de productos/platillos**: CRUD completo con relación a categorías y menús, además de vista previa de precios.
- **Gestión de usuarios**: creación de administradores/usuarios, asignación de empresa y control de estado.
- **Gestión de empresas**: mantenimiento del catálogo de negocios (RUC, razón social, logo, etc.).

## 🗂️ Estructura relevante

```
src/
├── app/
│   ├── core/        # Modelos, servicios y guard de autenticación
│   ├── features/    # Componentes de login y módulos administrativos
│   └── styles/      # Estilos compartidos para las pantallas de gestión
└── environments/    # Configuración (API base y uso de mocks)
```

## 🔐 Datos de prueba

Mientras `environment.useMockData = true`, puedes acceder con las siguientes credenciales:

- **Correo:** `admin@saboresdelmar.com`
- **Contraseña:** `admin123`
- **Empresa:** `Sabores del Mar`

> Cambia `useMockData` a `false` cuando el backend esté operativo. Todos los servicios HTTP (`AuthService`, `CategoryService`, etc.) ya apuntan a los endpoints REST esperados.

## 🚀 Puesta en marcha

### Requisitos

- Node.js 20+
- npm 10+
- Angular CLI 

### Pasos rápidos

```bash
cd men--digital-main/
npm install
npm start
```

El servidor de Angular se iniciará en `http://localhost:4200`. Para cambiar el puerto puedes usar `ng serve --port 80` o actualizar la configuración de Docker descrita abajo.

### Otros comandos útiles

- `npm run build`: genera la versión de producción en `dist/`.
- `npm test`: ejecuta las pruebas unitarias configuradas con Karma/Jasmine.

## ⚙️ Configuración de entornos

El frontend toma la URL base del backend desde `src/environments/environment*.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  useMockData: true
};
```

- Actualiza `apiBaseUrl` con el endpoint del backend.
- Cambia `useMockData` a `false` para consumir datos reales.

## 🛣️ Próximas implementaciones

1. Conectar los servicios Angular con los endpoints del backend (Spring Security + JWT).
2. Añadir interceptores para adjuntar el token JWT en cada petición HTTP.
3. Sustituir el mock de autenticación por el flujo real (registro, activación y login).
4. Añadir validaciones backend y mensajes de error detallados en la UI.

Revisa cada servicio en `src/app/core/services` para conocer el contrato esperado por la API.
