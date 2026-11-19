import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  Users,
  ShoppingCart,
  ChartNoAxesCombined,
  Settings,
  Warehouse,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Products", icon: Package },
  { name: "Categories", icon: Layers },
  { name: "Suppliers", icon: Truck },
  { name: "Customers", icon: Users },
  { name: "Orders", icon: ShoppingCart },
  { name: "Analytics", icon: ChartNoAxesCombined },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Warehouse size={22} />
        </div>
        <div>
          <h2>StockFlow</h2>
          <span>Inventory Management</span>
        </div>
      </div>

      <div className="sidebar-label">MAIN MENU</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.name;

          return (
            <button
              key={item.name}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.name)}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="nav-item"
          onClick={() => onNavigate("Settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-profile">
          <div className="profile-avatar">AD</div>
          <div className="profile-info">
            <strong>Admin User</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}