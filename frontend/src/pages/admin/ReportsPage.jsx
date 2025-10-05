import { useEffect, useState } from "react";
import api from "../../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from "recharts";

export default function ReportsPage() {
  const [revenue, setRevenue] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/api/admin/reports/revenue"),
      api.get("/api/admin/reports/status"),
      api.get("/api/admin/reports/top-services"),
      api.get("/api/admin/reports/top-providers"),
      api.get("/api/admin/reports/top-customers"),
    ]).then(([rev, stat, svc, prov, cust]) => {
      setRevenue(rev.data || []);
      setStatusDist(stat.data || []);
      setTopServices(svc.data || []);
      setTopProviders(prov.data || []);
      setTopCustomers(cust.data || []);
    }).catch(() => {});
  }, []);

  const downloadPdf = async () => {
    const res = await api.get("/api/admin/reports/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "admin-reports-summary.pdf");
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const formatCurrency = (v) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(v || 0));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <button onClick={downloadPdf} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Download PDF</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-5 md:col-span-2">
          <h2 className="font-semibold mb-3">Revenue Trend (30 days)</h2>
          <div className="h-64">
            {revenue.length === 0 ? (
              <div className="text-sm text-gray-600">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} width={60} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-3">Booking Status Distribution</h2>
          <div className="h-64">
            {statusDist.length === 0 ? (
              <div className="text-sm text-gray-600">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist} nameKey="status" dataKey="count" outerRadius={80} fill="#8884d8" label>
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#60a5fa", "#34d399", "#fbbf24", "#22d3ee", "#f87171"][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-3">Top Services</h2>
          <div className="h-64">
            {topServices.length === 0 ? (
              <div className="text-sm text-gray-600">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 md:col-span-2">
          <h2 className="font-semibold mb-3">Top Providers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Completed</th>
                  <th className="py-2 pr-4">Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {topProviders.map((p, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 pr-4">{p.providerName}</td>
                    <td className="py-2 pr-4">{p.completedCount}</td>
                    <td className="py-2 pr-4">{Number(p.avgRating).toFixed(2)}</td>
                  </tr>
                ))}
                {topProviders.length === 0 && (
                  <tr><td className="py-2" colSpan={3}>No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-3">Top Customers</h2>
          <div className="h-64">
            {topCustomers.length === 0 ? (
              <div className="text-sm text-gray-600">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="customerName" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


