# Database Schema - Megazord AI

## Estrutura de Tabelas

### 1. **users**
Armazena os usuários do sistema.
- `id` (UUID, PK)
- `email` (String, unique)
- `username` (String, unique)
- `password_hash` (String)
- `created_at`, `updated_at`

### 2. **api_keys**
Armazena as API keys criptografadas dos usuários.
- `id` (UUID, PK)
- `user_id` (UUID, FK → users) **CASCADE DELETE**
- `encrypted_key` (Text)
- `created_at`, `updated_at`

### 3. **agents**
Agentes de IA criados pelos usuários.
- `id` (UUID, PK)
- `user_id` (UUID, FK → users) **CASCADE DELETE**
- `name` (String)
- `model` (String) - ex: "openai/gpt-4"
- `configuration` (JSONB) - temperatura, max_tokens, etc.
- `created_at`, `updated_at`

### 4. **sessions** ⭐ NOVO
Sessões de conversa com um agente.
- `id` (UUID, PK)
- `agent_id` (UUID, FK → agents) **CASCADE DELETE**
- `user_id` (UUID, FK → users) **CASCADE DELETE**
- `title` (String, nullable) - Título auto-gerado ou definido pelo usuário
- `emoji` (String, nullable) - Emoji representativo da sessão (padrão: 💬)
- `description` (Text, nullable) - Descrição resumida da conversa
- `metadata` (JSONB) - Tags, contexto adicional, etc.
- `is_active` (Boolean) - Se a sessão está ativa
- `last_message_at` (DateTime) - Timestamp da última mensagem
- `created_at`, `updated_at`

**Índices**: agent_id, user_id, is_active, last_message_at

### 5. **messages** ⭐ NOVO
Mensagens individuais dentro de uma sessão.
- `id` (UUID, PK)
- `session_id` (UUID, FK → sessions) **CASCADE DELETE**
- `role` (ENUM: 'user', 'assistant', 'system')
- `content` (Text) - Conteúdo da mensagem
- `metadata` (JSONB) - Modelo usado, configurações, etc.
- `tokens_used` (Integer, nullable) - Tokens gastos (para mensagens da IA)
- `processing_time_ms` (Integer, nullable) - Tempo de processamento
- `error` (Text, nullable) - Mensagem de erro se falhou
- `parent_message_id` (UUID, FK → messages, nullable) **SET NULL** - Para conversas ramificadas
- `created_at`, `updated_at`

**Índices**: session_id, role, created_at, parent_message_id

### 6. **attachments** ⭐ NOVO
Anexos associados a mensagens (enviados pelo usuário ou gerados pela IA).
- `id` (UUID, PK)
- `message_id` (UUID, FK → messages) **CASCADE DELETE**
- `type` (ENUM: 'image', 'document', 'pdf', 'code', 'chart', 'graph', 'table', 'audio', 'video', 'other')
- `mime_type` (String, nullable) - ex: "image/png", "application/pdf"
- `file_name` (String, nullable)
- `file_size` (Integer, nullable) - Tamanho em bytes
- `storage_path` (String, nullable) - Caminho no storage (S3, local, etc.)
- `storage_url` (String, nullable) - URL pública para acessar
- `content` (Text, nullable) - Para anexos baseados em texto (código, snippets)
- `metadata` (JSONB) - Dimensões de imagem, duração de áudio/vídeo, etc.
- `is_generated` (Boolean) - Se foi gerado pela IA
- `processing_status` (ENUM: 'pending', 'processing', 'completed', 'failed')
- `created_at`, `updated_at`

**Índices**: message_id, type, is_generated, processing_status

## Relacionamentos

```
users (1) ──┬─→ (N) agents
            ├─→ (1) api_keys
            └─→ (N) sessions

agents (1) ──→ (N) sessions

sessions (1) ──→ (N) messages

messages (1) ──┬─→ (N) attachments
               └─→ (N) messages (self-reference para threads)
```

## Casos de Uso

### 1. **Criar nova conversa**
```sql
-- Criar sessão
INSERT INTO sessions (agent_id, user_id, title, is_active)
VALUES ('agent-uuid', 'user-uuid', 'Nova conversa', true);

-- Adicionar primeira mensagem do usuário
INSERT INTO messages (session_id, role, content)
VALUES ('session-uuid', 'user', 'Olá, como você está?');

-- Adicionar resposta da IA
INSERT INTO messages (session_id, role, content, tokens_used, processing_time_ms)
VALUES ('session-uuid', 'assistant', 'Olá! Estou bem...', 150, 1200);
```

### 2. **Enviar mensagem com anexo**
```sql
-- Mensagem do usuário
INSERT INTO messages (session_id, role, content)
VALUES ('session-uuid', 'user', 'Analise esta imagem');

-- Anexo da mensagem
INSERT INTO attachments (message_id, type, mime_type, file_name, storage_url, is_generated)
VALUES ('message-uuid', 'image', 'image/png', 'screenshot.png', 'https://...', false);
```

### 3. **IA gera gráfico**
```sql
-- Resposta da IA
INSERT INTO messages (session_id, role, content, tokens_used)
VALUES ('session-uuid', 'assistant', 'Aqui está o gráfico solicitado:', 200);

-- Gráfico gerado
INSERT INTO attachments (message_id, type, mime_type, storage_url, is_generated, processing_status)
VALUES ('message-uuid', 'chart', 'image/svg+xml', 'https://...', true, 'completed');
```

### 4. **Listar conversas recentes**
```sql
SELECT s.*, COUNT(m.id) as message_count
FROM sessions s
LEFT JOIN messages m ON m.session_id = s.id
WHERE s.user_id = 'user-uuid' AND s.is_active = true
GROUP BY s.id
ORDER BY s.last_message_at DESC
LIMIT 20;
```

### 5. **Carregar histórico de conversa**
```sql
SELECT m.*, 
       json_agg(a.*) as attachments
FROM messages m
LEFT JOIN attachments a ON a.message_id = m.id
WHERE m.session_id = 'session-uuid'
GROUP BY m.id
ORDER BY m.created_at ASC;
```

## Benefícios da Estrutura

✅ **Persistência**: Conversas não são perdidas ao recarregar a página
✅ **Histórico**: Usuário pode acessar conversas antigas
✅ **Attachments separados**: Não sobrecarrega a tabela de mensagens
✅ **Suporte a múltiplos tipos**: Imagens, PDFs, gráficos, código, etc.
✅ **IA pode gerar conteúdo**: Gráficos, tabelas, PDFs, etc.
✅ **Metadata flexível**: JSONB permite armazenar dados adicionais
✅ **Performance**: Índices otimizados para queries comuns
✅ **Branching**: Suporte a conversas ramificadas (parent_message_id)
✅ **Métricas**: Tokens usados, tempo de processamento

## Próximos Passos

1. Criar repositories para Session, Message e Attachment
2. Criar services para gerenciar sessões e mensagens
3. Atualizar MessageProcessor para salvar no banco
4. Criar endpoints REST para:
   - Listar sessões
   - Criar nova sessão
   - Carregar histórico de mensagens
   - Upload de attachments
   - Download de attachments gerados
5. Atualizar frontend para usar sessões persistentes
