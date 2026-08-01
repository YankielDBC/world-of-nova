# Integración ClickForge ↔ World of Nova

## Arquitectura

Solo hay **un backend**: WoN Express en `http://localhost:3000`.  
ClickForge es solo UI (portal/launcher). Firebase Auth es el proveedor de cuentas.

```
┌─────────────────────────────────┐
│   Firebase Authentication       │ (email + password)
└──────────┬──────────────────────┘
           │ ID token
┌──────────▼──────────────────────┐
│  WoN Web Frontend               │ React + Vite
│  /api/auth/firebase (backend)   │
└──────────┬──────────────────────┘
           │ JWT session token
┌──────────▼──────────────────────┐
│  WoN Backend                    │ Express + Prisma + SQLite
│  /api/clickforge/characters     │
│  /api/player/*                  │
│  /api/map/*                     │
└─────────────────────────────────┘
```

## Flujo de Auth

1. Usuario ingresa email + password en el frontend
2. Frontend llama a Firebase Auth (`signInWithEmailAndPassword`)
3. Firebase devuelve un ID token
4. Frontend envía ID token a `POST /api/auth/firebase`
5. Backend verifica el token con Firebase Admin SDK
6. Backend crea/actualiza `ClickForgeUser` en Prisma
7. Backend devuelve un JWT de sesión firmado con `JWT_SECRET`
8. Frontend guarda JWT en localStorage (`cf_token`)
9. Frontend usa JWT para todas las llamadas siguientes (personajes, juego)

## Modelo de Datos

```
ClickForgeUser (Prisma)
  id, cfId, email, username, passwordHash, avatarUrl, premium, createdAt, updatedAt
  └── players[] (Player)
  └── gameProfiles[] (GameProfile)

Player (Prisma - personajes reales del juego)
  id, cfUserId?, tgId, nickname, race, class, level, mapX, mapY, hp, stats...

GameProfile (Prisma - resumen por juego para el portal)
  id, cfUserId, gameId, gameTitle, nickname, level, race, class, lastPlayedAt
```

## Firebase Config

Frontend (`web/src/lib/firebase.ts` y login client):
```js
apiKey: "AIzaSyCDraLWWVSD6UXZnCpgWlgRNf1Dr2RCH2I"
authDomain: "clickgames-entertainment.firebaseapp.com"
projectId: "clickgames-entertainment"
```

Backend: `FIREBASE_ADMIN_CREDENTIALS_JSON` o `GOOGLE_APPLICATION_CREDENTIALS` apuntando a un archivo fuera del repo.

## Endpoints

| Método | Path | Auth | Propósito |
|--------|------|------|-----------|
| POST | /api/auth/firebase | Firebase ID token | Login con Firebase |
| POST | /api/clickforge/register | - | (legacy, migrar a Firebase) |
| POST | /api/clickforge/login | - | (legacy, migrar a Firebase) |
| GET | /api/clickforge/profile | JWT | Perfil del usuario |
| GET | /api/clickforge/characters | JWT | Listar personajes |
| POST | /api/clickforge/characters | JWT | Crear personaje |
| POST | /api/clickforge/characters/:id/select | JWT | Seleccionar personaje |
| GET | /api/player/:id | - | Datos completos del personaje |

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/server/routes/firebase-auth.ts` | Endpoint Firebase → JWT |
| `src/server/lib/firebase-admin.ts` | Init Firebase Admin SDK |
| `FIREBASE_ADMIN_CREDENTIALS_JSON` | Credenciales Admin SDK como secreto de entorno |
| `web/src/lib/firebase.ts` | Init Firebase en frontend |
| `web/src/components/AuthGate.tsx` | Auth flow con Firebase |
| `web/src/components/CharacterSelector.tsx` | Creación de personajes |
| `D:\Work\WoN\login\index.html` | Login client con Firebase CDN |
| `D:\Work\WoN\clickforge\api\index.ts` | Proxy a WoN backend (sin auth propia) |

## ClickForge Portal

El portal en `clickforge-gamma.vercel.app` es solo UI. Su `api/index.ts` es un proxy que reenvía todo al WoN backend via `WON_BACKEND_URL`. No tiene base de datos ni auth propios.

Para desarrollo local, `WON_BACKEND_URL` apunta a `http://localhost:3000`.
Para producción, debe apuntar a la URL pública del WoN backend.

## Running Locally

```bash
# Terminal 1: WoN Backend
cd D:\HDD\2026\WorldOfNova-no-deps
npm run server:dev        # localhost:3000

# Terminal 2: WoN Frontend
npm run web:dev           # localhost:5173

# Login: ir a http://localhost:5173
```
