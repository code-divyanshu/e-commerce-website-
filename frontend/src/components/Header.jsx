import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header({ title = "Dashboard" }) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1>{title}</h1>
          <p>Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search anything..." />
          <span className="search-shortcut">⌘ K</span>
        </div>

        <button className="notification-btn">
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <button className="header-user">
          <div className="profile-avatar">AD</div>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}