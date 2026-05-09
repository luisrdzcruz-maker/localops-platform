import type { ActivityLog, CalendarEvent, Contact, Organization, Task } from "@/types/core";

export const demoOrganization: Organization = { id: "org-demo", name: "Demo Micro-SME", slug: "demo", activeVerticals: ["construction", "dental", "pharma"], primaryVertical: "construction", plan: "trial", createdAt: "2026-05-01", updatedAt: "2026-05-01" };

export const contacts: Contact[] = [
  { id: "contact-1", organizationId: "org-demo", type: "client", name: "Ana Martínez", email: "ana@example.com", phone: "+34 600 111 222", tags: ["renovation"], status: "lead", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "contact-2", organizationId: "org-demo", type: "client", name: "Javier Gómez", phone: "+34 600 333 444", tags: ["bathroom"], status: "active", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "contact-3", organizationId: "org-demo", type: "patient", name: "María López", email: "maria@example.com", tags: ["recall"], status: "active", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "contact-4", organizationId: "org-demo", type: "supplier", name: "Nordic Pharma Supply", email: "supply@example.com", tags: ["pharma"], status: "active", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "contact-5", organizationId: "org-demo", type: "lead", name: "Clínica Sonrisa", tags: ["dental"], status: "lead", createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const tasks: Task[] = [
  { id: "task-1", organizationId: "org-demo", title: "Follow up bathroom estimate", status: "todo", priority: "high", dueAt: "2026-05-12", relatedContactId: "contact-1", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "task-2", organizationId: "org-demo", title: "Review low stock alert", status: "todo", priority: "medium", dueAt: "2026-05-10", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "task-3", organizationId: "org-demo", title: "Send recall campaign draft", status: "in_progress", priority: "medium", dueAt: "2026-05-14", createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const calendarEvents: CalendarEvent[] = [
  { id: "evt-1", organizationId: "org-demo", title: "Site visit: Kitchen renovation", startAt: "2026-05-11T09:00:00", endAt: "2026-05-11T10:00:00", source: "manual", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "evt-2", organizationId: "org-demo", title: "Dental appointment reminder batch", startAt: "2026-05-12T08:30:00", endAt: "2026-05-12T09:00:00", source: "vertical", createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const activityLogs: ActivityLog[] = [
  { id: "act-1", organizationId: "org-demo", action: "estimate.sent", entityType: "construction_estimate", entityId: "estimate-1", summary: "Bathroom estimate sent to Ana Martínez", createdAt: "2026-05-08", updatedAt: "2026-05-08" },
  { id: "act-2", organizationId: "org-demo", action: "import.completed", entityType: "pharmacy_sales_import", entityId: "import-1", summary: "Weekly pharmacy sales import completed", createdAt: "2026-05-08", updatedAt: "2026-05-08" },
  { id: "act-3", organizationId: "org-demo", action: "campaign.created", entityType: "dental_recall_campaign", entityId: "recall-1", summary: "Recall campaign created for inactive patients", createdAt: "2026-05-08", updatedAt: "2026-05-08" }
];
