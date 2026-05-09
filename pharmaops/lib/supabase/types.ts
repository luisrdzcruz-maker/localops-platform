/**
 * Supabase Database types.
 *
 * Hand-written to match supabase/migrations/0001_init.sql. Once the project
 * is wired to a real Supabase project, regenerate these via:
 *   supabase gen types typescript --project-id <id> --schema public > types.ts
 *
 * Until then, keep this file in sync manually whenever the migrations change.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface Table<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

type Timestamp = string;
type DateString = string;

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  created_at: Timestamp;
}
interface PharmacyRow {
  id: string;
  name: string;
  tax_id: string | null;
  address: string | null;
  province: string | null;
  autonomous_community: string | null;
  accountant_email: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface PharmacyMemberRow {
  id: string;
  pharmacy_id: string;
  user_id: string;
  role: "owner" | "manager" | "staff" | "accountant";
  created_at: Timestamp;
}
interface SupplierRow {
  id: string;
  pharmacy_id: string;
  name: string;
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  payment_terms_days: number | null;
  notes: string | null;
  status: "active" | "inactive" | "blocked";
  preferred: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface ImportBatchRow {
  id: string;
  pharmacy_id: string;
  user_id: string | null;
  source_system: "unycop" | "farmatic" | "nixfarma" | "generic" | "manual";
  import_type: string;
  original_filename: string;
  status:
    | "uploaded"
    | "detected"
    | "mapping"
    | "validated"
    | "confirmed"
    | "failed";
  row_count: number;
  valid_row_count: number;
  error_row_count: number;
  warning_row_count: number;
  mapping: Json;
  metadata: Json;
  created_at: Timestamp;
}
interface ImportRowRow {
  id: string;
  batch_id: string;
  row_index: number;
  raw_data: Json;
  normalized_data: Json | null;
  validation_status: "valid" | "warning" | "error" | "pending";
  validation_errors: Json;
  created_at: Timestamp;
}
interface MappingTemplateRow {
  id: string;
  pharmacy_id: string;
  source_system: string;
  import_type: string;
  name: string;
  mapping: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface PurchaseInvoiceRow {
  id: string;
  pharmacy_id: string;
  supplier_id: string | null;
  import_batch_id: string | null;
  invoice_number: string;
  supplier_name: string;
  supplier_tax_id: string | null;
  invoice_date: DateString;
  due_date: DateString | null;
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  payment_status: "pending" | "partial" | "paid" | "overdue";
  category: string;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface PurchaseInvoiceLineRow {
  id: string;
  pharmacy_id: string;
  purchase_invoice_id: string | null;
  import_batch_id: string | null;
  invoice_number: string;
  product_code: string | null;
  cn_code: string | null;
  product_name: string;
  family: string;
  quantity: number;
  unit_cost: number;
  vat_rate: number;
  discount: number;
  total_cost: number;
  created_at: Timestamp;
}
interface SalesSummaryRow {
  id: string;
  pharmacy_id: string;
  import_batch_id: string | null;
  date: DateString;
  family: string;
  gross_sales: number;
  net_sales: number;
  vat_amount: number;
  units: number;
  payment_method: string | null;
  margin_amount: number | null;
  margin_percent: number | null;
  created_at: Timestamp;
}
interface StockSnapshotRow {
  id: string;
  pharmacy_id: string;
  import_batch_id: string | null;
  snapshot_date: DateString;
  product_code: string | null;
  cn_code: string | null;
  product_name: string;
  family: string;
  quantity_on_hand: number;
  unit_cost: number | null;
  pvp: number | null;
  expiry_date: DateString | null;
  supplier_name: string | null;
  reorder_point: number | null;
  created_at: Timestamp;
}
interface ExpenseRow {
  id: string;
  pharmacy_id: string;
  date: DateString;
  vendor: string;
  category: string;
  description: string;
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  payment_method: string | null;
  payment_status: "pending" | "partial" | "paid" | "overdue";
  attachment_url: string | null;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface AccountingMovementRow {
  id: string;
  pharmacy_id: string;
  import_batch_id: string | null;
  date: DateString;
  description: string;
  category: string;
  debit: number;
  credit: number;
  counterparty: string | null;
  notes: string | null;
  created_at: Timestamp;
}
interface ReportRow {
  id: string;
  pharmacy_id: string;
  user_id: string | null;
  report_type: string;
  period_start: DateString;
  period_end: DateString;
  format: string;
  status: "queued" | "generating" | "ready" | "failed";
  filename: string;
  metadata: Json;
  created_at: Timestamp;
}
interface TaskRow {
  id: string;
  pharmacy_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "done" | "skipped";
  due_date: DateString | null;
  assigned_to: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  auto_suggested: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface AuditLogRow {
  id: string;
  pharmacy_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json;
  created_at: Timestamp;
}

type Insert<R> = Partial<R> & { id?: string };
type Update<R> = Partial<R>;

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Insert<ProfileRow>, Update<ProfileRow>>;
      pharmacies: Table<PharmacyRow, Insert<PharmacyRow>, Update<PharmacyRow>>;
      pharmacy_members: Table<
        PharmacyMemberRow,
        Insert<PharmacyMemberRow>,
        Update<PharmacyMemberRow>
      >;
      suppliers: Table<SupplierRow, Insert<SupplierRow>, Update<SupplierRow>>;
      import_batches: Table<
        ImportBatchRow,
        Insert<ImportBatchRow>,
        Update<ImportBatchRow>
      >;
      import_rows: Table<
        ImportRowRow,
        Insert<ImportRowRow>,
        Update<ImportRowRow>
      >;
      mapping_templates: Table<
        MappingTemplateRow,
        Insert<MappingTemplateRow>,
        Update<MappingTemplateRow>
      >;
      purchase_invoices: Table<
        PurchaseInvoiceRow,
        Insert<PurchaseInvoiceRow>,
        Update<PurchaseInvoiceRow>
      >;
      purchase_invoice_lines: Table<
        PurchaseInvoiceLineRow,
        Insert<PurchaseInvoiceLineRow>,
        Update<PurchaseInvoiceLineRow>
      >;
      sales_summaries: Table<
        SalesSummaryRow,
        Insert<SalesSummaryRow>,
        Update<SalesSummaryRow>
      >;
      stock_snapshots: Table<
        StockSnapshotRow,
        Insert<StockSnapshotRow>,
        Update<StockSnapshotRow>
      >;
      expenses: Table<ExpenseRow, Insert<ExpenseRow>, Update<ExpenseRow>>;
      accounting_movements: Table<
        AccountingMovementRow,
        Insert<AccountingMovementRow>,
        Update<AccountingMovementRow>
      >;
      reports: Table<ReportRow, Insert<ReportRow>, Update<ReportRow>>;
      tasks: Table<TaskRow, Insert<TaskRow>, Update<TaskRow>>;
      audit_logs: Table<
        AuditLogRow,
        Insert<AuditLogRow>,
        Update<AuditLogRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
