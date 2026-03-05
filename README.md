# Hope — Cypress E2E com Mapas e Geolocalização

Projeto de estudos e automação de testes End-to-End (E2E) com **Cypress** focado em **mapas (Leaflet/React-Leaflet)** e **geolocalização (Web Geolocation API)**.

Além da validação funcional da UI, este projeto inclui:

- Estratégias de **mock/stub de geolocalização**.
- Interações reais com mapa (marcadores, popups e links de rota).
- Controle total de dados de teste via **MongoDB** (seed/cleanup)
- Relatórios com **Allure**.

---

## Conteúdo abordado

- Configuração básica do ambiente de teste com Cypress
- Testes em funcionalidades relacionadas a mapas e geolocalização
- Estratégias para simular diferentes localizações e cenários de mapa
- Controle de massa de dados e setup/cleanup (MongoDB + LocalStorage)
- Automação com Custom Commands e Page Objects

### Trilha (tópicos do estudo)

- Preparando o Projeto Hope: Instalando Dependências e Pacotes npm
- Começando com Cypress: Configuração Inicial para Testes End-to-End
- Mock de Geolocalização e Estratégias Avançadas para Preenchimento de Formulários
- Controle Total de Dados de Teste com LocalStorage e MongoDB
- Consumindo APIs e Automatizando Ações com Page Objects
- Upload de Imagens: Ajustes e Boas Práticas
- Interagindo com Mapas: Técnicas Práticas no Cypress
- Refatorações, Custom Commands e Configurações Avançadas
- Finalizando com Factory de Massa de Testes e Relatórios Allure

---

## Estrutura do repositório

```text
hope/
  api/                 # API utilizada pelos testes E2E
  web/                 # Aplicação + Cypress (E2E)
  .env                 # Variáveis usadas pelos testes (Cypress/Mongo/API)
```

---

## Pré-requisitos

- Node.js (recomendado **18+**) e npm
- MongoDB acessível (local ou remoto)
- (Opcional) Java instalado para geração de relatório Allure em alguns ambientes

---

## Variáveis de ambiente (`.env`)

O Cypress carrega o `.env` **na raiz do repositório** (arquivo `hope/.env`).

Exemplo recomendado (não comite credenciais reais):

```bash
BASE_URL=http://localhost:3000
BASE_API=http://localhost:3333

# MongoDB usado pelo plugin cypress-mongodb e também pela API
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=HopeDB
```

Onde são usadas:

- `BASE_URL`: `baseUrl` do Cypress (app web)
- `BASE_API`: URL da API usada em `cy.request()` e testes
- `MONGO_URI` e `DATABASE_NAME`: usados pelo **cypress-mongodb** (drop/cleanup, deleteMany etc.) e pela API

---

## Instalação (dependências)

Este repositório tem **dois projetos** com dependências próprias: `api/` e `web/`.

### 1) API

```bash
cd api
npm install
```

### 2) Web + Cypress

```bash
cd web
npm install
```

---

## Dependências instaladas (o que foi instalado)

Abaixo estão as dependências **diretamente relacionadas à automação** (Cypress, dados e relatórios) conforme `web/package.json`.

### Automação (web)

- `cypress` `^15.11.0` — testes E2E
- `cypress-mongodb` `^6.3.0` — controle de massa de dados no MongoDB (drop, deleteMany, etc.)
- `@mmisty/cypress-allure-adapter` `^4.0.1` — integração Cypress → Allure
- `allure-commandline` `^2.37.0` — gerar/abrir relatório Allure
- `@faker-js/faker` `^10.3.0` — geração de massa de teste
- `faker-br` `^0.5.0` — faker pt-BR (presente no projeto)
- `dotenv` `^17.3.1` — leitura do `.env` (baseUrl, API, Mongo)
- `@babel/plugin-proposal-private-property-in-object` `^7.21.11` — dependência de build/transpilação (presente no projeto)

---

## Como rodar os testes E2E (Cypress)

Os testes ficam em `web/cypress/e2e`.

