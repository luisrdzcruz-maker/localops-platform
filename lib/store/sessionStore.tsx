"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from "react";
import type { Contact } from "@/types/core";
import type {
  ConstructionExpense,
  ConstructionExpenseCategory,
  ConstructionExpenseSource,
  ConstructionExtra,
  ConstructionExtraStatus,
  ConstructionPayment,
  ConstructionPaymentMethod,
  ConstructionProject,
  ConstructionTicket,
  ConstructionTicketStatus,
  IssuedInvoice,
  IssuedInvoiceStatus
} from "@/types/construction";
import { contacts as initialContacts } from "@/lib/mock/core";
import {
  constructionExpenses as initialExpenses,
  constructionExtras as initialExtras,
  constructionPayments as initialPayments,
  constructionProjects as initialProjects,
  constructionTickets as initialTickets,
  issuedInvoices as initialInvoices
} from "@/lib/mock/construction";

const STORAGE_KEY = "obrarentable.session.v2";
const STORAGE_VERSION = 2;

export interface ObraStoreState {
  contacts: Contact[];
  projects: ConstructionProject[];
  expenses: ConstructionExpense[];
  payments: ConstructionPayment[];
  tickets: ConstructionTicket[];
  invoices: IssuedInvoice[];
  extras: ConstructionExtra[];
}

export interface CreateContactInput {
  name: string;
  type?: Contact["type"];
  email?: string;
  phone?: string;
}

export interface CreateProjectInput {
  contactId: string;
  name: string;
  address?: string;
  obraType?: string;
  status?: ConstructionProject["status"];
  presupuestoTotal: number;
  presupuestoVatRate?: number;
  estimatedMaterialCost?: number;
  estimatedLaborCost?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface CreateExpenseInput {
  projectId: string;
  category: ConstructionExpenseCategory;
  provider?: string;
  description: string;
  amount: number;
  vatRate: number;
  date: string;
  source?: ConstructionExpenseSource;
  notes?: string;
}

export interface CreatePaymentInput {
  projectId: string;
  amount: number;
  phase?: string;
  method?: ConstructionPaymentMethod;
  paidAt: string;
  notes?: string;
}

export interface CreateExtraInput {
  projectId: string;
  title: string;
  description?: string;
  amount: number;
  vatRate: number;
  status?: ConstructionExtraStatus;
  notes?: string;
}

export interface CreateInvoiceInput {
  projectId: string;
  contactId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status?: IssuedInvoiceStatus;
  concept: string;
  subtotal: number;
  vatRate: number;
  notes?: string;
}

type Listener = () => void;

interface PersistShape {
  version: number;
  state: ObraStoreState;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function freshInitial(): ObraStoreState {
  return {
    contacts: initialContacts,
    projects: initialProjects,
    expenses: initialExpenses,
    payments: initialPayments,
    tickets: initialTickets,
    invoices: initialInvoices,
    extras: initialExtras
  };
}

class ObraStore {
  private state: ObraStoreState;
  private listeners = new Set<Listener>();
  private hydrated = false;

  constructor(initial: ObraStoreState) {
    this.state = initial;
  }

  getState = (): ObraStoreState => this.state;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  hydrateFromStorage = () => {
    if (this.hydrated) return;
    this.hydrated = true;
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistShape;
      if (
        parsed &&
        parsed.version === STORAGE_VERSION &&
        parsed.state &&
        Array.isArray(parsed.state.projects) &&
        Array.isArray(parsed.state.expenses) &&
        Array.isArray(parsed.state.payments) &&
        Array.isArray(parsed.state.tickets) &&
        Array.isArray(parsed.state.contacts) &&
        Array.isArray(parsed.state.invoices)
      ) {
        // Migrate: extras may be absent in sessions saved before this field was added
        const extras = Array.isArray(parsed.state.extras) ? parsed.state.extras : initialExtras;
        this.state = { ...parsed.state, extras };
        this.notify();
      }
    } catch {
      // ignore corrupted storage
    }
  };

  reset = () => {
    this.state = freshInitial();
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    this.notify();
  };

