# TechStore — Sistema Distribuído de Vendas

Sistema distribuído para gerenciamento de vendas de uma rede de lojas de eletrônicos, desenvolvido como trabalho A3 da UC Sistemas Distribuídos e Mobile — UNIFACS.

## Integrantes

| Nome | Matrícula |
|---|---|
| Thiago Santos Bahia | 12725136438 |
| João Vitor Guimarães de Oliveira | 1272118643 |
| Lincoln de Melo Alves | 12722113127 |

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20 (Alpine) | Runtime dos microsserviços |
| Express | ^4.18.2 | Framework HTTP / API REST |
| PostgreSQL | 15 (Alpine) | Banco de dados relacional |
| Docker | >= 24.x | Containerização |
| Docker Compose | >= 2.x | Orquestração dos containers |

---

## Arquitetura

O sistema é composto por **3 containers** independentes que se comunicam via rede Docker interna:

```
┌─────────────────────────────────────────────────────────────┐
│                       Docker Network                        │
│                                                             │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │    main-service     │    │     reports-service      │   │
│  │     porta 3000      │    │        porta 3001        │   │
│  │                     │    │                          │   │
│  │  - Clientes (CRUD)  │    │  - Top Produtos          │   │
│  │  - Vendedores (CRUD)│    │  - Produtos por Cliente  │   │
│  │  - Estoque (CRUD)   │    │  - Consumo Médio         │   │
│  │  - Vendas           │    │  - Baixo Estoque         │   │
│  └──────────┬──────────┘    └────────────┬─────────────┘   │
│             │                            │                  │
│             └──────────────┬─────────────┘                  │
│                            │                                │
│                  ┌─────────▼─────────┐                      │
│                  │    PostgreSQL      │                      │
│                  │    porta 5432      │                      │
│                  └───────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

Cada serviço segue o padrão de camadas **MVC + Repository + Service**:

```
Request → Route → Controller → Service → Repository → Database
```

---

## Padrões de Projeto

| Padrão | Arquivo | Descrição |
|---|---|---|
| **Singleton** | `main-service/src/config/database.js` | Garante uma única instância do pool de conexão com o banco |
| **Repository** | `main-service/src/repositories/BaseRepository.js` | Classe base abstrata para acesso a dados; todos os repos herdam dela |
| **Factory** | `main-service/src/patterns/SaleFactory.js` | Centraliza criação e validação do objeto de venda antes de tocar no banco |
| **Strategy** | `reports-service/src/patterns/ReportStrategy.js` | Cada tipo de relatório é uma estratégia independente e intercambiável |
| **Service Layer** | `*/src/services/` | Isola toda a lógica de negócio dos controllers e repositórios |

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
- Git

> Não é necessário instalar Node.js ou PostgreSQL localmente.

---

## Como Executar

```bash
# 1. Clonar o repositório
git clone https://github.com/ThiagoBahia/sd-a3-TechStore.git
cd sd-a3-TechStore/codigo-fonte

# 2. Subir todos os containers
docker compose up --build

# 3. Aguardar as mensagens:
#    ✔ TechStore Main Service rodando na porta 3000
#    ✔ TechStore Reports Service rodando na porta 3001
```

Para rodar em segundo plano:
```bash
docker compose up --build -d
docker compose logs -f   # acompanhar logs
```

Para encerrar:
```bash
docker compose down        # para os containers
docker compose down -v     # para os containers e apaga os dados
```

---

## Dados Iniciais

O sistema inicia automaticamente com:

- **10 produtos** cadastrados (smartphones, notebooks, fones, tablets, periféricos)
- **5 clientes** cadastrados
- **2 vendedores** cadastrados

---

## Endpoints

### Main Service — `http://localhost:3000`

