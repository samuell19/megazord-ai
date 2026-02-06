-- Script para criar o banco de dados Megazord AI
-- Execute este script com: psql -U postgres -f setup-database.sql

-- Criar banco de dados
CREATE DATABASE megazord_db;

-- Conectar ao banco
\c megazord_db;

-- Mensagem de sucesso
SELECT 'Banco de dados megazord_db criado com sucesso!' AS status;
