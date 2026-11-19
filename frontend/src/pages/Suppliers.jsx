
import { useEffect, useState } from "react";


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const emptyForm = {
  supplier_name: "",
  phone: "",
  email: "",
  address: "",
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSuppliers() {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/suppliers`);

      if (!response.ok) throw new Error("Failed to load suppliers");

      setSuppliers(await response.json());
      setError("");
    } catch {
      setError("Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function handleEdit(supplier) {
    setForm({
      supplier_name: supplier.supplier_name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setEditingId(supplier.supplier_id);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const url = editingId
      ? `${API_BASE}/suppliers/${editingId}`
      : `${API_BASE}/suppliers`;

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          supplier_name: form.supplier_name.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed.");
      }

      setMessage(
        editingId
          ? "Supplier updated successfully!"
          : "Supplier added successfully!"
      );

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);

      await loadSuppliers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(supplierId) {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/suppliers/${supplierId}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed.");
      }

      setMessage("Supplier deleted successfully!");
      await loadSuppliers();
    } catch {
      setError(
        "Cannot delete this supplier. It may be linked to existing products."
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
            <h2>Supplier Management</h2>
            <p style={{ color: "#8b95a7", marginTop: 6 }}>
              Manage your suppliers and their contact details.
            </p>
          </div>

          <button
            onClick={openAddForm}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            + Add Supplier
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
              name="supplier_name"
              placeholder="Supplier name"
              value={form.supplier_name}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
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
              {editingId ? "Update Supplier" : "Save Supplier"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              style={{
                padding: 12,
                border: "1px solid #ccc",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading suppliers...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td>#{supplier.supplier_id}</td>
                    <td>{supplier.supplier_name}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.address}</td>
                    <td>
                      <button onClick={() => handleEdit(supplier)}>
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(supplier.supplier_id)}
                      >
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
