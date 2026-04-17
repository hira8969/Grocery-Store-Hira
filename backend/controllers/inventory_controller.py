from flask import Blueprint, request, jsonify
from models import InventoryModel

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    inventory = InventoryModel.get_inventory()
    return jsonify(inventory)

@inventory_bp.route('/api/inventory/add', methods=['POST'])
def add_item():
    data = request.json
    item = InventoryModel.add_item(data['name'], data['price'], data['quantity'], data['category'])
    return jsonify({'success': True, 'item': item}), 201

@inventory_bp.route('/api/inventory/update', methods=['POST'])
def update_item():
    data = request.json
    item = InventoryModel.update_item(data['id'], data['name'], data['price'], data['quantity'], data['category'])
    if item:
        return jsonify({'success': True, 'item': item})
    return jsonify({'success': False, 'message': 'Item not found'}), 404

@inventory_bp.route('/api/inventory/delete', methods=['POST'])
def delete_item():
    data = request.json
    success = InventoryModel.delete_item(data['id'])
    if success:
        return jsonify({'success': True, 'message': 'Item deleted'})
    return jsonify({'success': False, 'message': 'Item not found'}), 404