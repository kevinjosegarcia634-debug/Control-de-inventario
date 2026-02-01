# 📦 Control de Inventario Premium

Sistema de control de inventario moderno, rápido y visualmente atractivo desarrollado con **HTML5, CSS3, JavaScript (ES6+)** y **Firebase Firestore** para la persistencia de datos en tiempo real.

## 🚀 Características Principales
- **Gestión de Productos**: Crea, edita y elimina productos con una interfaz intuitiva.
- **Alertas de Stock Crítico**: Notificaciones visuales (animaciones rojas) y por mensajes flotantes (Toasts) cuando el inventario baja de 10 unidades.
- **Historial de Movimientos**: Registro en tiempo real de entradas y salidas de mercancía.
- **Modales Premium**: Interfaz fluida para la edición y confirmación de acciones, reemplazando los diálogos nativos del navegador.
- **Diseño Responsivo**: Estética profesional en tonos oscuros y rojos, optimizada para diferentes pantallas.

## 🛠️ Requisitos para el Desarrollador (Compañero)

Debido a que el proyecto utiliza **Módulos de Firebase** y **Módulos de JavaScript**, el navegador bloquea la carga si se abre el archivo `index.html` directamente (haciendo doble clic). **Es obligatorio usar un servidor local.**

### Opción 1: Usar VS Code (Recomendado)
1. Abre la carpeta del proyecto en **Visual Studio Code**.
2. Instala la extensión **"Live Server"** (de Ritwick Dey).
3. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"** o presiona el botón **"Go Live"** en la barra inferior.

### Opción 2: Usar Node.js
Si tienes Node instalado, ejecuta este comando en la terminal dentro de la carpeta:
```bash
npx serve .
```

## 📂 Estructura del Proyecto
- `index.html`: Estructura semántica de la aplicación.
- `style.css`: Estilos visuales, animaciones y diseño responsivo.
- `script.js`: Lógica de negocio y conexión con Firebase Firestore.
- `static/`: Recursos estáticos como logos e imágenes.

---
Desarrollado con ❤️ para un control de inventario eficiente.
