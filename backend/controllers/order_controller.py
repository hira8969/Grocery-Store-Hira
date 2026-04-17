from flask import Blueprint, request, jsonify
from models import OrderModel

order_bp = Blueprint('order', __name__)

@order_bp.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    cart = data.get('cart', [])
    username = data.get('username', 'Guest')

    order, error = OrderModel.create_order(username, cart)
    if order:
        return jsonify({'success': True, 'order': order})
    return jsonify({'success': False, 'message': error}), 400

@order_bp.route('/api/orders', methods=['GET'])
def get_orders():
    orders = OrderModel.get_all_orders()
    return jsonify(orders)

@order_bp.route('/api/customer/orders', methods=['POST'])
def get_customer_orders():
    data = request.json
    username = data.get('username')
    if not username:
        return jsonify({'success': False, 'message': 'Username required'}), 400
    orders = OrderModel.get_orders_by_username(username)
    return jsonify({'success': True, 'orders': orders})