import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddProduct from "./pages/AddProduct";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import ProductHistory from "./pages/ProductHistory";
import Users from "./pages/Users";
import ActivityLogs from "./pages/ActivityLogs";
import Login from "./pages/Login";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/add-product" element={<AddProduct />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route
                        path="/product-history"
                        element={<ProductHistory />}
                      />
                      <Route path="/users" element={<Users />} />
                      <Route path="/activity-logs" element={<ActivityLogs />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>

        <Toaster
          position="center-top"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
