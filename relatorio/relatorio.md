# TechStore — Relatório do Trabalho A3
**UC:** Sistemas Distribuídos e Mobile  
**Instituição:** UNIFACS

---

## a. Integrantes da Equipe

| Nome Completo | Matrícula |
|---|---|
| Thiago Santos Bahia | 12725136438 |
| João Vitor Guimarães de Oliveira | 1272118643 |
| Lincoln de Melo Alves | 12722113127 |

---

## b. Requisitos de Software

| Software | Versão | Finalidade |
|---|---|---|
| Docker | >= 24.x | Containerização dos serviços |
| Docker Compose | >= 2.x | Orquestração dos containers |
| Node.js | 20 (Alpine) | Runtime dos microsserviços (via Docker) |
| PostgreSQL | 15 (Alpine) | Banco de dados relacional (via Docker) |

> Não é necessário instalar Node.js ou PostgreSQL localmente. Apenas Docker e Docker Compose são necessários.

**Dependências Node.js (instaladas automaticamente pelo Docker):**

| Pacote | Versão | Uso |
|---|---|---|
| express | ^4.18.2 | Framework HTTP / API REST |
| pg | ^8.11.3 | Driver PostgreSQL para Node.js |
| dotenv | ^16.3.1 | Variáveis de ambiente |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |

---

## c. Instruções de Instalação e Execução

### Pré-requisitos
- Docker Desktop instalado e em execução
- Git instalado

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/thiagobahia000/sd-a3-techstore.git
cd sd-a3-techstore/codigo-fonte

# 2. Subir todos os containers
docker-compose up --build

