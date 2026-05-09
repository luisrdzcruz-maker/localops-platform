import type { DentalPatientProfile } from "@/types/dental";
import { Table } from "@/components/ui/Table";
export function PatientList({ patients }: { patients: DentalPatientProfile[] }) { return <Table headers={["Patient ID", "Inactive", "Preferred channel"]} rows={patients.map(p => [p.contactId, p.inactive ? "Yes" : "No", p.preferredChannel])} />; }
