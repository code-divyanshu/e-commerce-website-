
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([
    { product_id: "", quantity: 1 },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [orderRes, customerRes, productRes] = await Promise.all([
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/customers`),
        fetch(`${API_BASE}/products`),
      ]);

      if (!orderRes.ok || !customerRes.ok || !productRes.ok) {
        throw new Error("Failed to load data");
      }

      setOrders(await orderRes.json());
      setCustomers(await customerRes.json());
      setProducts(await productRes.json());
      setError("");
    } catch {
      setError("Unable to load data. Check whether Flask is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateItem(index, field, value) {
    setItems((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems([...items, { product_id: "", quantity: 1 }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const estimatedTotal = items.reduce((total, item) => {
    const product = products.find(
      (p) => p.product_id === Number(item.product_id)
    );
    return total + (product ? Number(product.price) * Number(item.quantity) : 0);
  }, 0);

  async function createOrder(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.some((item) => !item.product_id || Number(item.quantity) < 1)) {
      setError("Select a product and enter a valid quantity for every item.");
      return;
    }

    const productIds = items.map((item) => Number(item.product_id));
    if (new Set(productIds).size !== productIds.length) {
      setError("Each product can appear only once in an order.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: Number(customerId),
          items: items.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create order.");
      }

      setMessage(`Order #${data.order_id} created successfully.`);
      setCustomerId("");
      setItems([{ product_id: "", quantity: 1 }]);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(orderId, status) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Status update failed.");
      }

      setMessage(`Order #${orderId} updated.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cancelOrder(orderId) {
    if (!window.confirm(
      `Cancel order #${orderId}? The ordered products will be returned to stock.`
    )) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/orders/${orderId}/cancel`,
        { method: "PUT" }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Order cancellation failed.");
      }

      setMessage(`Order #${orderId} cancelled and stock restored.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

async function deleteOrder(orderId) {
  if (!window.confirm(
    `Permanently delete cancelled order #${orderId}?`
  )) return;

  try {
    const response = await fetch(
      `${API_BASE}/orders/${orderId}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Deletion failed.");
    }

    setMessage(`Order #${orderId} deleted successfully.`);
    setError("");
    await loadData();
  } catch (err) {
    setError(err.message);
  }
}


  return (
    <div className="dashboard-content">
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Order Management</h2>
        <p style={{ color: "#8b95a7", marginTop: 6 }}>
          Create orders and track their status.
        </p>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        {message && <p style={{ color: "green", marginTop: 12 }}>{message}</p>}

        <form onSubmit={createOrder} style={{ marginTop: 24 }}>
          <h3>Create New Order</h3>

          <label style={{ display: "block", marginTop: 16 }}>
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.customer_name}
              </option>
            ))}
          </select>

          <h3 style={{ marginTop: 22 }}>Order Items</h3>

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <select
                value={item.product_id}
                onChange={(e) =>
                  updateItem(index, "product_id", e.target.value)
                }
                required
                style={{ flex: 2, minWidth: 180, padding: 10 }}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option
                    key={product.product_id}
                    value={product.product_id}
                    disabled={product.stock_quantity <= 0}
                  >
                    {product.product_name} — ₹{product.price} (Stock: {product.stock_quantity})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", e.target.value)
                }
                required
                style={{ width: 100, padding: 10 }}
                placeholder="Quantity"
              />

              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            style={{ marginTop: 14 }}
          >
            + Add Product
          </button>

          <h3 style={{ marginTop: 20 }}>
            Estimated Total: ₹
            {estimatedTotal.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </h3>

          <button
            type="submit"
            disabled={saving}
            style={{ marginTop: 16, padding: "10px 20px" }}
          >
            {saving ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <h2>All Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>#{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.products}</td>
                    <td>
                      {new Date(order.order_date).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td>
                      {order.status === "CANCELLED" ? (
                        "CANCELLED"
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.order_id, e.target.value)
                          }
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                        </select>
                      )}
                    </td>
                    <td>
                     
<td>
  {order.status === "CANCELLED" ? (
    <button
      type="button"
      onClick={() => deleteOrder(order.order_id)}
    >
      Delete
    </button>
  ) : order.status !== "DELIVERED" ? (
    <button
      type="button"
      onClick={() => cancelOrder(order.order_id)}
    >
      Cancel
    </button>
  ) : (
    "—"
  )}
</td>

                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
