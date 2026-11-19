
import { useEffect, useState } from "react";
import {
  fetchProducts,
  fetchCategories,
  fetchSuppliers,
} from "../api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const emptyForm = {
  product_name: "",
  category_id: "",
  supplier_id: "",
  price: "",
  stock_quantity: "",
  description: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [productData, categoryData, supplierData] =
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchSuppliers(),
        ]);

      setProducts(productData);
      setCategories(categoryData);
      setSuppliers(supplierData);
      setError("");
    } catch (err) {
      setError("Unable to load data. Check the backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          supplier_id: Number(form.supplier_id),
          price: Number(form.price),
          stock_quantity: Number(form.stock_quantity),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add product");
      }

      setMessage("Product added successfully!");
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }
  async function handleEdit(product) {
  const updatedName = prompt("Product name:", product.product_name);
  if (updatedName === null) return;

  const updatedPrice = prompt("Price:", product.price);
  if (updatedPrice === null) return;

  const updatedStock = prompt("Stock quantity:", product.stock_quantity);
  if (updatedStock === null) return;

  if (
    !updatedName.trim() ||
    updatedPrice.trim() === "" ||
    updatedStock.trim() === "" ||
    Number(updatedPrice) < 0 ||
    !Number.isFinite(Number(updatedPrice)) ||
    !Number.isInteger(Number(updatedStock)) ||
    Number(updatedStock) < 0
  ) {
    setError("Enter a valid name, price and stock quantity.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/products/${product.product_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: updatedName.trim(),
          category_id: product.category_id,
          supplier_id: product.supplier_id,
          price: Number(updatedPrice),
          stock_quantity: Number(updatedStock),
          description: product.description || "",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    setMessage("Product updated successfully!");
    setError("");
    await loadData();
  } catch (err) {
    setError(err.message || "Failed to update product.");
  }
}

async function handleDelete(productId) {
  if (!window.confirm("Are you sure you want to delete this product?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    setMessage("Product deleted successfully!");
    setError("");
    await loadData();
  } catch (err) {
    setError(
      "Could not delete product. It may already be used in an order."
    );
  }
}

  return (
    <div className="dashboard-content">
      <div className="panel" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2>Product Inventory</h2>
            <p style={{ color: "#8b95a7", marginTop: 6 }}>
              Manage your store's products and stock.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            {showForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>

        {message && (
          <p style={{ color: "green", marginBottom: 12 }}>{message}</p>
        )}

        {error && (
          <p style={{ color: "red", marginBottom: 12 }}>{error}</p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
              padding: 20,
              marginBottom: 24,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <input
              name="product_name"
              placeholder="Product name"
              value={form.product_name}
              onChange={handleChange}
              required
            />

            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option
                  key={category.category_id}
                  value={category.category_id}
                >
                  {category.category_name}
                </option>
              ))}
            </select>

            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option
                  key={supplier.supplier_id}
                  value={supplier.supplier_id}
                >
                  {supplier.supplier_name}
                </option>
              ))}
            </select>

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />

            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              placeholder="Stock quantity"
              value={form.stock_quantity}
              onChange={handleChange}
              required
            />

            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <button
              type="submit"
              style={{
                gridColumn: "1 / -1",
                padding: 12,
                border: "none",
                borderRadius: 8,
                background: "#16a34a",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save Product
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id}>
                    <td>#{product.product_id}</td>
                    <td>{product.product_name}</td>
                    <td>{product.category_name}</td>
                    <td>{product.supplier_name}</td>
                    <td>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>
                    <td>{product.stock_quantity}</td>
                    <td>
  <button onClick={() => handleEdit(product)}>Edit</button>
  <button onClick={() => handleDelete(product.product_id)}>Delete</button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
