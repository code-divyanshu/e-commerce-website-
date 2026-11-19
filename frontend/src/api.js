const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export async function fetchDashboard() {
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE}/orders`);
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}
export async function fetchCategories() {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

export async function fetchSuppliers() {
  const response = await fetch(`${API_BASE}/suppliers`);
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return response.json();
}