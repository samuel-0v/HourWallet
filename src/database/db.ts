import Database from "better-sqlite3";

export const db = new Database("hourwallet.db", { verbose: console.log });

db.exec(`
-- =============================
-- TABELAS DO PROJETO HOUR WALLET
-- =============================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',        -- campo para diferenciar tipos de usuários (ex: admin, user)
    password TEXT NOT NULL,        -- recomendação: armazenar hash, não senha pura
    average_hourly_rate REAL DEFAULT 0, -- valor médio por hora para cálculo de saldo em dinheiro
    total_hours REAL DEFAULT 0,   -- total de horas acumuladas (para referência, não é o saldo atual)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de entradas de horas trabalhadas
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,            -- data do trabalho (YYYY-MM-DD)
    hours REAL NOT NULL,           -- quantidade de horas trabalhadas
    amount REAL DEFAULT 0,         -- valor recebido nessa entrada
    description TEXT,              -- descrição opcional
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de compras feitas usando saldo em horas
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,            -- data da compra
    item TEXT NOT NULL,            -- nome do item comprado
    price REAL NOT NULL,           -- preço do item em dinheiro
    hours_used REAL NOT NULL,      -- horas consumidas do saldo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================
-- VIEWS ÚTEIS
-- =============================

-- Saldo de horas por usuário
CREATE VIEW IF NOT EXISTS user_hour_balance AS
SELECT
    u.id AS user_id,
    u.username,
    IFNULL(SUM(te.hours), 0) - IFNULL(SUM(p.hours_used), 0) AS hours_balance
FROM users u
LEFT JOIN time_entries te ON te.user_id = u.id
LEFT JOIN purchases p ON p.user_id = u.id
GROUP BY u.id, u.username;
`);