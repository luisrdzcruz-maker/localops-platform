export function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{headers.map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-t border-slate-100">{row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}
