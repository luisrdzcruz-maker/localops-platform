import { activityLogs } from "@/lib/mock/core";
export function ActivityFeed() { return <div className="space-y-3">{activityLogs.map(item => <div key={item.id} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-medium text-slate-900">{item.summary}</p><p className="text-xs text-slate-500">{item.action}</p></div>)}</div>; }
