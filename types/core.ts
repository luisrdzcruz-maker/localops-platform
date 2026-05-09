import type { VerticalKey } from "./modules";

export type ID = string;
export type ISODate = string;

export interface BaseEntity {
  id: ID;
  organizationId: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  createdBy?: ID;
  updatedBy?: ID;
}

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  activeVerticals: VerticalKey[];
  primaryVertical: VerticalKey;
  plan: "trial" | "basic" | "pro" | "enterprise";
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface UserProfile {
  id: ID;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface OrganizationMember {
  id: ID;
  organizationId: ID;
  userId: ID;
  role: string;
  status: "active" | "invited" | "disabled";
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type ContactType = "client" | "patient" | "supplier" | "lead" | "partner";

export interface Contact extends BaseEntity {
  type: ContactType;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  notes?: string;
  tags: string[];
  status: "active" | "inactive" | "lead" | "archived";
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  dueAt?: ISODate;
  assignedTo?: ID;
  relatedContactId?: ID;
  relatedEntityType?: string;
  relatedEntityId?: ID;
}

export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  startAt: ISODate;
  endAt: ISODate;
  location?: string;
  relatedContactId?: ID;
  source: "manual" | "google_calendar" | "vertical";
}

export interface ActivityLog extends BaseEntity {
  actorId?: ID;
  action: string;
  entityType: string;
  entityId: ID;
  summary: string;
}
