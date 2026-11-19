
import requests

BASE_URL = "http://localhost:5000/api"

# Check stock before placing order
products = requests.get(f"{BASE_URL}/products").json()
product = next(p for p in products if p["product_id"] == 1)

old_stock = product["stock_quantity"]

order = {
    "customer_id": 1,
    "items": [
        {"product_id": 1, "quantity": 2},
        {"product_id": 6, "quantity": 1}
    ]
}

response = requests.post(
    f"{BASE_URL}/orders",
    json=order
)

print("STATUS:", response.status_code)
print("RESPONSE:", response.json())

# Verify stock reduction
products = requests.get(f"{BASE_URL}/products").json()
updated_product = next(p for p in products if p["product_id"] == 1)

print("OLD STOCK:", old_stock)
print("NEW STOCK:", updated_product["stock_quantity"])
