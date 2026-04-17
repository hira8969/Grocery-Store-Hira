from .data_manager import read_data, write_data, INVENTORY_FILE

class InventoryModel:
    @staticmethod
    def get_inventory():
        return read_data(INVENTORY_FILE)

    @staticmethod
    def add_item(name, price, quantity, category):
        inventory = read_data(INVENTORY_FILE)
        new_id = max([item.get('id', 0) for item in inventory] + [0]) + 1
        new_item = {
            "id": new_id,
            "name": name,
            "price": float(price),
            "quantity": int(quantity),
            "category": category
        }
        inventory.append(new_item)
        write_data(INVENTORY_FILE, inventory)
        return new_item

    @staticmethod
    def update_item(item_id, name, price, quantity, category):
        inventory = read_data(INVENTORY_FILE)
        for i, item in enumerate(inventory):
            if item['id'] == int(item_id):
                inventory[i] = {
                    "id": int(item_id),
                    "name": name,
                    "price": float(price),
                    "quantity": int(quantity),
                    "category": category
                }
                write_data(INVENTORY_FILE, inventory)
                return inventory[i]
        return None

    @staticmethod
    def delete_item(item_id):
        inventory = read_data(INVENTORY_FILE)
        original_len = len(inventory)
        inventory = [item for item in inventory if item['id'] != int(item_id)]
        if len(inventory) < original_len:
            write_data(INVENTORY_FILE, inventory)
            return True
        return False

    @staticmethod
    def get_item_by_id(item_id):
        inventory = read_data(INVENTORY_FILE)
        for item in inventory:
            if item['id'] == item_id:
                return item
        return None

    @staticmethod
    def update_stock(item_id, quantity_change):
        inventory = read_data(INVENTORY_FILE)
        for item in inventory:
            if item['id'] == item_id:
                item['quantity'] += quantity_change
                write_data(INVENTORY_FILE, inventory)
                return item
        return None