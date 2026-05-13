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

