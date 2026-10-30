import { useState, useEffect } from "react";
// Humne "Users" icon ko "UsersIcon" rename kar diya taake component name se clash na ho
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  ShieldCheck,
  Mail,
  Building2,
  X,
  KeyRound,
} from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deactivateUser,
} from "../api/userAPI";
import toast from "react-hot-toast";
import { changePassword } from "../api/authAPI";

export default function UserManagement() {
  // Component name changed for clarity
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "staff",
    department: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updates = { ...formData };
        if (!updates.password) delete updates.password;
        await updateUser(editingId, updates);
        toast.success("User profile updated");
      } else {
        await createUser(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.role,
          formData.department,
        );
        toast.success("New user created successfully");
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      try {
        await deactivateUser(id);
        toast.success("User access revoked");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to deactivate user");
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: "",
      role: user.role,
      department: user.department || "",
    });
    setEditingId(user.id || user._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "staff",
      department: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Your password was changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="lg:ml-64 min-h-screen bg-[#f8fafc] pb-10">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <UsersIcon size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Team Members
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Manage permissions and access levels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none w-64 transition-all"
              />
            </div>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                showForm
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {showForm ? <X size={20} /> : <Plus size={20} />}
              {showForm ? "Close" : "Add Member"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="mb-10 bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-300/30 text-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-300">
              <KeyRound size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">Account Security</h2>
              <p className="text-sm text-slate-300 mt-1">
                Use at least 12 characters with uppercase, lowercase, a number,
                and a special character.
              </p>
            </div>
          </div>
          <form
            onSubmit={handlePasswordChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="password"
              required
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400"
            />
            <input
              type="password"
              required
              minLength={12}
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400"
            />
            <div className="flex gap-3">
              <input
                type="password"
                required
                minLength={12}
                placeholder="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="min-w-0 flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={changingPassword}
                className="px-5 py-3 bg-blue-500 rounded-xl font-bold hover:bg-blue-400 disabled:opacity-50"
              >
                {changingPassword ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-10 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-black mb-6 text-slate-800">
              {editingId ? "Update Member Profile" : "Register New Member"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <FormField label="Email Address" icon={<Mail size={16} />}>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </FormField>

              <FormField label="First Name">
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </FormField>

              <FormField label="Last Name">
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </FormField>

              <FormField label="Assign Role" icon={<ShieldCheck size={16} />}>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="staff">Staff Member</option>
                  <option value="manager">Operations Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </FormField>

              <FormField label="Department" icon={<Building2 size={16} />}>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="e.g. Logistics"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </FormField>

              <FormField
                label={editingId ? "Security Key (Optional)" : "Security Key"}
              >
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </FormField>

              <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  {editingId ? "Save Changes" : "Confirm User Creation"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                Fetching Personnel...
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Full Name
                  </th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Contact Info
                  </th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Security Role
                  </th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Department
                  </th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id || user._id}
                    className="group hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <span className="font-bold text-slate-700">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                      {user.email}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm ${
                          user.role === "admin"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : user.role === "manager"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {user.department || "—"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id || user._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Field Wrapper
function FormField({ label, children, icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
