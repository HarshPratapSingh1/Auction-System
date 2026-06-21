export default function DataTable({ columns, data, loading, emptyMessage = "No data found." }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                Loading...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {data.map((row, i) => (
                        <tr key={row._id || i} className="hover:bg-gray-50 transition">
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-gray-700">
                                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
