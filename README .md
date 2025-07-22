# FitTrack: Tu Asistente de Fitness Inteligente

FitTrack es una aplicación web moderna diseñada para ayudarte a registrar, visualizar y optimizar tu progreso en el gimnasio. Combina una interfaz de usuario limpia y reactiva con el poder de la inteligencia artificial para ofrecerte una experiencia de seguimiento de fitness completa y personalizada.


<p align="center">
  <img alt="FitTrack Screenshot" src="https://placehold.co/800x400.png" />
</p>

---

## ✨ Características Principales

- **Autenticación Segura**: Registro, inicio de sesión y gestión de perfil de usuario utilizando Firebase Authentication.
- **Registro de Entrenamientos**: Un formulario intuitivo para añadir tus ejercicios diarios, incluyendo tipo de ejercicio, peso, series y repeticiones.
- **Dashboard Visual**:
  - Gráficos que muestran tu progreso de levantamiento de peso a lo largo del tiempo.
  - Un calendario de actividad que resalta tus días de entrenamiento.
  - Una tabla con el historial completo de tus entrenamientos.
- **Asesor de Entrenamiento IA**: Obtén consejos personalizados y accionables de una IA experta (potenciada por Genkit y Google Gemini) para superar estancamientos y optimizar tu rutina según tus objetivos.
- **Interfaz Moderna y Reactiva**: Construida con los últimos estándares de React y Next.js, ofreciendo una experiencia de usuario fluida y animaciones elegantes.

---

## 🚀 Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (con App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos y Autenticación**: [Firebase](https://firebase.google.com/) (Auth y Firestore)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [ShadCN UI](https://ui.shadcn.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Inteligencia Artificial**: [Genkit](https://firebase.google.com/docs/genkit) (con Google Gemini)
- **Validación de Formularios**: [React Hook Form](https://react-hook-form.com/) y [Zod](https://zod.dev/)

---

## 📂 Estructura del Proyecto

El código está organizado para ser modular y escalable:

```
src/
├── app/              # Páginas y layouts (App Router)
├── components/       # Componentes de React (UI, layout, auth, etc.)
├── contexts/         # Proveedores de contexto (ej. AuthContext)
├── hooks/            # Hooks personalizados (ej. useAuth)
├── lib/              # Utilidades, config de Firebase y tipos de Zod
├── ai/               # Lógica de IA con Genkit (flujos y configuración)
└── ...
```

---

## 🏁 Cómo Empezar (Desarrollo Local)

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- `npm` o `yarn`

### 1. Clona el Repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Instala las Dependencias

```bash
npm install
```

### 3. Configura Firebase

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  En la sección **Authentication**, habilita el proveedor **Correo electrónico/Contraseña**.
3.  En la sección **Firestore Database**, crea una nueva base de datos en modo de producción y establece las reglas de seguridad.
4.  Ve a la **Configuración del proyecto** > **Tus apps**, añade una nueva "Aplicación web" y copia el objeto de configuración.
5.  Pega esta configuración en el archivo `src/config/firebase.ts`.

### 4. Configura las Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto y añade tu API Key de Google AI Studio para que Genkit funcione. Puedes obtenerla [aquí](https://aistudio.google.com/app/apikey).

```.env
GEMINI_API_KEY="TU_API_KEY_DE_GOOGLE_AI"
```

### 5. Ejecuta la Aplicación

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador para ver la aplicación en funcionamiento.

---

## 🚀 Despliegue

Esta aplicación está configurada para desplegarse fácilmente con **Firebase App Hosting**.

### Prerrequisitos para el Despliegue

- [Firebase CLI](https://firebase.google.com/docs/cli) instalado: `npm install -g firebase-tools`
- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install) instalado.

### Pasos para Desplegar

1.  **Inicia sesión en Firebase**:
    ```bash
    firebase login
    ```

2.  **Guarda tu API Key de Gemini como un Secreto**:
    Por seguridad, tu clave de API no debe estar en el código. La configuramos para que se cargue desde Google Secret Manager.

    *   Primero, crea el secreto:
        ```bash
        gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
        ```
    *   Luego, añade el valor de tu clave (reemplaza `TU_API_KEY_AQUI`):
        ```bash
        printf "TU_API_KEY_AQUI" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
        ```
    *   Finalmente, da permiso a App Hosting para que acceda al secreto:
        ```bash
        gcloud secrets add-iam-policy-binding GEMINI_API_KEY --member="service-709541945153@gcp-sa-apphosting.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
        ```

3.  **Despliega la aplicación**:
    ```bash
    firebase deploy --only apphosting
    ```

Una vez finalizado el despliegue, la CLI de Firebase te proporcionará la URL pública de tu aplicación.

---

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Ejecuta el linter para revisar la calidad del código.
