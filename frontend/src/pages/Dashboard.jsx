import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { fetchDashboard, fetchOrders } from "../api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardData, orderData] = await Promise.all([
          fetchDashboard(),
          fetchOrders(),
        ]);

        setDashboard(dashboardData);
        setOrders(orderData);
      } catch (err) {
        setError("Could not load dashboard data. Is the Flask server running?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div className="dashboard-content">Loading dashboard...</div>;
  if (error) return <div className="dashboard-content">{error}</div>;

  const stats = [
    {
      title: "Total Products",
      value: dashboard.products.total_products,
      icon: Package,
      color: "blue",
    },
    {
      title: "Total Orders",
      value: dashboard.orders.total_orders,
      icon: ShoppingCart,
      color: "purple",
    },
    {
      title: "Total Customers",
      value: dashboard.customers.total_customers,
      icon: Users,
      color: "green",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(dashboard.revenue.total_revenue).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "orange",
    },
  ];

  const inventory = dashboard.inventory;

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="dashboard-content">
      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <div className="panel recent-orders">
          <div className="panel-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest transactions from your store</p>
            </div>
            <button className="view-all-btn">View all →</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>PRODUCT</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.order_id}>
                    <td className="order-id">#{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.products}</td>
                    <td className="date-cell">{formatDate(order.order_date)}</td>
                    <td className="amount-cell">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel inventory-panel">
          <div className="panel-header">
            <div>
              <h2>Inventory Overview</h2>
              <p>Stock status summary</p>
            </div>
          </div>

          <div className="inventory-item">
            <div className="inventory-label">
              <span className="inventory-dot in-stock"></span>
              <span>In Stock</span>
            </div>
            <strong>{inventory.in_stock ?? 0}</strong>
          </div>

          <div className="inventory-item">
            <div className="inventory-label">
              <span className="inventory-dot low-stock"></span>
              <span>Low Stock</span>
            </div>
            <strong>{inventory.low_stock ?? 0}</strong>
          </div>

          <div className="inventory-item">
            <div className="inventory-label">
              <span className="inventory-dot out-stock"></span>
              <span>Out of Stock</span>
            </div>
            <strong>{inventory.out_of_stock ?? 0}</strong>
          </div>

          <div className="inventory-total">
            <div className="inventory-total-label">Total Inventory Products</div>
            <div className="inventory-total-value">
              {inventory.total_products}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}