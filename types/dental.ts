import type { BaseEntity } from "./core";

export interface DentalPatientProfile extends BaseEntity { contactId: string; lastVisitAt?: string; nextRecallAt?: string; inactive: boolean; preferredChannel: "email" | "sms" | "phone" | "whatsapp"; }
export interface DentalAppointment extends BaseEntity { patientContactId: string; startsAt: string; endsAt: string; status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"; appointmentType: string; }
export interface DentalRecallCampaign extends BaseEntity { name: string; status: "draft" | "active" | "paused" | "completed"; audience: string; sentCount: number; bookedCount: number; }
export interface DentalRecallRecipient extends BaseEntity { campaignId: string; patientContactId: string; status: "pending" | "sent" | "booked" | "ignored"; }
export interface DentalNoShowEvent extends BaseEntity { appointmentId: string; patientContactId: string; reason?: string; recovered: boolean; }
export interface DentalReviewRequest extends BaseEntity { patientContactId: string; status: "pending" | "sent" | "completed"; sentAt?: string; }
export interface DentalCommunicationTemplate extends BaseEntity { name: string; channel: "email" | "sms" | "whatsapp"; body: string; }
