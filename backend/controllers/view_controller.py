from flask import Blueprint, render_template

view_bp = Blueprint('view', __name__)

@view_bp.route('/')
def index():
    """Serves the main customer-facing page."""
    return render_template('index.html')

@view_bp.route('/admin')
def admin():
    """Serves the admin login/dashboard page."""
    return render_template('admin.html')

@view_bp.route('/invoice')
def invoice():
    """Serves the printable invoice page."""
    return render_template('invoice.html')

@view_bp.route('/login')
def login_page():
    """Serves the new customer login/signup page."""
    return render_template('login.html')

@view_bp.route('/my-orders')
def my_orders_page():
    """Serves the new customer 'My Orders' page."""
    return render_template('orders.html')