import json
import random
import os

print("Starting data generation...")

# --- Configuration ---
NUM_PRODUCTS = 500
DATA_FILE = os.path.join('data', 'inventory.json')

# --- Sample Data Pool ---
CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Pantry', 'Beverages', 'Snacks', 'Frozen', 'Household']

PREFIXES = ['Fresh', 'Organic', 'Premium', 'Farmhouse', 'Whole', 'Artisan', 'Gourmet', 'Spicy', 'Sweet', 'Pure', 'Sunrise', 'Classic']

PRODUCTS = {
    'Fruits': ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Mangoes', 'Pomegranates'],
    'Vegetables': ['Carrots', 'Broccoli', 'Tomatoes', 'Potatoes', 'Onions', 'Spinach', 'Cucumbers'],
    'Dairy': ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Paneer', 'Ghee'],
    'Bakery': ['Bread', 'Buns', 'Croissants', 'Muffins', 'Cookies'],
    'Meat': ['Chicken', 'Mutton', 'Fish', 'Prawns', 'Sausages'],
    'Pantry': ['Rice', 'Lentils (Dal)', 'Flour (Atta)', 'Sugar', 'Salt', 'Spices', 'Olive Oil', 'Pasta'],
    'Beverages': ['Juice', 'Tea', 'Coffee', 'Soda', 'Lassi', 'Energy Drink'],
    'Snacks': ['Chips', 'Biscuits', 'Nuts', 'Namkeen', 'Chocolates'],
    'Frozen': ['Peas', 'Corn', 'Ice Cream', 'Ready-to-Eat Meals', 'Fries'],
    'Household': ['Soap', 'Detergent', 'Cleaner', 'Tissues', 'Shampoo']
}

# --- Image Mapping ---
# This re-uses the images you already have, based on category.
# We add a placeholder for categories without a specific image.
IMAGE_MAP = {
    'Fruits': '/images/apple.jpg',
    'Vegetables': '/images/apple.jpg', # You can add a 'vegetable.jpg' later
    'Dairy': '/images/milk.jpg',
    'Bakery': '/images/bread.jpg',
    'Meat': '/images/chicken.jpg',
    'Pantry': '/images/rice.jpg',
    'default': '/images/placeholder.png' # A generic image
}

# --- Generation Logic ---
inventory = []
current_id = 1

for _ in range(NUM_PRODUCTS):
    # 1. Pick a category
    category = random.choice(CATEGORIES)
    
    # 2. Create a name
    prefix = random.choice(PREFIXES)
    product_base = random.choice(PRODUCTS[category])
    name = f"{prefix} {product_base}"
    
    # 3. Create price and quantity
    # Using Rupee-appropriate random prices
    price = round(random.uniform(20.0, 450.0), 2)
    quantity = random.randint(10, 200)
    
    # 4. Get the image
    image_url = IMAGE_MAP.get(category, IMAGE_MAP['default'])

    # 5. Assemble the product
    product = {
        "id": current_id,
        "name": name,
        "price": price,
        "quantity": quantity,
        "category": category,
        "image_url": image_url
    }
    
    inventory.append(product)
    current_id += 1

# --- Write to File ---
try:
    with open(DATA_FILE, 'w') as f:
        json.dump(inventory, f, indent=4)
    print(f"Successfully generated and saved {NUM_PRODUCTS} products to {DATA_FILE}")
except Exception as e:
    print(f"Error: Could not write to file. {e}")