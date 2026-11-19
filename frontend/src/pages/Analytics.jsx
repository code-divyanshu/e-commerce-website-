
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch(`${API_BASE}/analytics`);
        if (!response.ok) throw new Error("Failed to fetch analytics");
        setData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) return <div className="dashboard-content">Loading analytics...</div>;
  if (error) return <div className="dashboard-content" style={{ color: "red" }}>{error}</div>;
  if (!data) return null;

  const summary = data.summary;

  return (
    <div className="dashboard-content">
      <h2>Sales Analytics</h2>
      <p style={{ color: "#8b95a7", marginTop: 6 }}>
        Business performance and inventory insights.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 18,
        marginTop: 24
      }}>
        {[
          ["Total Orders", summary.total_orders],
          ["Total Revenue", `₹${Number(summary.total_revenue).toLocaleString("en-IN")}`],
          ["Cancelled Orders", summary.cancelled_orders],
          ["Low Stock Products", data.low_stock.length]
        ].map(([label, value]) => (
          <div className="panel" key={label} style={{ padding: 22 }}>
            <p style={{ color: "#8b95a7" }}>{label}</p>
            <h2 style={{ marginTop: 12 }}>{value}</h2>
          </div>
        ))}
      </div>

      <div className="panel" style={{ padding: 24, marginTop: 24 }}>
        <h3>Monthly Top-Selling Products</h3>
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((p) => (
                <tr key={p.product_id}>
                  <td>{p.product_name}</td>
                  <td>{p.units_sold}</td>
                  <td>₹{Number(p.total_revenue).toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {data.top_products.length === 0 && (
                <tr><td colSpan="3">No sales this month.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ padding: 24, marginTop: 24 }}>
        <h3>Monthly Sales History</h3>
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly_sales.map((m) => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td>{m.total_orders}</td>
                  <td>₹{Number(m.revenue).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ padding: 24, marginTop: 24 }}>
        <h3>Low Stock Alert</h3>
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product</th>
                <th>Available Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock.map((p) => (
                <tr key={p.product_id}>
                  <td>{p.product_id}</td>
                  <td>{p.product_name}</td>
                  <td>{p.stock_quantity}</td>
                </tr>
              ))}
              {data.low_stock.length === 0 && (
                <tr><td colSpan="3">No low-stock products.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
