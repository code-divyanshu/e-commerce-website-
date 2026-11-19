
import requests

BASE_URL = "http://localhost:5000/api/products"

# 1. ADD PRODUCT
product = {
    "product_name": "Test Product",
    "category_id": 1,
    "supplier_id": 1,
    "price": 999.00,
    "stock_quantity": 25,
    "description": "Temporary product for API testing"
}

response = requests.post(BASE_URL, json=product)
print("ADD:", response.status_code, response.json())

product_id = response.json()["product_id"]

# 2. UPDATE PRODUCT
product["product_name"] = "Updated Test Product"
product["price"] = 1199.00

response = requests.put(
    f"{BASE_URL}/{product_id}",
    json=product
)
print("UPDATE:", response.status_code, response.json())

# 3. DELETE PRODUCT
response = requests.delete(f"{BASE_URL}/{product_id}")
print("DELETE:", response.status_code, response.json())
