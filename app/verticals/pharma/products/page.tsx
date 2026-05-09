import { AppShell } from "@/components/shell/AppShell";
import { ProductList } from "@/components/verticals/pharma/ProductList";import { pharmacyProducts } from "@/lib/mock/pharma";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">Products</h1><ProductList products={pharmacyProducts} /></div></AppShell>; }
