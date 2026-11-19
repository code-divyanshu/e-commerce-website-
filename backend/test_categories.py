import requests

url = "http://localhost:5000/api/categories"

data = {
    "category_name": "Temporary Test",
    "description": "Testing category API"
}

response = requests.post(url, json=data)

print("STATUS:", response.status_code)
print("CONTENT TYPE:", response.headers.get("Content-Type"))
print("RESPONSE:", response.text)