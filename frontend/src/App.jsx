
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-area">
        <Header title={activePage} />

        {activePage === "Dashboard" ? (
          <Dashboard />
        ) : activePage === "Products" ? (
          <Products />
        ) : activePage === "Categories" ? (
          <Categories />
        ) : activePage === "Suppliers" ? (
          <Suppliers />
        ) : activePage === "Customers" ? (
          <Customers />
        ) : activePage === "Orders" ? (
          <Orders />
        )  : activePage === "Analytics" ? (
  <Analytics />): (
          <div className="dashboard-content">
            <div className="panel" style={{ padding: 30 }}>
              <h2>{activePage}</h2>
              <p style={{ marginTop: 10, color: "#8b95a7" }}>
                This page is under development.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
