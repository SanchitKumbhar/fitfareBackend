# FitFare Backend

Node.js + Express + MySQL backend for the FitFare nutrition tracking platform.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN`

4. Start server:

```bash
npm run dev
```

Server URL: `http://localhost:5000`

## API Base

`/api`

## Endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
  - body: `{ name, email, password }`
- `POST /api/auth/login`
  - body: `{ email, password }`

### Foods (JWT required)

- `GET /api/foods`
- `POST /api/foods` (multipart/form-data)
  - fields: `name`, `calories`, `protein`, `carbs`, `fats`, optional `image`
- `PUT /api/foods/:id` (multipart/form-data)
- `DELETE /api/foods/:id`

### Meals (JWT required)

- `GET /api/meals?date=YYYY-MM-DD`
- `POST /api/meals`
  - body: `{ date, type, foodId }`
- `DELETE /api/meals/:id`

### Day Completion (JWT required)

- `GET /api/day-completions/:date`
- `PUT /api/day-completions/:date`
  - body: `{ completed: boolean }`

## Database

- SQL schema file: [database/schema.sql](database/schema.sql)
- Schema is auto-created on startup through `src/config/initSchema.js`.

## Uploads

- Uploaded images are stored in `backend/uploads`.
- Files are served from `/uploads/<filename>`.
