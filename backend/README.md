# Setup backend

> [!IMPORTANT] 
> Ensure you have a .env file in the root project directory.

> [!NOTE]
> Current `prisma.schema` and `seed.ts` files are placeholders to verify the database connection

1. Pull and run the db container (from root project directory)

```
docker compose up -d # or 'podman compose up -d'
cd backend/
```

2. Install dependencies:
```bash
bun install
```

3. Link .env and generate Prisma Client files:
```bash
# For Linux and macOS
bun run setup

# For Windows
bun run setup-win
```

4. Seed the database:
```bash
bun run seed
```

5. Run development server:
```bash
bun run dev
```


# API Endpoints

+ `GET /health`: Returns `200 OK` to confirm the server is reachable.

+ `GET /api/v1/users`: Returns a list of all users from the database.
> [!NOTE]
> This endpoint is a placeholder for testing purposes.


# Other scripts

+ Run Prisma Studio:
```bash
bun run studio
```

+ Run production server:
```bash
bun run start
```


