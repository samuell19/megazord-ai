# Megazord AI Backend

Backend do sistema Megazord AI - Sistema de IA customizável estilo Jarvis.

## Stack Tecnológica

- Node.js + Express
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcrypt (password hashing)
- AES-256 (API key encryption)

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (database, etc)
│   ├── controllers/     # Controllers HTTP
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso a dados
│   ├── models/          # Modelos Sequelize
│   ├── middleware/      # Middlewares Express
│   ├── routes/          # Rotas da API
│   ├── types/           # TypeScript types
│   ├── migrations/      # Migrações do banco
│   └── index.ts         # Entry point
├── dist/                # Código compilado
└── package.json
```

## Setup

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. Criar banco de dados PostgreSQL:
```bash
createdb megazord_db
```

4. Executar migrações:
```bash
npm run migrate
```

5. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em produção
- `npm run migrate` - Executa migrações
- `npm run migrate:undo` - Desfaz última migração
- `npm test` - Executa testes
- `npm run test:watch` - Executa testes em modo watch

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registrar novo usuário
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
- `GET /api/agents` - Listar agentes do usuário
- `GET /api/agents/:id` - Obter agente específico
- `PUT /api/agents/:id` - Atualizar agente
- `DELETE /api/agents/:id` - Deletar agente
- `POST /api/agents/:id/message` - Enviar mensagem ao agente

## Arquitetura

O backend segue o padrão **Controller-Repository-Service**:

- **Controllers**: Recebem requisições HTTP, validam input, delegam para Services
- **Services**: Contêm lógica de negócio, orquestram operações
- **Repositories**: Gerenciam acesso ao banco de dados via Sequelize

## Segurança

- Senhas hasheadas com bcrypt (10+ salt rounds)
- API keys criptografadas com AES-256
- Autenticação via JWT
- Rate limiting em endpoints de autenticação
- CORS configurado
