import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Plus,
  LogOut,
  ChevronLeft,
  Trash2,
  Users as UsersIcon,
  History,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const menuItems = [
    {
      group: "Main",
      items: [{ name: "Dashboard", path: "/", icon: LayoutDashboard }],
    },
    {
      group: "Warehouse",
      items: [
        { name: "Inventory", path: "/inventory", icon: Package },
        { name: "Add Product", path: "/add-product", icon: Plus },
      ],
    },
    {
      group: "History",
      items: [
        { name: "Transactions", path: "/transactions", icon: ArrowRightLeft },
        { name: "Product History", path: "/product-history", icon: Trash2 },
      ],
    },
    {
      group: "Reports",
      items: [
        { name: "Analytics", path: "/reports", icon: BarChart3 },
      ],
    },
    {
      group: "Administration",
      items: [
        { name: "Users", path: "/users", icon: UsersIcon },
        { name: "Activity Logs", path: "/activity-logs", icon: History },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-blue-600 text-white rounded-xl shadow-xl hover:bg-blue-700 transition-all active:scale-95"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-all duration-500 z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[88px]" : "w-72"}`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 mb-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Package className="text-white" size={24} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  WarehouseHub
                </span>
                <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest -mt-1">
                  Pro Suite
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-8 scrollbar-hide">
          {menuItems.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        active
                          ? "bg-blue-600/10 text-blue-400"
                          : "hover:bg-slate-800/50 hover:text-white"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      {active && (
                        <div className="absolute left-[-16px] w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                      <Icon
                        size={active ? 22 : 20}
                        className={`${active ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`}
                      />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.name}</span>
                      )}

                      {/* Tooltip for Collapsed Mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase">
                  Admin Mode
                </span>
                <span className="text-[10px] text-slate-500">
                  v2.4.0-stable
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full py-2.5 rounded-lg transition-all duration-200 group ${
              isCollapsed ? "justify-center" : "px-3"
            } text-slate-400 hover:bg-red-500/10 hover:text-red-400`}
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="font-semibold text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm lg:hidden z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