  private persist() {
    if (typeof window === "undefined") return;
    try {
      const payload: PersistShape = { version: STORAGE_VERSION, state: this.state };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }

  private update(next: Partial<ObraStoreState>) {
    this.state = { ...this.state, ...next };
    this.persist();
    this.notify();
  }

  createContact = (input: CreateContactInput): Contact => {
    const now = new Date().toISOString();
    const contact: Contact = {
      id: makeId("contact"),
      organizationId: "org-demo",
      type: input.type ?? "client",
      name: input.name.trim(),
      email: input.email,
      phone: input.phone,
      tags: [],
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    this.update({ contacts: [contact, ...this.state.contacts] });
    return contact;
  };

  createProject = (input: CreateProjectInput): ConstructionProject => {
    const now = new Date().toISOString();
    const project: ConstructionProject = {
      id: makeId("project"),
      organizationId: "org-demo",
      contactId: input.contactId,
      name: input.name.trim(),
      address: input.address?.trim() || undefined,
      status: input.status ?? "quoted",
      budget: input.presupuestoTotal,
      presupuestoTotal: input.presupuestoTotal,
      presupuestoVatRate: input.presupuestoVatRate,
      estimatedMaterialCost: input.estimatedMaterialCost ?? 0,
      estimatedLaborCost: input.estimatedLaborCost ?? 0,
      actualMaterialCost: 0,
      actualLaborCost: 0,
      startDate: input.startDate || undefined,
      endDate: input.endDate || undefined,
      obraType: input.obraType,
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };
    this.update({ projects: [project, ...this.state.projects] });
    return project;
  };

  createExpense = (input: CreateExpenseInput): ConstructionExpense => {
    const now = new Date().toISOString();
    const vatAmount = input.amount * input.vatRate;
    const expense: ConstructionExpense = {
      id: makeId("expense"),
      organizationId: "org-demo",
      projectId: input.projectId,
      category: input.category,
      provider: input.provider?.trim() || undefined,
      description: input.description.trim(),
      amount: input.amount,
      vatRate: input.vatRate,
      vatAmount,
      total: input.amount + vatAmount,
      date: input.date,
      status: "confirmed",
      source: input.source ?? "manual",
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };
    this.update({ expenses: [expense, ...this.state.expenses] });
    return expense;
  };

  createPayment = (input: CreatePaymentInput): ConstructionPayment => {
    const now = new Date().toISOString();
    const payment: ConstructionPayment = {
      id: makeId("payment"),
      organizationId: "org-demo",
      projectId: input.projectId,
      amount: input.amount,
      phase: input.phase,
      method: input.method,
      paidAt: input.paidAt,
      status: "paid",
      createdAt: now,
      updatedAt: now
    };
    this.update({ payments: [payment, ...this.state.payments] });
    return payment;
  };

  markPaymentPaid = (paymentId: string) => {
    const now = new Date().toISOString();
    const payments = this.state.payments.map(p => {
      if (p.id !== paymentId) return p;
      return { ...p, status: "paid" as const, paidAt: p.paidAt ?? now, updatedAt: now };
    });
    this.update({ payments });
  };

  updateTicketStatus = (ticketId: string, status: ConstructionTicketStatus, projectId?: string) => {
    const now = new Date().toISOString();
    const tickets = this.state.tickets.map(t => {
      if (t.id !== ticketId) return t;
      const linkedProjectId =
        status === "linked" ? projectId ?? t.suggestedProjectId ?? t.projectId : t.projectId;
      return { ...t, status, projectId: linkedProjectId, updatedAt: now };
    });
    this.update({ tickets });
  };

  createInvoice = (input: CreateInvoiceInput): IssuedInvoice => {
    const now = new Date().toISOString();
    const status = input.status ?? "draft";
    const vatAmount = input.subtotal * input.vatRate;
    const total = input.subtotal + vatAmount;
    const paidAmount = status === "paid" ? total : 0;
    const invoice: IssuedInvoice = {
      id: makeId("invoice"),
      organizationId: "org-demo",
      projectId: input.projectId,
      contactId: input.contactId,
      invoiceNumber: input.invoiceNumber.trim(),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status,
      concept: input.concept.trim(),
      subtotal: input.subtotal,
      vatRate: input.vatRate,
      vatAmount,
      total,
      paidAmount,
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };
    this.update({ invoices: [invoice, ...this.state.invoices] });
    return invoice;
  };

  updateInvoiceStatus = (invoiceId: string, status: IssuedInvoiceStatus) => {
    const now = new Date().toISOString();
    const invoices = this.state.invoices.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const paidAmount = status === "paid" ? inv.total : status === "cancelled" ? 0 : inv.paidAmount;
      return { ...inv, status, paidAmount, updatedAt: now };
    });
    this.update({ invoices });
  };

  createExtra = (input: CreateExtraInput): ConstructionExtra => {
    const now = new Date().toISOString();
    const vatAmount = input.amount * input.vatRate;
    const extra: ConstructionExtra = {
      id: makeId("extra"),
      organizationId: "org-demo",
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      amount: input.amount,
      vatRate: input.vatRate,
      vatAmount,
      total: input.amount + vatAmount,
      status: input.status ?? "proposed",
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };
    this.update({ extras: [extra, ...this.state.extras] });
    return extra;
  };

  updateExtraStatus = (extraId: string, status: ConstructionExtraStatus) => {
    const now = new Date().toISOString();
    const extras = this.state.extras.map(e => (e.id !== extraId ? e : { ...e, status, updatedAt: now }));
    this.update({ extras });
  };

  convertTicketToExpense = (
    ticketId: string,
    overrides: {
      projectId: string;
      category: ConstructionExpenseCategory;
      description: string;
      amount: number;
      vatRate: number;
      date: string;
      provider?: string;
    }
  ): ConstructionExpense | null => {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === "linked") return null;
    const now = new Date().toISOString();
    const vatAmount = overrides.amount * overrides.vatRate;
    const expense: ConstructionExpense = {
      id: makeId("expense"),
      organizationId: "org-demo",
      projectId: overrides.projectId,
      category: overrides.category,
      provider: overrides.provider?.trim() || undefined,
      description: overrides.description.trim(),
      amount: overrides.amount,
      vatRate: overrides.vatRate,
      vatAmount,
      total: overrides.amount + vatAmount,
      date: overrides.date,
      status: "confirmed",
      source: "ticket",
      ticketId,
      createdAt: now,
      updatedAt: now
    };
    const tickets = this.state.tickets.map(t =>
      t.id !== ticketId ? t : { ...t, status: "linked" as const, projectId: overrides.projectId, updatedAt: now }
    );
    this.update({ expenses: [expense, ...this.state.expenses], tickets });
    return expense;
  };
}

