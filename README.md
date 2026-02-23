# Tienda Mabel

Backend Express + Prisma (SQLite) y frontend React/Vite.

## Requisitos
- Node.js 18+

## Ejecucion local
```bash
npm install
npm run start
```

## Variables de entorno
Mantener las actuales y agregar estas para recuperacion por email:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Ejemplo:

```env
JWT_SECRET=super-secreto
ADMIN_USERS=FranYRolo:belgrano23
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-cuenta@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="Tienda Mabel <tu-cuenta@gmail.com>"
```

Si faltan variables SMTP, el servidor arranca igual y `POST /api/auth/forgot-password` responde `Email service not configured`.

## Endpoints de auth (email/password)

### Registro cliente
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","username":"cliente01","password":"clave1234"}'
```

### Login cliente
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cliente01","password":"clave1234"}'
```

### Forgot password (envia codigo)
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com"}'
```

### Verificar codigo y loguear
```bash
curl -X POST http://localhost:3000/api/auth/reset-password/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","code":"123456"}'
```

### Resetear contrasena (opcional)
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","code":"123456","newPassword":"nuevaClave123"}'
```

### Login admin
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"FranYRolo","password":"belgrano23"}'
```

## Admin inicial
Se asegura el usuario admin inicial si no existe:

- email: `eccomfyarg@gmail.com`
- username: `FranYRolo`
- password: `belgrano23`

Y tambien se respeta `ADMIN_USERS` con formato:

```env
ADMIN_USERS=usuario:password,usuario2:password2
```