Pré-condições para E2E:

- App acessível em `BASE_URL` (ex.: `http://localhost:3000`)
- API acessível em `BASE_API` (ex.: `http://localhost:3333`)
- MongoDB acessível em `MONGO_URI`

### Subir o ambiente (mínimo para rodar E2E)

Em um terminal (API):

```bash
cd api
npm run dev
```

Em outro terminal (Web):

```bash
cd web
npm start
```

### Abrir o runner interativo

```bash
cd web
npx cypress open
```

### Rodar no modo headless

```bash
cd web
npx cypress run
```

> Dica: `baseUrl` é definido via `.env` (`BASE_URL`).

---

## Configuração do Cypress (como está hoje)

A configuração principal fica em `web/cypress.config.js` e foi pensada para:

- Ler variáveis do `.env` da raiz (`hope/.env`), mesmo executando o Cypress dentro de `web/`.
- Habilitar plugins de relatório (Allure) e comandos de banco (MongoDB).

Pontos principais:

- **Carregamento do `.env`**: `dotenv` é carregado apontando para `../.env`.
- **specPattern**: executa primeiro o setup em `web/cypress/support/hooks/index.cy.js` e depois os specs de `web/cypress/e2e/**`.
- **baseUrl**: vem de `BASE_URL`.
- **env**:
  - `baseApi`: vem de `BASE_API` (usado em seeds com `cy.request()`)
  - `mongodb.uri` e `mongodb.database`: vêm de `MONGO_URI` e `DATABASE_NAME`.
- **viewport**: `1440x900`.

No suporte global (`web/cypress/support/e2e.js`):

- Allure adapter é carregado via `@mmisty/cypress-allure-adapter/support`.
- Os comandos do `cypress-mongodb` são adicionados com `addCommands()`.
- Os comandos customizados do projeto são carregados por `./commands`.

---

## Estratégia de dados (MongoDB) — seed e cleanup

Este projeto usa o plugin **cypress-mongodb** para controlar o estado do banco durante os testes.

- Existe um “setup spec” em `web/cypress/support/hooks/index.cy.js` que executa um `dropCollection('orphanages')` antes do restante.
- Os testes utilizam comandos do plugin como `cy.deleteMany(...)` para limpar registros por critério.

Além disso, o projeto também tem rotas úteis na API (quando fizer sentido limpar via HTTP):

- `GET /orphanages` — lista orfanatos (com filtro por `name` via query)
- `GET /orphanages/:_id` — detalhe
- `POST /orphanages` — cria orfanato com `multipart/form-data` (imagens via Multer)
- `DELETE /helper/orphanages?name=<nome>` — remove por nome (helper)

O comando `cy.postOrphanage(orphanage)` faz o seed pelo endpoint `POST /orphanages`, anexando uma imagem real de `web/cypress/fixtures/images/`.

Benefícios:

- Menos flakiness (estado previsível)
- Testes independentes (cada spec prepara seu cenário)

---

## Mapas e Geolocalização — como os testes funcionam

### 1) Mock de Geolocalização (Web Geolocation API)

Para garantir determinismo e evitar dependência do GPS/permissões do navegador, os testes usam um comando customizado `cy.goto(url, latitude, longitude)`.

O que ele faz:

- Executa `cy.visit()` com `onBeforeLoad(win)`
- Garante que `win.navigator.geolocation` existe
- Faz stub de:
  - `navigator.geolocation.getCurrentPosition`
  - `navigator.geolocation.watchPosition`

Isso permite simular qualquer coordenada antes do React montar os componentes.

Arquivo: `web/cypress/support/commands.js`.

### 2) Persistência de posição via LocalStorage

Na tela de cadastro (`/orphanages/create`), o app grava latitude/longitude em:

- `hope-qa:latitude`
- `hope-qa:longitude`

Os testes aproveitam isso com `cy.setMapPosition(position)` para forçar a posição do formulário sem depender do clique no mapa.

### 3) Interações com o Leaflet

Nos testes, o mapa é interagido via seletores do Leaflet, por exemplo:

