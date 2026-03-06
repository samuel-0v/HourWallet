# 🕒 HourWallet

**HourWallet** é uma aplicação web que funciona como um banco de horas digital, onde o tempo de trabalho é registrado, calculado em valor monetário e pode ser “gasto” em compras convertendo o preço em horas trabalhadas.

---

## 🌟 Funcionalidades Principais

- Registro de **horas trabalhadas** e **valor recebido**.
- Cálculo automático do **valor da hora**.
- Controle de **saldo em horas**.
- Conversão de **preços de produtos em horas** para controle de gastos.
- Histórico detalhado de entradas e saídas (como extrato bancário).
- Estatísticas de tempo gasto x dinheiro.
- Possível gamificação ou alertas de saldo.

---

## 🛠 Tecnologias

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js + **Fastify** + **TypeScript**
* **Banco de dados:** **SQLite** (usando **better-sqlite3** ou **sqlite3**)
* **Validação de dados:** **Zod**
* **Autenticação:** **JWT** + **bcrypt** para hash de senhas

---

## ⚡ Como Usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/samuel-0v/HourWallet