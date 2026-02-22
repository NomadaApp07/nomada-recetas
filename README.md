# Nómada Elite

Aplicación de ingeniería de costos gastronómicos (React + Vite).

## Requisitos

- Node.js 20+
- npm

## Variables de entorno

1. Copia `.env.example` como `.env`
2. Completa tus credenciales:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```
3. Crea usuarios en Supabase Auth (`Authentication > Users`) para iniciar sesiÃ³n con email y contraseÃ±a.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Publicar en Vercel

1. Sube este repo a GitHub.
2. Entra a Vercel y crea proyecto desde ese repo.
3. Configura estos env vars en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.
5. Conecta dominio propio si quieres venderla (`app.tudominio.com`).

## Nota de seguridad

El frontend nunca queda 100% oculto. Para vender con seguridad real:
- mueve login y lógica crítica al backend,
- usa auth real (Supabase Auth),
- controla acceso por suscripción (Stripe).
