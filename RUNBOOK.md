# RUNBOOK - Nomada Recetas

## Objetivo
Guia rapida para desplegar cambios sin romper links entre apps ni variables de entorno.

## 1) Flujo Git obligatorio
Desde `C:\Users\Estudiante\nomada-recetas`:

```powershell
git status
git add .
git commit -m "mensaje claro del cambio"
git push origin main
```

No depender de `Redeploy of ...` sobre commits viejos.

## 2) Variables de entorno (Vercel)
Proyecto: `nomada-recetas`

Variables requeridas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SIMULADOR_APP_URL`

Valor esperado para el link al simulador:
- `VITE_SIMULADOR_APP_URL=https://simulador-rentabilidad-app.vercel.app/`

## 3) Deploy correcto
En Vercel, el deployment debe mostrar:
- `Source: main`
- commit reciente de `NomadaApp07/nomada-recetas`

Si no aparece el commit nuevo:
1. Crear deployment desde `main` o commit SHA.
2. Evitar redeploys encadenados de builds viejos.

## 4) Verificacion funcional minima
Despues de deploy:
1. Abrir app en modo incognito.
2. Probar boton `Descargar App`.
3. Confirmar que abre la URL del simulador nueva.

## 5) Comandos de validacion local
```powershell
npm test
npm run build
```

## 6) Higiene del repo
No subir:
- `.env`
- `node_modules`
- `dist`

Mantener `.env.example` con nombres de variables.