const obraStore = new ObraStore(freshInitial());

const StoreContext = createContext<ObraStore>(obraStore);

export function ObraStoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    obraStore.hydrateFromStorage();
  }, []);
  return <StoreContext.Provider value={obraStore}>{children}</StoreContext.Provider>;
}

function useStore(): ObraStore {
  return useContext(StoreContext);
}

function useStoreSelector<T>(selector: (state: ObraStoreState) => T): T {
  const store = useStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}

const selectContacts = (s: ObraStoreState) => s.contacts;
const selectProjects = (s: ObraStoreState) => s.projects;
const selectExpenses = (s: ObraStoreState) => s.expenses;
const selectPayments = (s: ObraStoreState) => s.payments;
const selectTickets = (s: ObraStoreState) => s.tickets;
const selectInvoices = (s: ObraStoreState) => s.invoices;
const selectExtras = (s: ObraStoreState) => s.extras;

export function useContacts(): Contact[] {
  return useStoreSelector(selectContacts);
}
export function useProjects(): ConstructionProject[] {
  return useStoreSelector(selectProjects);
}
export function useExpenses(): ConstructionExpense[] {
  return useStoreSelector(selectExpenses);
}
export function usePayments(): ConstructionPayment[] {
  return useStoreSelector(selectPayments);
}
export function useTickets(): ConstructionTicket[] {
  return useStoreSelector(selectTickets);
}
export function useInvoices(): IssuedInvoice[] {
  return useStoreSelector(selectInvoices);
}
export function useExtras(): ConstructionExtra[] {
  return useStoreSelector(selectExtras);
}

export function useContact(id: string | undefined) {
  const contacts = useContacts();
  return useMemo(() => (id ? contacts.find(c => c.id === id) : undefined), [contacts, id]);
}

export function useContactNameById() {
  const contacts = useContacts();
  return useMemo(() => Object.fromEntries(contacts.map(c => [c.id, c.name])), [contacts]);
}

export function useProject(id: string | undefined) {
  const projects = useProjects();
  return useMemo(() => (id ? projects.find(p => p.id === id) : undefined), [projects, id]);
}

export function useExpensesByProject(id: string) {
  const expenses = useExpenses();
  return useMemo(() => expenses.filter(e => e.projectId === id), [expenses, id]);
}

export function usePaymentsByProject(id: string) {
  const payments = usePayments();
  return useMemo(() => payments.filter(p => p.projectId === id), [payments, id]);
}

export function useTicketsByProject(id: string) {
  const tickets = useTickets();
  return useMemo(
    () => tickets.filter(t => t.projectId === id || t.suggestedProjectId === id),
    [tickets, id]
  );
}

export function useTicket(id: string | undefined) {
  const tickets = useTickets();
  return useMemo(() => (id ? tickets.find(t => t.id === id) : undefined), [tickets, id]);
}

export function useInvoicesByProject(id: string) {
  const invoices = useInvoices();
  return useMemo(() => invoices.filter(inv => inv.projectId === id), [invoices, id]);
}
export function useExtrasByProject(id: string) {
  const extras = useExtras();
  return useMemo(() => extras.filter(e => e.projectId === id), [extras, id]);
}

export interface ObraStoreActions {
  createContact: ObraStore["createContact"];
  createProject: ObraStore["createProject"];
  createExpense: ObraStore["createExpense"];
  createPayment: ObraStore["createPayment"];
  markPaymentPaid: ObraStore["markPaymentPaid"];
  updateTicketStatus: ObraStore["updateTicketStatus"];
  createInvoice: ObraStore["createInvoice"];
  updateInvoiceStatus: ObraStore["updateInvoiceStatus"];
  createExtra: ObraStore["createExtra"];
  updateExtraStatus: ObraStore["updateExtraStatus"];
  convertTicketToExpense: ObraStore["convertTicketToExpense"];
  reset: ObraStore["reset"];
}

export function useObraStoreActions(): ObraStoreActions {
  const store = useStore();
  return useMemo(
    () => ({
      createContact: store.createContact,
      createProject: store.createProject,
      createExpense: store.createExpense,
      createPayment: store.createPayment,
      markPaymentPaid: store.markPaymentPaid,
      updateTicketStatus: store.updateTicketStatus,
      createInvoice: store.createInvoice,
      updateInvoiceStatus: store.updateInvoiceStatus,
      createExtra: store.createExtra,
      updateExtraStatus: store.updateExtraStatus,
      convertTicketToExpense: store.convertTicketToExpense,
      reset: store.reset
    }),
    [store]
  );
}
