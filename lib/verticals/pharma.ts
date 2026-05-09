import type { VerticalConfig } from "./types";

export const pharmaVertical: VerticalConfig = {
  key: "pharma",
  name: "Pharma Operations",
  commercialName: "PharmaOps",
  description: "Auxiliary pharmacy operations dashboard for stock, sales, purchases, suppliers and reporting. No prescription workflows.",
  primaryContactLabel: "Supplier",
  primaryContactPluralLabel: "Suppliers",
  icon: "pill",
  accent: "emerald",
  enabledModules: ["dashboard", "contacts", "tasks", "documents", "automations", "integrations", "ai", "reports", "settings"],
  primaryEntities: ["products", "stock", "sales_imports", "suppliers", "purchase_orders"],
  dashboardWidgets: ["pharma_low_stock", "pharma_expiring_soon", "pharma_sales_trend", "active_automations", "connected_integrations", "ai_usage"],
  terminology: { contact: "Supplier", product: "Product", import: "Sales import", warning: "Operational alert" },
  navigation: [
    { label: "Dashboard", href: "/verticals/pharma", icon: "dashboard" },
    { label: "Products", href: "/verticals/pharma/products", icon: "box" },
    { label: "Stock", href: "/verticals/pharma/stock", icon: "warehouse" },
    { label: "Imports", href: "/verticals/pharma/imports", icon: "upload" },
    { label: "Suppliers", href: "/verticals/pharma/suppliers", icon: "truck" },
    { label: "Purchase Orders", href: "/verticals/pharma/purchase-orders", icon: "file" },
    { label: "Reports", href: "/verticals/pharma/reports", icon: "chart" }
  ],
  aiActions: ["summarize_sales_import", "detect_stock_anomalies", "explain_margin_report", "generate_purchase_suggestions"],
  permissions: ["vertical.pharma.access"],
  onboardingSteps: ["Import a product CSV", "Review stock alerts", "Add suppliers", "Generate first operations report"],
  emptyStates: { products: "Import or add your first pharmacy product.", imports: "Upload a CSV export to generate operations insights." }
};
