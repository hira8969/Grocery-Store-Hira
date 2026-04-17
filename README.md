## 📌 Project Overview

The Grocery Store Management System is a desktop application designed to streamline the day-to-day operations of a retail grocery store. It allows administrators to manage inventory, process customer bills, track sales, and maintain product records efficiently. This project aims to replace manual bookkeeping with a digital, automated solution.

---

## ✨ Key Features

* **Admin Dashboard:** Secure login and control panel for store administrators.
* **Inventory Management:** effortless adding, updating, and deleting of products (Price, Category, Quantity).
* **Billing System:** Automated calculation of total costs with a generated receipt/invoice.
* **Category Filtering:** Sort products by specific categories (e.g., Meat, Vegetables, Dairy).
* **Sales Records:** Keep track of transaction history and daily sales.

---

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** pattern for better code organization and maintainability.

### Structure
```
├── backend/               # Backend application
│   ├── app.py             # Main Flask application
│   ├── models/            # Data models and business logic
│   │   ├── __init__.py
│   │   ├── data_manager.py
│   │   ├── user_model.py
│   │   ├── customer_model.py
│   │   ├── inventory_model.py
│   │   └── order_model.py
│   ├── controllers/       # Route handlers and controllers
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── inventory_controller.py
│   │   ├── order_controller.py
│   │   └── view_controller.py
│   ├── data/              # JSON data storage
│   ├── bills/             # Generated bills
│   └── generate_data.py   # Data generation script
├── frontend/              # Frontend assets
│   ├── templates/         # Jinja2 HTML templates
│   │   ├── index.html
│   │   ├── admin.html
│   │   ├── login.html
│   │   ├── orders.html
│   │   └── invoice.html
│   └── static/            # Static assets (CSS, JS, images)
│       ├── css/
│       ├── js/
│       └── images/
└── README.md              # Project documentation
```

### MVC Components
- **Models:** Handle data operations, validation, and business logic
- **Views:** HTML templates rendered by Flask
- **Controllers:** Flask blueprints handling HTTP requests and responses