#### Clientes
| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/customers` | Listar todos |
| `GET` | `/api/customers/:id` | Buscar por ID |
| `POST` | `/api/customers` | Criar |
| `PUT` | `/api/customers/:id` | Atualizar |
| `DELETE` | `/api/customers/:id` | Remover |

**Body para criar/atualizar:**
```json
{
  "name": "Ana Silva",
  "email": "ana@email.com",
  "phone": "(71) 98000-0000",
  "address": "Rua das Flores, 123"
}
```

#### Vendedores
| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/sellers` | Listar todos |
| `GET` | `/api/sellers/:id` | Buscar por ID |
| `POST` | `/api/sellers` | Criar |
| `PUT` | `/api/sellers/:id` | Atualizar |
| `DELETE` | `/api/sellers/:id` | Remover |

**Body para criar/atualizar:**
```json
{
  "name": "Marcos Alves",
  "email": "marcos@techstore.com",
  "phone": "(71) 99000-0000",
  "commission_rate": 5.00
}
```

#### Produtos (Estoque)
| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/products` | Listar todos |
| `GET` | `/api/products/:id` | Buscar por ID |
| `POST` | `/api/products` | Criar |
| `PUT` | `/api/products/:id` | Atualizar |
| `DELETE` | `/api/products/:id` | Remover |

**Body para criar/atualizar:**
```json
{
  "name": "iPhone 15 Pro 256GB",
  "description": "Smartphone Apple com chip A17 Pro",
  "price": 8999.00,
  "stock_quantity": 15,
  "category": "Smartphone",
  "brand": "Apple",
  "low_stock_threshold": 3
}
```

#### Vendas
| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/sales` | Listar todas |
| `GET` | `/api/sales/:id` | Buscar por ID |
| `POST` | `/api/sales` | Registrar pedido de compra |
| `PATCH` | `/api/sales/:id/cancel` | Cancelar pedido |
| `DELETE` | `/api/sales/:id` | Remover |

**Body para registrar venda:**
```json
{
  "customer_id": 1,
  "seller_id": 1,
  "notes": "Observações opcionais",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 8999.00 },
    { "product_id": 5, "quantity": 1, "unit_price": 2199.00 }
  ]
}
```

> Ao registrar uma venda, o estoque é decrementado automaticamente.  
> Ao cancelar, o estoque é restaurado.

---

### Reports Service — `http://localhost:3001`

| Método | Rota | Relatório |
|---|---|---|
| `GET` | `/api/reports/top-products?limit=10` | Produtos mais vendidos |
| `GET` | `/api/reports/products-by-customer/:customerId` | Produtos comprados por um cliente |
| `GET` | `/api/reports/customer-avg-consumption` | Consumo médio por cliente |
| `GET` | `/api/reports/low-stock` | Produtos com estoque abaixo do threshold |

---

## Estrutura do Projeto

```
sd-a3-TechStore/
├── codigo-fonte/
│   ├── docker-compose.yml
│   ├── database/
│   │   └── init.sql              # Schema + dados iniciais
│   ├── main-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/
│   │       │   └── database.js   # Singleton
│   │       ├── patterns/
│   │       │   └── SaleFactory.js # Factory
│   │       ├── repositories/
│   │       │   ├── BaseRepository.js  # Repository (base)
│   │       │   ├── CustomerRepository.js
│   │       │   ├── SellerRepository.js
│   │       │   ├── ProductRepository.js
│   │       │   └── SaleRepository.js
│   │       ├── services/
│   │       │   ├── CustomerService.js
│   │       │   ├── SellerService.js
│   │       │   ├── ProductService.js
│   │       │   └── SaleService.js
│   │       ├── controllers/
│   │       └── routes/
│   └── reports-service/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── index.js
│           ├── config/
│           │   └── database.js   # Singleton
│           ├── patterns/
│           │   └── ReportStrategy.js  # Strategy
│           ├── repositories/
│           │   └── ReportRepository.js
│           ├── services/
│           │   └── ReportService.js
│           ├── controllers/
│           └── routes/
└── relatorio/
    └── relatorio.md
```
