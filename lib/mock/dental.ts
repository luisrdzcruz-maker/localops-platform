import type { DentalAppointment, DentalNoShowEvent, DentalPatientProfile, DentalRecallCampaign, DentalReviewRequest } from "@/types/dental";

export const dentalPatients: DentalPatientProfile[] = [
  { id: "pat-1", organizationId: "org-demo", contactId: "contact-3", lastVisitAt: "2025-10-01", nextRecallAt: "2026-05-20", inactive: false, preferredChannel: "sms", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "pat-2", organizationId: "org-demo", contactId: "contact-6", lastVisitAt: "2024-12-10", inactive: true, preferredChannel: "email", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "pat-3", organizationId: "org-demo", contactId: "contact-7", lastVisitAt: "2026-02-11", inactive: false, preferredChannel: "phone", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "pat-4", organizationId: "org-demo", contactId: "contact-8", lastVisitAt: "2025-01-18", inactive: true, preferredChannel: "sms", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "pat-5", organizationId: "org-demo", contactId: "contact-9", inactive: true, preferredChannel: "email", createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const dentalAppointments: DentalAppointment[] = Array.from({ length: 6 }).map((_, index) => ({
  id: `appt-${index+1}`,
  organizationId: "org-demo",
  patientContactId: index === 0 ? "contact-3" : `contact-${index+3}`,
  startsAt: `2026-05-${10+index}T0${8+index}:00:00`,
  endsAt: `2026-05-${10+index}T0${8+index}:30:00`,
  status: index === 1 ? "no_show" : index === 2 ? "confirmed" : "scheduled",
  appointmentType: index % 2 === 0 ? "Check-up" : "Cleaning",
  createdAt: "2026-05-01",
  updatedAt: "2026-05-01"
}));

export const noShows: DentalNoShowEvent[] = [
  { id: "noshow-1", organizationId: "org-demo", appointmentId: "appt-2", patientContactId: "contact-4", reason: "Forgot appointment", recovered: false, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "noshow-2", organizationId: "org-demo", appointmentId: "appt-6", patientContactId: "contact-8", reason: "Work conflict", recovered: true, createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const recallCampaigns: DentalRecallCampaign[] = [
  { id: "recall-1", organizationId: "org-demo", name: "Inactive patients 12m+", status: "active", audience: "Inactive patients", sentCount: 42, bookedCount: 6, createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const reviewRequests: DentalReviewRequest[] = [
  { id: "review-1", organizationId: "org-demo", patientContactId: "contact-3", status: "sent", sentAt: "2026-05-06", createdAt: "2026-05-01", updatedAt: "2026-05-06" },
  { id: "review-2", organizationId: "org-demo", patientContactId: "contact-7", status: "pending", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "review-3", organizationId: "org-demo", patientContactId: "contact-8", status: "completed", sentAt: "2026-05-02", createdAt: "2026-05-01", updatedAt: "2026-05-02" }
];

export const dentalMetrics = { todayAppointments: 5, noShowsThisMonth: 2, recallOpportunities: 18, reviewRequests: 3 };
