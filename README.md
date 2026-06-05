# SOLID Masterclass

REST API de registro de usuários construída com Fastify 5, Drizzle ORM e PostgreSQL.

## Stack

| Camada             | Tecnologia                        |
|--------------------|-----------------------------------|
| Framework          | Fastify 5                         |
| Validação          | Zod + `fastify-type-provider-zod` |
| ORM                | Drizzle ORM + `node-postgres`     |
| Banco de dados     | PostgreSQL (Docker)               |
| Testes             | Vitest + Supertest                |
| Linting            | Biome                             |

## Arquitetura

```mermaid
graph TD
    Client["Cliente HTTP"]
    Fastify["Fastify 5"]
    Zod["Zod"]
    Handler["Handler POST /users"]
    Bcrypt["bcrypt"]
    Drizzle["Drizzle ORM"]
    Postgres["PostgreSQL"]

    Client -->|"request"| Fastify
    Fastify -->|"valida"| Zod
    Fastify --> Handler
    Handler --> Bcrypt
    Handler --> Drizzle
    Drizzle --> Postgres
    Handler -->|"response"| Client
```

## Fluxo de Registro

```mermaid
sequenceDiagram
    participant C as Cliente
    participant F as Fastify/Zod
    participant H as Handler
    participant DB as PostgreSQL

    C->>F: POST /users
    alt body inválido
        F-->>C: 400
    end
    F->>H: body validado
    alt senhas diferentes
        H-->>C: 400
    end
    H->>DB: SELECT por email
    alt email em uso
        DB-->>H: encontrado
        H-->>C: 409
    end
    H->>DB: INSERT
    DB-->>H: {id}
    H-->>C: 201 {id}
```

## Schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar email "UNIQUE"
        varchar phone_number "UNIQUE"
        varchar password
        integer age
        enum preferred_marketing_channel
    }
```

## Setup

```bash
docker compose up -d
pnpm install
pnpm db:migrate
pnpm dev
```

Crie um `.env` na raiz:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/solid_masterclass
```
