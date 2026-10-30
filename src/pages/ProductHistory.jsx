import { useEffect, useState } from "react";
import {
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { RangeSwitch } from "../components/WarehouseControls";
import WarehouseLoader from "../components/WarehouseLoader";

export default function ProductHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("week");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "/products/history/deleted",
        );
        setHistory(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch product history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const rangeStart = new Date();
  const rangeDays = { day: 1, week: 7, month: 30, year: 365 }[range];
  rangeStart.setDate(rangeStart.getDate() - rangeDays);
  const filteredHistory = history.filter(
    (item) => new Date(item.deletedAt) >= rangeStart,
  );

  if (loading) {
    return (
      <div className="lg:ml-64 min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <WarehouseLoader label="Loading product history..." />
      </div>
    );
  }

  return (
    <div className="lg:ml-64 min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 p-4 md:p-8">
        <div className="flex items-center gap-3">
          <Trash2 size={32} className="text-blue-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Product History
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              View all deleted products and their statistics.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Filter history by time range</p>
          <RangeSwitch value={range} onChange={setRange} />
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700">
                    Product
                  </th>
                  <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-medium text-gray-700">
                    Qty In
                  </th>
                  <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-medium text-gray-700">
                    Qty Out
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-700">
                    Revenue
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700">
                    Created
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700">
                    Deleted
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {history.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 md:w-10 h-8 md:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-red-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">{item.SKU}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <TrendingDown
                            size={16}
                            className="text-green-600 hidden md:inline"
                          />
                          <span className="inline-block bg-green-50 text-green-700 px-2 md:px-3 py-1 rounded-full text-xs font-medium">
                            +{item.quantityIn}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <TrendingUp
                            size={16}
                            className="text-blue-600 hidden md:inline"
                          />
                          <span className="inline-block bg-blue-50 text-blue-700 px-2 md:px-3 py-1 rounded-full text-xs font-medium">
                            -{item.quantityOut}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm md:text-base font-bold text-gray-900">
                          Rs. {item.revenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-xs md:text-sm">
                          <Calendar size={14} className="hidden md:inline" />
                          {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-xs md:text-sm">
                          <Trash2
                            size={14}
                            className="hidden md:inline text-red-600"
                          />
                          {formatDate(item.deletedAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 md:px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={40} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm md:text-base">
                          No deleted products found.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 md:px-6 py-3 border-t border-gray-100">
            <p className="text-xs md:text-sm text-gray-600">
              Showing <span className="font-medium">{filteredHistory.length}</span>{" "}
              deleted products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
