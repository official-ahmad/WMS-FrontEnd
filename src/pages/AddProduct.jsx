import { useState, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  AlertCircle,
  PackagePlus,
  Info,
  DollarSign,
  Boxes,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  addProduct,
  confirmProductsImport,
  previewProductsImport,
} from "../api";
import toast from "react-hot-toast";
import { PhotoButton } from "../components/WarehouseControls";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const formRef = useRef({
    name: "",
    description: "",
    SKU: "",
    category: "",
    quantity: "",
    price: "",
    lowStockThreshold: "10",
    costPrice: "",
    reorderQuantity: "0",
    expiryDate: "",
    brand: "",
    barcode: "",
    supplier: "",
    unit: "pcs",
    location: "",
    bin: "",
    batchNumber: "",
    weight: "",
    dimensions: "",
  });

  const categories = [
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Furniture",
    "Books",
    "Hardware",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    formRef.current[name] = value;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = formRef.current;

    if (
      !data.name ||
      !data.SKU ||
      !data.category ||
      data.quantity === "" ||
      data.price === ""
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);
      await addProduct({
        ...data,
        quantity: parseInt(data.quantity),
        price: parseFloat(data.price),
        costPrice: data.costPrice === "" ? 0 : parseFloat(data.costPrice),
        lowStockThreshold: parseInt(data.lowStockThreshold),
        reorderQuantity: data.reorderQuantity === "" ? 0 : parseInt(data.reorderQuantity),
        weight: data.weight === "" ? null : parseFloat(data.weight),
      });

      toast.success("Product successfully added to catalog!");
      setTimeout(() => navigate("/inventory"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const supported = /\.(xlsx|xls|csv|pdf|docx)$/i.test(file.name);
    if (!supported) {
      toast.error("Only PDF, DOCX, XLSX, XLS, or CSV files are supported");
      return;
    }

    try {
      setImporting(true);
      const response = await previewProductsImport(file);
      setImportPreview(response.data);
      if (response.data.canImport) {
        toast.success(`${response.data.count} products ready for review`);
      } else {
        toast.error("Preview has validation errors. Fix the file before importing.");
      }
    } catch (error) {
      const details = error.response?.data?.details;
      toast.error(
        details?.length
          ? `${error.response?.data?.error}: ${details.slice(0, 3).join(" | ")}${details.length > 3 ? ` (+${details.length - 3} more)` : ""}`
          : error.response?.data?.error || "Product import failed",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview?.canImport) return;
    try {
      setImporting(true);
      const response = await confirmProductsImport(
        importPreview.rows,
        importPreview.fileName,
      );
      toast.success(response.data.message);
      setImportPreview(null);
      setTimeout(() => navigate("/inventory"), 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.details?.join(" | ") ||
          error.response?.data?.error ||
          "Import confirmation failed",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="lg:ml-64 min-h-screen bg-[#f8fafc]">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-6 md:px-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/inventory")}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus className="text-blue-600" size={24} /> New Product
              </h1>
              <p className="text-slate-500 text-sm hidden md:block">
                Catalog your warehouse items with precision
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 bg-blue-950 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Upload size={20} className="text-blue-300" /> Bulk Product Import
                </h2>
                <p className="text-blue-200 text-sm mt-1">
                  Upload XLSX/CSV with headers, or PDF/DOCX using `Field: Value`
                  product blocks.
                </p>
                <p className="text-blue-300 text-xs mt-2">
                  Required: Product Name, SKU/Product ID, Category, Quantity,
                  Selling Price
                </p>
              </div>
              <label className="shrink-0 cursor-pointer px-5 py-3 bg-blue-500 hover:bg-blue-400 rounded-xl font-bold text-center transition-colors">
                {importing ? "Preparing..." : "Choose File"}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf,.docx"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importPreview && (
            <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-lg text-slate-900">
                    Import Preview
                  </h2>
                  <p className="text-sm text-slate-500">
                    {importPreview.fileName} · {importPreview.count} rows
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={!importPreview.canImport || importing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50"
                  >
                    Confirm Import
                  </button>
                </div>
              </div>
              {importPreview.errors?.length > 0 && (
                <div className="m-4 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm">
                  {importPreview.errors.slice(0, 5).map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      {["Name", "SKU", "Category", "Quantity", "Price"].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-xs uppercase text-slate-500"
                          >
                            {header}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.rows?.slice(0, 100).map((row, index) => (
                      <tr key={`${row.SKU || "row"}-${index}`}>
                        <td className="px-4 py-3">{row.name || "—"}</td>
                        <td className="px-4 py-3 font-mono">{row.SKU || "—"}</td>
                        <td className="px-4 py-3">{row.category || "—"}</td>
                        <td className="px-4 py-3">{row.quantity ?? "—"}</td>
                        <td className="px-4 py-3">{row.price ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" /> Basic Information
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      onChange={handleChange}
                      placeholder="Enter a descriptive name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <PhotoButton onChange={handlePhotoChange} />
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Product preview"
                        className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      ["brand", "Brand / Manufacturer"],
                      ["barcode", "Barcode / GTIN"],
                      ["supplier", "Supplier"],
                      ["location", "Warehouse Zone"],
                      ["bin", "Rack / Bin"],
                      ["batchNumber", "Batch / Lot Number"],
                      ["dimensions", "Dimensions (L × W × H)"],
                    ].map(([name, label]) => (
                      <div key={name}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                          {label}
                        </label>
                        <input
                          type="text"
                          name={name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        defaultValue="pcs"
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      >
                        {["pcs", "box", "carton", "kg", "litre", "set"].map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                        Weight
                      </label>
                      <input type="number" step="0.01" name="weight" onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      onChange={handleChange}
                      rows="4"
                      placeholder="Write details about product features, material, etc."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Cost Price ($)
                    </label>
                    <input type="number" step="0.01" name="costPrice" onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Expiry Date
                    </label>
                    <input type="date" name="expiryDate" onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-500" /> Pricing
                  & Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      SKU / Barcode *
                    </label>
                    <input
                      type="text"
                      name="SKU"
                      onChange={handleChange}
                      placeholder="e.g. WH-LP-2024"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Category & Stock */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Boxes size={18} className="text-orange-500" /> Inventory
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                      Initial Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 opacity-90">
                  <ShieldAlert size={16} className="text-yellow-400" /> Stock
                  Alert
                </h3>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  defaultValue="10"
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all text-white font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-3 italic">
                  * System will notify you when stock falls below this number.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Product <Plus size={20} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/inventory")}
                  className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
