# Product Catalog API

API REST para catálogo de produtos internos.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 |
| Linguagem | TypeScript 5 (strict) |
| Banco de dados | PostgreSQL 16 |
| ORM | TypeORM 0.3 |
| Mensageria | BullMQ + Redis 7 |
| CQRS | @nestjs/cqrs |
| Logging | nestjs-pino + pino-pretty |
| Testes unitários | Vitest |
| Testes e2e | Vitest + SWC + Supertest |
| Documentação | Swagger (@nestjs/swagger) |
| Health Check | @nestjs/terminus |

## Arquitetura

O projeto foi desenvolvido utilizando as práticas de **DDD + Clean Architecture + CQRS**.

```
src/
├── modules/
│   ├── product/
│   │   ├── domain/          # Entidades, eventos, exceções, repositório (interface)
│   │   ├── application/     # Commands, queries, handlers, ports
│   │   ├── infrastructure/  # TypeORM, mappers, publisher BullMQ
│   │   └── presentation/    # Controller, DTOs
│   └── category/            # Mesma estrutura
├── audit/
│   ├── consumers/           # Processor BullMQ → grava audit_logs
│   └── persistence/         # ORM entity + repositório
├── shared/
│   ├── domain/              # BaseEntity, DomainEvent
│   └── exceptions/          # DomainExceptionFilter
└── health/                  # GET /health (PostgreSQL + Redis)
```

### Princípios que foram seguidos

- O domínio não conhece infraestrutura (entidades não importam TypeORM, BullMQ ou qualquer lib externa)
- Regras de negócio estão localizadas somente no domínio (`product.entity.ts`, `category.entity.ts`)
- Repositórios são interfaces no domínio, implementações na infra e consumidos pela camada de aplicação
- Commands são utilizados para operações que alteram o estado
- Queries apenas fazem apenas leitura
- Auditoria é assíncrona via BullMQ(para garantir que falhas não afetam o fluxo principal)

## Pré-requisitos

- Node.js 20+
- Docker 20.10+ e Docker Compose

## Configuração do ambiente

```bash
# Instala dependências
npm install

# Copia as variáveis de ambiente
cp .env.example .env
```

O `.env` gerado já contém os valores padrão para rodar localmente o projeto:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=catalog
DATABASE_USER=catalog
DATABASE_PASSWORD=catalog
DATABASE_SYNCHRONIZE=false

REDIS_HOST=localhost
REDIS_PORT=6379

PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Rodando localmente

O `start:dev` sobe postgres e redis via Docker automaticamente antes de iniciar a aplicação:

```bash
npm run start:dev
```

Na primeira execução aplique as migrations em outro terminal:

```bash
npm run migration:run
```

Para acessar o Swagger em: `http://localhost:3000/docs`

## Testes

```bash
# Unitários
npm run test

# E2e (necessário postgres e redis rodando)
npm run test:e2e

# Cobertura
npm run test:cov
```

## Rodando com Docker

Sobe todos os serviços (postgres, redis e app) em container e executa as migrations automaticamente:

```bash
npm run docker:up
```

Para os serviços:

```bash
npm run docker:down
```

Reseta completamente (apaga volumes):

```bash
npm run docker:reset
```

## Endpoints

A documentação completa está disponível no Swagger em `/docs`.

### Health

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status do PostgreSQL e Redis |

## Regras de negócio implementadas

### Product

- `activate()`: Necessário pelo menos uma categoria e um atributo(não permite ativar se existir outro produto com o mesmo nome)
- `archive()`: Dispara uma exceção se já está arquivado
- `addAttribute()`: Não permite 'keys' duplicadas (bloqueado se ARCHIVED)
- `updateAttribute()`, `removeAttribute()`, `addCategory()`, `removeCategory()`: Bloqueados se ARCHIVED
- `updateName()`: Bloqueado se ARCHIVED(produtos arquivados não podem ter o nome alterado)
- `updateDescription()`: Permitido em qualquer status, inclusive ARCHIVED

### Category

- Nome único globalmente
- `parentId` opcional; não pode ser o próprio id

## Logging

Todos os logs são estruturados via `nestjs-pino`.

Cada operação realizada com sucesso emite um log `info` com os campos:

```
{
  "level": "info",
  "msg": "Product created",
  "action": "product.create",
  "productId": "uuid",
  "correlationId": "uuid",
  "durationMs": 12
}
```

Exceções de domínio são logadas pelo `DomainExceptionFilter` com nível `warn` (4xx) ou `error` (5xx):

```
{
  "level": "warn",
  "msg": "Product is archived",
  "action": "patch /products/:id",
  "correlationId": "uuid",
  "error": "ProductArchivedException"
}
```

### Correlation ID

Todos os endpoints aceitam o header `X-Correlation-ID`. Caso ele não seja informado, será utilizado um UUID.

## Auditoria

Todo domain event é publicado de forma assíncrona na fila (BullMQ + Redis) após a persistência. O consumer `AuditEventProcessor` é responsável por gravar os eventos na tabela `audit_logs`.

Estratégia utilizada
- Retry: 3 tentativas com backoff exponencial(ex.: 1s, 2s, 4s)
- Falhas não afetam o fluxo principal da aplicação
- Falhas são registradas via log estruturado com nível "error"
