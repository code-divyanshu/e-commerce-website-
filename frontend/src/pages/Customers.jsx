
import { useEffect, useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const emptyForm = {
  customer_name: "",
  email: "",
  phone: "",
  address: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/customers`);

      if (!response.ok) throw new Error();

      setCustomers(await response.json());
      setError("");
    } catch {
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
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

  function handleEdit(customer) {
    setForm({
      customer_name: customer.customer_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setEditingId(customer.customer_id);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingId
          ? `${API_BASE}/customers/${editingId}`
          : `${API_BASE}/customers`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            customer_name: form.customer_name.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed.");
      }

      setMessage(
        editingId
          ? "Customer updated successfully!"
          : "Customer added successfully!"
      );

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);

      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(customerId) {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/customers/${customerId}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setMessage("Customer deleted successfully!");
      await loadCustomers();
    } catch {
      setError(
        "Cannot delete this customer. They may have existing orders."
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
            <h2>Customer Management</h2>
            <p style={{ color: "#8b95a7", marginTop: 6 }}>
              Manage customer information and contact details.
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
            + Add Customer
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
              name="customer_name"
              placeholder="Customer name"
              value={form.customer_name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
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
              {editingId ? "Update Customer" : "Save Customer"}
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
          <p>Loading customers...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>#{customer.customer_id}</td>
                    <td>{customer.customer_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.address}</td>
                    <td>
                      <button onClick={() => handleEdit(customer)}>
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(customer.customer_id)}
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
