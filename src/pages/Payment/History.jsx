import React, { useEffect, useState } from "react";
import api from "../../utils/Api";
import Input from "../../components/common/Input";
import { Search, FileText } from "lucide-react";

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/subscription/history").then((res) => setHistory(res.data.data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold">Billing History</h1>
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                Invoice
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      {item.description}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  CA${item.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${item.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:text-primaryHover flex items-center gap-1 text-sm font-bold">
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
