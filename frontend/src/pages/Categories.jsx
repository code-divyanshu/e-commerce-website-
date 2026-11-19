
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/categories`);

      if (!response.ok) throw new Error();

      setCategories(await response.json());
      setError("");
    } catch {
      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_name: categoryName.trim(),
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add category.");
      }

      setMessage("Category added successfully!");
      setCategoryName("");
      setDescription("");
      setShowForm(false);

      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

async function handleEdit(category) {
  const updatedName = prompt(
    "Category name:",
    category.category_name
  );

  if (updatedName === null) return;

  const updatedDescription = prompt(
    "Description:",
    category.description || ""
  );

  if (updatedDescription === null) return;

  if (!updatedName.trim()) {
    setError("Category name cannot be empty.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/categories/${category.category_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_name: updatedName.trim(),
          description: updatedDescription.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Update failed.");
    }

    setMessage("Category updated successfully!");
    setError("");
    await loadCategories();
  } catch (err) {
    setError(err.message);
  }
}

async function handleDelete(categoryId) {
  if (!window.confirm("Are you sure you want to delete this category?")) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/categories/${categoryId}`,
      { method: "DELETE" }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Delete failed.");
    }

    setMessage("Category deleted successfully!");
    setError("");
    await loadCategories();
  } catch (err) {
    setError(
      "Cannot delete this category. It may be linked to existing products."
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
            <h2>Category Management</h2>
            <p style={{ color: "#8b95a7", marginTop: 6 }}>
              Organize your product categories.
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
            {showForm ? "Close Form" : "+ Add Category"}
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
              gap: 14,
              padding: 20,
              marginBottom: 24,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <input
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />

            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              type="submit"
              style={{
                padding: 12,
                border: "none",
                borderRadius: 8,
                background: "#16a34a",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save Category
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.category_id}>
                    <td>#{category.category_id}</td>
                    <td>{category.category_name}</td>
                    <td>{category.description}</td>
                    <td>
  <button onClick={() => handleEdit(category)}>Edit</button>
  <button onClick={() => handleDelete(category.category_id)}>
    Delete
  </button>
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
