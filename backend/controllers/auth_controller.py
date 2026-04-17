from flask import Blueprint, request, jsonify
from models import UserModel, CustomerModel

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def admin_login():
    """Handles admin login."""
    data = request.json
    user = UserModel.authenticate(data['username'], data['password'])
    if user:
        return jsonify({'success': True, 'message': 'Admin login successful'})
    return jsonify({'success': False, 'message': 'Invalid admin credentials'}), 401

@auth_bp.route('/api/customer/signup', methods=['POST'])
def customer_signup():
    data = request.json
    customer = CustomerModel.add_customer(data['username'], data['password'], data['name'])
    if customer:
        return jsonify({'success': True, 'message': 'Signup successful', 'user': customer}), 201
    return jsonify({'success': False, 'message': 'Username already exists'}), 400

@auth_bp.route('/api/customer/login', methods=['POST'])
def customer_login():
    data = request.json
    customer = CustomerModel.authenticate(data['username'], data['password'])
    if customer:
        return jsonify({'success': True, 'message': 'Login successful', 'user': customer})
    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401