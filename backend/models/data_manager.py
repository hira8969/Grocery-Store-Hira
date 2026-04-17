import json
import os

DATA_DIR = 'data'
INVENTORY_FILE = os.path.join(DATA_DIR, 'inventory.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
CUSTOMERS_FILE = os.path.join(DATA_DIR, 'customers.json')
ORDERS_DIR = os.path.join(DATA_DIR, 'orders')

def read_data(file_path):
    """Reads JSON data from a file."""
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def write_data(file_path, data):
    """Writes JSON data to a file."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def init_data():
    """Initializes necessary directories and files."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    if not os.path.exists(ORDERS_DIR):
        os.makedirs(ORDERS_DIR)
    if not os.path.exists(INVENTORY_FILE):
        write_data(INVENTORY_FILE, [])
    if not os.path.exists(USERS_FILE):
        write_data(USERS_FILE, [{'username': 'admin', 'password': 'password123'}])
    if not os.path.exists(CUSTOMERS_FILE):
        write_data(CUSTOMERS_FILE, [])