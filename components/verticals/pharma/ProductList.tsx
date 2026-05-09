import type { PharmacyProduct } from "@/types/pharma";
import { Table } from "@/components/ui/Table";
export function ProductList({ products }: { products: PharmacyProduct[] }) { return <Table headers={["Product", "Category", "Stock", "Reorder"]} rows={products.map(p => [p.name, p.category, String(p.stockOnHand), String(p.reorderPoint)])} />; }
