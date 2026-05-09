import type { SVGProps } from "react";

const baseProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

function svg(path: React.ReactNode, props: SVGProps<SVGSVGElement> = {}) {
  return <svg {...baseProps} {...props}>{path}</svg>;
}

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M12 5v14" /><path d="M5 12h14" /></>, p);

export const MinusIcon = (p: SVGProps<SVGSVGElement>) => svg(<path d="M5 12h14" />, p);

export const ArrowDownToLineIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>, p);

export const CameraIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M14.5 4h-5l-2 3H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-3.5l-2-3Z" /><circle cx="12" cy="13" r="3.5" /></>, p);

export const AlertCircleIcon = (p: SVGProps<SVGSVGElement>) => svg(<><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></>, p);

export const ReceiptIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2Z" /><path d="M9 8h6" /><path d="M9 12h6" /><path d="M9 16h4" /></>, p);

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></>, p);

export const BuildingIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M4 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16" /><path d="M16 9h3a1 1 0 0 1 1 1v11" /><path d="M8 8h2" /><path d="M8 12h2" /><path d="M8 16h2" /></>, p);

export const WalletIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M3 7a2 2 0 0 1 2-2h13v4" /><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 13h3" /></>, p);

export const MoreHorizontalIcon = (p: SVGProps<SVGSVGElement>) => svg(<><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>, p);

export const ArrowRightIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></>, p);

export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => svg(<path d="m9 6 6 6-6 6" />, p);

export const RotateCcwIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>, p);

export const FileTextIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6" /><path d="M8 13h8" /><path d="M8 17h6" /></>, p);

export const BarChart2Icon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></>, p);

export const PackageIcon = (p: SVGProps<SVGSVGElement>) => svg(<><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>, p);

export const MailIcon = (p: SVGProps<SVGSVGElement>) => svg(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>, p);

export const ClipboardCopyIcon = (p: SVGProps<SVGSVGElement>) => svg(<><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" /><path d="M9 12h6" /><path d="M9 16h6" /></>, p);

export const TrendingUpIcon = (p: SVGProps<SVGSVGElement>) => svg(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>, p);

export const SettingsIcon = (p: SVGProps<SVGSVGElement>) => svg(<><line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" /></>, p);
