import type { DentalAppointment } from "@/types/dental";
import { Table } from "@/components/ui/Table";
export function AppointmentList({ appointments }: { appointments: DentalAppointment[] }) { return <Table headers={["Patient", "Type", "Status", "Starts"]} rows={appointments.map(a => [a.patientContactId, a.appointmentType, a.status, a.startsAt])} />; }
