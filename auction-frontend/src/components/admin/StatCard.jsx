export default function StatCard({ label, value, sub, color = "indigo" }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        green: "bg-green-50 text-green-600 border-green-100",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
        red: "bg-red-50 text-red-600 border-red-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
    };

    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
            {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
        </div>
    );
}
