import os
from datetime import datetime
from .data_manager import read_data, write_data, ORDERS_DIR

class OrderModel:
    @staticmethod
    def get_all_orders():
        all_orders = []
        for filename in sorted(os.listdir(ORDERS_DIR), reverse=True):
            if filename.endswith('.json'):
                order_data = read_data(os.path.join(ORDERS_DIR, filename))
                all_orders.append(order_data)
        return all_orders

    @staticmethod
    def get_orders_by_username(username):
        customer_orders = []
        for filename in sorted(os.listdir(ORDERS_DIR), reverse=True):
            if filename.endswith('.json'):
                order_data = read_data(os.path.join(ORDERS_DIR, filename))
                if order_data.get('username') == username:
                    customer_orders.append(order_data)
        return customer_orders

    @staticmethod
    def create_order(username, cart):
        from .inventory_model import InventoryModel  # Import here to avoid circular import

        inventory_dict = {item['id']: item for item in InventoryModel.get_inventory()}

        total_amount = 0
        order_items = []

        for cart_item in cart:
            item_id = cart_item['id']
            quantity = cart_item['quantity']

            if item_id not in inventory_dict:
                return None, f'Item ID {item_id} not found.'

            stock_item = inventory_dict[item_id]

            if stock_item['quantity'] < quantity:
                return None, f'Not enough stock for {stock_item["name"]}.'

            total_amount += stock_item['price'] * quantity
            order_items.append({
                'name': stock_item['name'],
                'price': stock_item['price'],
                'quantity': quantity
            })
            stock_item['quantity'] -= quantity

        # Update inventory
        write_data('data/inventory.json', list(inventory_dict.values()))

        # Create order
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        order_filename = f'order_{timestamp}.json'
        order_data = {
            'orderId': timestamp,
            'username': username,
            'items': order_items,
            'totalAmount': total_amount,
            'date': datetime.now().isoformat()
        }
        write_data(os.path.join(ORDERS_DIR, order_filename), order_data)

        return order_data, None