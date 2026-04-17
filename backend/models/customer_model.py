from .data_manager import read_data, write_data, CUSTOMERS_FILE

class CustomerModel:
    @staticmethod
    def get_customers():
        return read_data(CUSTOMERS_FILE)

    @staticmethod
    def add_customer(username, password, name):
        customers = read_data(CUSTOMERS_FILE)
        if any(c['username'] == username for c in customers):
            return None  # Already exists
        new_customer = {
            'username': username,
            'password': password,
            'name': name
        }
        customers.append(new_customer)
        write_data(CUSTOMERS_FILE, customers)
        return new_customer

    @staticmethod
    def authenticate(username, password):
        customers = read_data(CUSTOMERS_FILE)
        for customer in customers:
            if customer['username'] == username and customer['password'] == password:
                return customer
        return None