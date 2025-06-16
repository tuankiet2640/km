# KM Frontend - AI Knowledge Base Platform

This directory contains the source code for the KM frontend, a modern, responsive web application built with React, Vite, and Tailwind CSS.

## Tech Stack

- **Framework**: [React](httpss://reactjs.org/)
- **Build Tool**: [Vite](httpss://vitejs.dev/)
- **Styling**: [Tailwind CSS](httpss://tailwindcss.com/)
- **State Management**: [Zustand](httpss://github.com/pmndrs/zustand)
- **Form Management**: [React Hook Form](httpss://react-hook-form.com/) & [Zod](httpss://zod.dev/) for validation
- **Routing**: [React Router v6](httpss://reactrouter.com/)
- **API Communication**: [Axios](httpss://axios-http.com/)

---

## Getting Started

### 1. Install Dependencies

Navigate to this directory and install the required packages.

```bash
npm install
```

### 2. Configure Environment Variables

This project uses environment variables to configure the connection to the backend API.

1.  Create a copy of the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open the newly created `.env` file and modify the variables if your backend is running on a different URL.

    ```dotenv
    # The base URL of your FastAPI backend server
    VITE_API_BASE_URL=http://127.0.0.1:8000
    ```

### 3. Run the Development Server

Start the Vite development server. It will be available at `http://localhost:3000`.

```bash
npm run dev
```

---

## Backend Integration

Connecting to the FastAPI backend is managed through a proxy configured in `vite.config.ts`. This is the recommended approach for local development.

### Vite Proxy Configuration

The `vite.config.ts` file reads the `VITE_API_BASE_URL` from your `.env` file to configure the proxy.

Here is the relevant configuration snippet from `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // ... other configs
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
```

**How it works:**
- When a component makes an API call with `axios` (e.g., `axios.post('/api/v1/auth/login', ...)`), Vite intercepts it.
- Because the URL starts with `/api`, Vite forwards the request to `http://127.0.0.1:8000/api/v1/auth/login`.
- This avoids cross-origin (CORS) errors that would otherwise occur if the frontend at `localhost:3000` tried to directly call the backend at `localhost:8000`.

### Authentication Flow

The application uses a token-based authentication system with a global Zustand store.

1.  **Login/Register**:
    - The `Login.tsx` and `Register.tsx` components send user credentials to the backend API endpoints (`/api/v1/auth/login`, `/api/v1/auth/register`).
2.  **Token Received**:
    - Upon successful login, the backend returns a JWT (`access_token`) and a `user` object.
3.  **State Update**:
    - The `useAuthStore`'s `login()` action is called with the token and user data.
    - Zustand's `persist` middleware automatically saves the `token`, `user`, and `isAuthenticated` state to the browser's `localStorage`.
4.  **Authenticated Requests**:
    - For subsequent API calls that require authentication, the token from `useAuthStore` must be retrieved and included in the `Authorization` header as a Bearer token.
    - An Axios instance or interceptor should be configured for this (not yet implemented).
5.  **Logout**:
    - The `logout()` action in `useAuthStore` clears the user, token, and authentication status from both the state and `localStorage`.

---

## Project Structure

-   `src/components`: Reusable UI components (Header, Layout, etc.).
-   `src/pages`: Top-level page components that correspond to routes (Login, Register, Dashboard, etc.).
-   `src/stores`: Zustand global state management stores (`auth.ts`, `ui.ts`).
-   `src/App.tsx`: The main application component where routing is defined.
-   `src/main.tsx`: The application entry point where React is mounted to the DOM.
-   `postcss.config.js`: Configuration file for PostCSS, required for Tailwind CSS.
-   `tailwind.config.js`: Configuration file for customizing Tailwind CSS. 