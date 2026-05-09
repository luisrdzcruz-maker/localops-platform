import { Table } from "@/components/ui/Table";
export function AiUsageTable() { return <Table headers={["Action", "Credits", "Status"]} rows={[["Generate estimate", "3", "completed"], ["Classify project photo", "5", "blocked in trial"], ["Summarize sales import", "3", "completed"]]} />; }