- `.leaflet-marker-pane .leaflet-marker-icon` — lista de marcadores
- `.leaflet-popup-content` — conteúdo do popup

Há um comando `cy.openOrphanage(name)` que:

- Navega para `/map`
- Itera pelos marcadores
- Clica e lê o popup até encontrar o orfanato desejado
- Acessa o link do popup

Arquivo: `web/cypress/support/views/map.js`.

### 4) Validação de link do Google Maps

Após abrir um orfanato, o teste valida que o link “Ver rotas no Google Maps” possui o `href` exatamente no formato:

```text
https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>
```

Comando: `cy.googleMapLink(position)` em `web/cypress/support/views/components.js`.

---

## API do Cypress usada no projeto (o “como”)

Pontos importantes usados nos testes:

- `cy.visit(url, { onBeforeLoad })` — stub de APIs do browser antes do app carregar
- `Cypress.sinon.stub(...)` — stubs síncronos (sem `cy.*` dentro do stub)
- `cy.request(...)` — seed de dados via API (ex.: `cy.postOrphanage` envia `multipart/form-data`)
- `cy.fixture(...)` + `Cypress.Blob.binaryStringToBlob(...)` — upload de imagem real nos testes
- `cy.contains(...)`, `cy.get(...)`, `.should(...)` — asserções e seleção de elementos

---

## Relatórios com Allure

O projeto está configurado com:

- `@mmisty/cypress-allure-adapter` (plugin + support)
- `allure-commandline`

Os resultados são gerados em `web/allure-results/`.

### Gerar relatório

Após rodar `npx cypress run`:

```bash
cd web
npx allure generate allure-results --clean -o allure-report
```

### Abrir relatório

```bash
cd web
npx allure open allure-report
```

---

## Publicar o Allure no GitHub (Pages)

Este repositório já está preparado com um workflow que:

- sobe MongoDB (service)
- inicia API + Web
- roda `npx cypress run`
- gera `web/allure-report`
- publica o relatório no **GitHub Pages**

Arquivo do workflow: `.github/workflows/allure-pages.yml`

Como habilitar no GitHub:

1. Crie o repositório e faça o push do projeto
2. No GitHub, vá em **Settings → Pages**
3. Em **Build and deployment**, selecione **Source: GitHub Actions**
4. Rode o workflow em **Actions** (ou faça push na branch `main`/`master`)

Depois do deploy, o link aparece no job “Deploy to GitHub Pages” e também em **Settings → Pages**.

### Link do relatório (Pages)

- URL: https://rafarfelipe.github.io/cypress-xp-maps/

### Status do pipeline

[![E2E (Cypress) + Allure (Pages)](https://github.com/rafarfelipe/cypress-xp-maps/actions/workflows/allure-pages.yml/badge.svg)](https://github.com/rafarfelipe/cypress-xp-maps/actions/workflows/allure-pages.yml)

---

## Specs existentes (E2E)

- `web/cypress/e2e/home.cy.js`
  - Smoke test do frontend (homepage online)

- `web/cypress/e2e/register.cy.js`
  - Cadastro de orfanatos (fluxo feliz)
  - Validações e cenários negativos (campos obrigatórios e duplicidade)

- `web/cypress/e2e/map.cy.js`
  - Seleção de orfanato pelo mapa
  - Validação do link de rota do Google Maps

---

## Troubleshooting rápido

- **Cypress abre, mas o app não carrega**: confira `BASE_URL` no `.env`.
- **Falha em comandos MongoDB**: valide `MONGO_URI` e `DATABASE_NAME` no `.env` e se o cluster permite conexão.
- **Geolocalização não atualiza**: verifique se os testes usam `cy.goto(...)` (stub antes do app carregar).
- **Allure não gera**: rode `npx cypress run` antes e confirme que existe pasta `web/allure-results`.

---

## Observações de segurança

- Evite commitar credenciais reais no `.env` (especialmente `MONGO_URI`).
- Prefira usar variáveis locais e/ou secrets do CI.