# 3. Aguardar as mensagens:
#    TechStore Main Service rodando na porta 3000
#    TechStore Reports Service rodando na porta 3001
```

### Serviços disponíveis após subida

| Serviço | URL | Descrição |
|---|---|---|
| Main Service | http://localhost:3000 | Clientes, Vendedores, Estoque, Vendas |
| Reports Service | http://localhost:3001 | Relatórios Estatísticos |
| Health (main) | http://localhost:3000/health | Status do serviço principal |
| Health (reports) | http://localhost:3001/health | Status do serviço de relatórios |

### Encerrar
```bash
docker-compose down        # para e remove os containers
docker-compose down -v     # idem + apaga os dados do banco
```

---

## d. Arquitetura, Estratégia e Padrões Utilizados

### Visão Geral — Microsserviços

O sistema TechStore é composto por três containers independentes que se comunicam via rede Docker interna:

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                    │
│                                                     │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │   main-service   │    │   reports-service    │   │
│  │   porta 3000     │    │   porta 3001         │   │
│  │                  │    │                      │   │
│  │ - Clientes       │    │ - Top Produtos       │   │
│  │ - Vendedores     │    │ - Produtos/Cliente   │   │
│  │ - Estoque        │    │ - Consumo Médio      │   │
│  │ - Vendas         │    │ - Baixo Estoque      │   │
│  └────────┬─────────┘    └──────────┬───────────┘   │
│           │                         │               │
│           └──────────┬──────────────┘               │
│                      │                              │
│             ┌────────▼────────┐                     │
│             │    PostgreSQL   │                     │
│             │   porta 5432   │                     │
│             └────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

### Padrão de Arquitetura — MVC em Camadas

Cada microsserviço segue a arquitetura em camadas **MVC + Repository + Service**:

```
Request → Route → Controller → Service → Repository → Database
```

- **Route:** Define o endpoint HTTP e delega ao Controller
- **Controller:** Recebe a requisição, chama o Service, retorna a resposta HTTP
- **Service:** Contém a regra de negócio (validações, transações, lógica)
- **Repository:** Abstrai o acesso ao banco de dados (queries SQL)

### Padrões de Projeto Implementados (5 padrões)

#### 1. Singleton — `config/database.js`
Garante que exista apenas **uma instância** do pool de conexão com o banco durante toda a execução do serviço. Evita abertura desnecessária de múltiplas conexões.

```js
class Database {
  constructor() {
    if (Database._instance) return Database._instance; // retorna instancia existente
    this._pool = new Pool({ ... });
    Database._instance = this;
  }
}
module.exports = new Database(); // exporta a unica instancia
```

#### 2. Repository — `repositories/BaseRepository.js`
Define uma **interface base** para operações de persistência (`findAll`, `findById`, `delete`). Cada repositório concreto (`CustomerRepository`, `SellerRepository`, etc.) estende a base e herda as operações comuns, sobrescrevendo apenas o necessário.

```
BaseRepository
├── CustomerRepository  (herda findAll, findById, delete)
├── SellerRepository    (herda findAll, findById, delete)
├── ProductRepository   (herda findAll, findById, delete)
└── SaleRepository      (sobrescreve findAll e findById com JOINs)
```

#### 3. Factory — `patterns/SaleFactory.js`
Centraliza a **criação e validação** do objeto de venda antes de qualquer operação no banco. Garante que campos obrigatórios estejam presentes e que os tipos sejam corretos antes de processar.

```js
const saleData = SaleFactory.create(req.body); // valida e estrutura
// se inválido, lança erro com statusCode 400 antes de tocar no banco
```

#### 4. Strategy — `reports-service/patterns/ReportStrategy.js`
Cada tipo de relatório é encapsulado em uma **estratégia** independente. O `ReportContext` recebe qualquer estratégia e a executa sem conhecer os detalhes internos. Permite adicionar novos relatórios sem modificar o código existente.

```
ReportContext
├── TopProductsStrategy          → produtos mais vendidos
├── ProductsByCustomerStrategy   → produtos por cliente
├── CustomerAvgConsumptionStrategy → consumo médio
└── LowStockStrategy             → estoque baixo
```

#### 5. Camada de Serviço (Service Layer)
Isola toda a **lógica de negócio** dos controllers e dos repositórios. Gerencia transações de banco de dados, garante consistência dos dados (ex: decrementar estoque atomicamente ao criar uma venda).

### Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| PostgreSQL como banco relacional | Suporte robusto a transações ACID, essencial para operações de venda que alteram múltiplas tabelas atomicamente |
| Serviço de relatórios separado | Requisito do trabalho + boa prática: relatórios podem escalar independentemente das operações transacionais |
| Node.js sem ORM | Queries SQL explícitas tornam o código mais previsível e educativo; sem overhead de abstração |
| Transações no cancelamento | Restaurar estoque e cancelar a venda ocorrem atomicamente — ou tudo ou nada |
| Seed data no init.sql | Garante estado inicial consistente ao subir os containers pela primeira vez |

### Endpoints da API

**Main Service — `http://localhost:3000/api/`**

| Método | Rota | Ação |
|---|---|---|
| GET | /customers | Listar clientes |
| POST | /customers | Criar cliente |
| PUT | /customers/:id | Atualizar cliente |
| DELETE | /customers/:id | Remover cliente |
| GET | /sellers | Listar vendedores |
| POST | /sellers | Criar vendedor |
| PUT | /sellers/:id | Atualizar vendedor |
| DELETE | /sellers/:id | Remover vendedor |
| GET | /products | Listar produtos (estoque) |
| POST | /products | Criar produto |
| PUT | /products/:id | Atualizar produto |
| DELETE | /products/:id | Remover produto |
| GET | /sales | Listar vendas |
| POST | /sales | Registrar venda |
| PATCH | /sales/:id/cancel | Cancelar venda |
| DELETE | /sales/:id | Remover venda |

**Reports Service — `http://localhost:3001/api/reports/`**

| Método | Rota | Relatório |
|---|---|---|
| GET | /top-products | Produtos mais vendidos |
| GET | /products-by-customer/:id | Produtos por cliente |
| GET | /customer-avg-consumption | Consumo médio por cliente |
| GET | /low-stock | Produtos com baixo estoque |
