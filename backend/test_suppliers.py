
import requests

BASE_URL = "http://localhost:5000/api/suppliers"

supplier = {
    "supplier_name": "Test Supplier",
    "phone": "9876543210",
    "email": "test@example.com",
    "address": "Patna, Bihar"
}

# ADD
response = requests.post(BASE_URL, json=supplier)
print("ADD:", response.status_code, response.json())

supplier_id = response.json()["supplier_id"]

# UPDATE
supplier["supplier_name"] = "Updated Test Supplier"

response = requests.put(
    f"{BASE_URL}/{supplier_id}",
    json=supplier
)
print("UPDATE:", response.status_code, response.json())

# DELETE
response = requests.delete(f"{BASE_URL}/{supplier_id}")
print("DELETE:", response.status_code, response.json())
