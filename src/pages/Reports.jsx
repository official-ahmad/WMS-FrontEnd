import { useState, useEffect } from "react";
import {
  AlertCircle,
  Package,
  TrendingUp,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import {
  getLowStockReport,
  getTopProductsReport,
  getDailySummary,
} from "../api";
import { useToast } from "../context/ToastContext";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Reports() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lowStockData, setLowStockData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Furniture",
    "Books",
    "Hardware",
    "Other",
  ];

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [startDate, endDate, selectedCategory]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [lowStock, top, daily] = await Promise.all([
        getLowStockReport(selectedCategory),
        getTopProductsReport(startDate, endDate, null, 5),
        getDailySummary(startDate, endDate),
      ]);

      setLowStockData(lowStock.data);
      setTopProducts(top.data);
      setDailySummary(daily.data);
    } catch (err) {
      addToast("Failed to fetch reports", "error", 3000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Warehouse Reports", 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 36);

      let yPos = 45;

      if (lowStockData?.products?.length > 0) {
        doc.setFontSize(12);
        doc.text("Low Stock Items", 14, yPos);
        yPos += 8;

        const lowStockRows = lowStockData.products.map((p) => [
          p.SKU,
          p.name,
          p.quantity.toString(),
          p.lowStockThreshold.toString(),
          (p.lowStockThreshold - p.quantity).toString(),
        ]);

        doc.autoTable({
          head: [["SKU", "Product", "Current", "Threshold", "Shortage"]],
          body: lowStockRows,
          startY: yPos,
          margin: { left: 14, right: 14 },
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
          columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 70 } },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      if (topProducts?.length > 0) {
        doc.setFontSize(12);
        doc.text("Top Products", 14, yPos);
        yPos += 8;

        const topRows = topProducts.map((p) => [
          p.SKU,
          p.name,
          p.totalTransactions.toString(),
          p.totalQuantity.toString(),
        ]);

        doc.autoTable({
          head: [["SKU", "Product", "Transactions", "Quantity"]],
          body: topRows,
          startY: yPos,
          margin: { left: 14, right: 14 },
          theme: "grid",
          headStyles: { fillColor: [34, 197, 94] },
        });
      }

      doc.save(`warehouse-report-${new Date().getTime()}.pdf`);
      addToast("PDF exported successfully!", "success", 2000);
    } catch (err) {
      addToast("Failed to export PDF", "error", 3000);
      console.error(err);
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      if (lowStockData?.products?.length > 0) {
        const lowStockSheet = XLSX.utils.json_to_sheet(
          lowStockData.products.map((p) => ({
            SKU: p.SKU,
            Product: p.name,
            Category: p.category,
            Current: p.quantity,
            Threshold: p.lowStockThreshold,
            Shortage: p.lowStockThreshold - p.quantity,
            Price: p.price,
          })),
        );
        XLSX.utils.book_append_sheet(workbook, lowStockSheet, "Low Stock");
      }

      if (topProducts?.length > 0) {
        const topSheet = XLSX.utils.json_to_sheet(
          topProducts.map((p) => ({
            SKU: p.SKU,
            Product: p.name,
            Category: p.category,
            Transactions: p.totalTransactions,
            Quantity: p.totalQuantity,
            LastTransaction: p.lastTransaction
              ? new Date(p.lastTransaction).toLocaleString()
              : "N/A",
          })),
        );
        XLSX.utils.book_append_sheet(workbook, topSheet, "Top Products");
      }

      if (dailySummary?.length > 0) {
        const dailySheet = XLSX.utils.json_to_sheet(dailySummary);
        XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Summary");
      }

      XLSX.writeFile(workbook, `warehouse-report-${new Date().getTime()}.xlsx`);
      addToast("Excel exported successfully!", "success", 2000);
    } catch (err) {
      addToast("Failed to export Excel", "error", 3000);
      console.error(err);
    }
  };

  if (loading && !lowStockData) {
    return (
      <div className="lg:ml-64 min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Package className="text-blue-600 mx-auto" size={48} />
          </div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: dailySummary?.map((d) => d._id) || [],
    datasets: [
      {
        label: "Stock In",
        data: dailySummary?.map((d) => d.inQuantity) || [],
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Stock Out",
        data: dailySummary?.map((d) => d.outQuantity) || [],
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="lg:ml-64 min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Comprehensive inventory analysis and insights
        </p>
      </div>

      <div className="p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Filter
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchReports}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Filter size={16} />
                <span className="hidden md:inline">Refresh</span>
                <span className="md:hidden">Refresh</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Low Stock Items
                </h2>
                <AlertCircle size={20} className="text-red-600" />
              </div>

              {lowStockData?.products?.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600">Total Items</p>
                      <p className="text-2xl font-bold text-red-700">
                        {lowStockData.totalItems}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600">Total Shortage</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {lowStockData.totalShortage}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">
                            SKU
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">
                            Product
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">
                            Shortage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {lowStockData.products.slice(0, 10).map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                {product.SKU}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-2 text-center text-gray-600">
                              {product.quantity}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="text-red-600 font-semibold">
                                -{product.lowStockThreshold - product.quantity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="text-gray-500">No low stock items</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Products
                </h2>
                <TrendingUp size={20} className="text-green-600" />
              </div>

              {topProducts?.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.SKU} • {product.category}
                          </p>
                        </div>
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          #{product.totalTransactions}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Transactions</p>
                          <p className="font-semibold text-gray-900">
                            {product.totalTransactions}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Quantity Moved</p>
                          <p className="font-semibold text-gray-900">
                            {product.totalQuantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="text-gray-500">No transaction data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Daily Transaction Summary
            </h2>
            <Calendar size={20} className="text-blue-600" />
          </div>

          {dailySummary?.length > 0 ? (
            <>
              <div className="mb-8 h-80">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700">
                        In Qty
                      </th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700">
                        Out Qty
                      </th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700">
                        In Count
                      </th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700">
                        Out Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailySummary.map((day) => (
                      <tr key={day._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900 font-medium">
                          {day._id}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="text-green-600 font-semibold">
                            +{day.inQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="text-blue-600 font-semibold">
                            -{day.outQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {day.inCount}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {day.outCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-500">No transaction data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
