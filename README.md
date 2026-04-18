## Project Overview

The Grocery Store Management System helps manage inventory, customer orders, billing, and store operations through a browser-based UI.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL

## Structure

```text
backend/
  server.js
  package.json
  .env.example
  data/
frontend/
  index.html
  admin.html
  login.html
  orders.html
  invoice.html
  static/
Procfile
README.md
```

## Environment

Create `backend/.env` using this shape:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=grocery_store_hira
DB_USER=root
DB_PASSWORD=your_mysql_password
PORT=5000
```

## Local Run

```bash
cd backend
npm install
npm start
```

The server will:
- create the MySQL database if needed
- create required tables
- import JSON data from `backend/data/` when the tables are empty

## Deployment

The app is configured to run with:

```bash
npm start --prefix backend
```

The `Procfile` already points to the Node backend.
