from flask import Flask
from flask_cors import CORS
from models import init_data
from controllers import auth_bp, inventory_bp, order_bp, view_bp

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/static', static_url_path='/static')
CORS(app)

# ✅ INIT DATA HERE (IMPORTANT)
init_data()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(order_bp)
app.register_blueprint(view_bp)

@app.route("/")
def home():
    return "Backend running 🚀"