# Megazord AI

Sistema de IA completamente customizável inspirado no Jarvis do Homem de Ferro.

## 🎯 Visão Geral

O Megazord AI é uma plataforma que permite aos usuários criar e gerenciar agentes de IA personalizados, utilizando diversos modelos de linguagem através do OpenRouter. O sistema oferece uma interface futurista estilo HUD e arquitetura robusta para expansão futura com tools, MCP, RAG e integrações complexas.

## 🚀 MVP Inicial

Este MVP estabelece a fundação do sistema com:

- ✅ Sistema de autenticação (registro e login)
- ✅ Gerenciamento seguro de API keys do OpenRouter
- ✅ Criação de agentes de IA com seleção de modelos
- ✅ Processamento de mensagens através do OpenRouter
- ✅ Interface HUD futurista estilo Jarvis

## 🛠️ Stack Tecnológica

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcrypt (password hashing)
- AES-256 (API key encryption)

### Frontend
- Angular 18+
- TypeScript
- SCSS
- RxJS
- Angular Router

### External Services
- OpenRouter API (processamento de IA)

## 📁 Estrutura do Projeto

```
megazord-ai/
├── backend/              # API REST Node.js
│   ├── src/
│   │   ├── config/       # Configurações
│   │   ├── controllers/  # Controllers HTTP
│   │   ├── services/     # Lógica de negócio
│   │   ├── repositories/ # Acesso a dados
│   │   ├── models/       # Modelos Sequelize
│   │   ├── middleware/   # Middlewares
│   │   ├── routes/       # Rotas da API
│   │   └── migrations/   # Migrações do banco
│   └── package.json
├── frontend/             # Interface Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   └── environments/
│   └── package.json
└── README.md
```

## 🚦 Setup Rápido

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Criar banco de dados
createdb megazord_db

# Executar migrações
npm run migrate

# Iniciar servidor
npm run dev
```

Backend rodando em: `http://localhost:3000`

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

Frontend rodando em: `http://localhost:4200`

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10+ salt rounds)
- API keys criptografadas com AES-256
- Autenticação via JWT
- Rate limiting em endpoints de autenticação
- CORS configurado
- HTTPS em produção

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/validate` - Validar token

### API Keys
- `POST /api/api-keys` - Armazenar API key
- `GET /api/api-keys` - Obter API key (mascarada)
- `PUT /api/api-keys` - Atualizar API key
- `DELETE /api/api-keys` - Deletar API key

### Agents
- `POST /api/agents` - Criar agente
- `GET /api/agents` - Listar agentes
- `GET /api/agents/:id` - Obter agente
- `PUT /api/agents/:id` - Atualizar agente
- `DELETE /api/agents/:id` - Deletar agente
- `POST /api/agents/:id/message` - Enviar mensagem

## 🎨 Design Visual

Interface estilo HUD futurista com:
- Tema escuro (preto/quase preto)
- Elementos neon: ciano, azul elétrico, verde água
- Núcleo central com anéis concêntricos rotativos
- Painéis laterais de dados
- Indicadores circulares
- Animações sutis (pulso, rotação, scanning)
- Tipografia monoespaçada/técnica

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 🗺️ Roadmap Futuro

- [ ] Integração com tools customizadas
- [ ] Suporte a MCP (Model Context Protocol)
- [ ] Sistema RAG (Retrieval-Augmented Generation)
- [ ] Criação de rotinas automatizadas
- [ ] Integrações com APIs externas
- [ ] Sistema de memória persistente
- [ ] Multi-agente com colaboração
- [ ] Dashboard de analytics

## 📄 Licença

MIT

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.
