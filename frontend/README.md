# La Quesería — Frontend
apuntes importantes: 
React + Vite + Tailwind. Es tu diseño HTML convertido a una aplicación conectada al backend 
tiene modo claro opcional  diseño responsive (celular, tableta y escritorio).

## Cómo ejecutar lo servidores

1. **Backend** (carpeta `backend`): con tu `.env` ya listo, `npm install` y `npm run dev` (queda en `http://localhost:5000`).
2. **Frontend** (carpeta `frontend`): `npm install` y `npm run dev`. Abre `http://localhost:5173`.

Si el catálogo se ve vacío es porque la base de datos aún no tiene productos
Un mensaje rojo con "Reintentar" significa que el backend está apagado o su `.env` está mal.

## Scripts
| Comando | Qué hace |

| `npm run dev`  Servidor de desarrollo, : Revisa tu código en busca de errores de sintaxis, malas prácticas o fallos usando una herramienta llamada oxlint
| `npm run build`  Versión de producción, Prepara y optimiza el proyecto para producción. y subirlo correctamente
| `npm run lint`  Revisa el código (oxlint) 


