
import requests

BASE_URL = "http://localhost:5000/api/customers"

customer = {
    "customer_name": "Test Customer",
    "email": "testcustomer@example.com",
    "phone": "9876543210",
    "address": "Patna, Bihar"
}

# ADD CUSTOMER
response = requests.post(BASE_URL, json=customer)
print("ADD:", response.status_code, response.json())

customer_id = response.json()["customer_id"]

# UPDATE CUSTOMER
customer["customer_name"] = "Updated Test Customer"

response = requests.put(
    f"{BASE_URL}/{customer_id}",
    json=customer
)
print("UPDATE:", response.status_code, response.json())

# DELETE CUSTOMER
response = requests.delete(f"{BASE_URL}/{customer_id}")
print("DELETE:", response.status_code, response.json())
