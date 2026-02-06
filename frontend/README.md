# Megazord AI Frontend

Frontend do sistema Megazord AI - Interface estilo HUD futurista inspirada no Jarvis.

## Stack Tecnológica

- Angular 18+
- TypeScript
- SCSS
- RxJS
- Angular Router
- Angular Forms

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes da aplicação
│   │   ├── services/        # Services Angular
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── models/          # Interfaces e tipos
│   │   └── app.routes.ts    # Configuração de rotas
│   ├── environments/        # Configurações de ambiente
│   ├── styles.scss          # Estilos globais
│   └── index.html
└── package.json
```

## Setup

1. Instalar dependências:
```bash
npm install
```

2. Iniciar servidor de desenvolvimento:
```bash
npm start
```

3. Acessar aplicação:
```
http://localhost:4200
```

## Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm test` - Executa testes
- `npm run lint` - Executa linter

## Rotas da Aplicação

- `/login` - Página de login
- `/register` - Página de registro
- `/dashboard` - Dashboard principal (protegida)
- `/agents/create` - Criar novo agente (protegida)
- `/agents/:id` - Detalhes do agente (protegida)
- `/settings/api-key` - Configurar API key (protegida)

## Visual Design

Interface estilo HUD futurista com:
- Tema escuro (preto/quase preto)
- Elementos neon: ciano, azul elétrico, verde água
- Núcleo central com anéis concêntricos rotativos
- Painéis laterais de dados
- Indicadores circulares
- Animações sutis (pulso, rotação, scanning)
- Tipografia monoespaçada/técnica
- Visual de centro de comando de IA

## Componentes Principais

### Authentication
- `LoginComponent` - Formulário de login
- `RegisterComponent` - Formulário de registro

### Dashboard
- `DashboardComponent` - Visão geral dos agentes

### Agents
- `AgentCreateComponent` - Criar novo agente
- `AgentDetailComponent` - Detalhes e chat com agente

### Settings
- `ApiKeyConfigComponent` - Configurar API key do OpenRouter

## Services

- `AuthService` - Autenticação e gerenciamento de sessão
- `AgentService` - Gerenciamento de agentes
- `ApiKeyService` - Gerenciamento de API keys

## Guards

- `AuthGuard` - Proteção de rotas autenticadas

## Interceptors

- `AuthInterceptor` - Adiciona token JWT às requisições
