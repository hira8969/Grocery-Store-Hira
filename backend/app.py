from flask import Flask
from models import init_data
from controllers import auth_bp, inventory_bp, order_bp, view_bp

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(order_bp)
app.register_blueprint(view_bp)

if __name__ == '__main__':
    init_data()
    app.run(debug=True, port=5000)