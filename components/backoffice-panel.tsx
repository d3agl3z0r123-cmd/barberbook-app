"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-url";

const TOKEN_STORAGE_KEY = "token";
const TOKEN_TYPE_STORAGE_KEY = "token_type";
const DAY_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
];

type TabId = "overview" | "agenda" | "barbershop" | "branding" | "barbers" | "services" | "clients" | "statistics" | "public-link" | "account" | "admin";

type StatusState = {
  kind: "idle" | "success" | "error";
  title: string;
  body: string;
};

type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role?: string;
  is_active?: boolean;
  is_super_admin?: boolean;
};

type Barbershop = {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;
  image_path?: string | null;
  image_url?: string | null;
  background_image_path?: string | null;
  background_image_url?: string | null;
  logo_path?: string | null;
  logo_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
};

type BarbershopQrCode = {
  public_url: string;
  qr_url: string | null;
  qr_path: string | null;
  qr_data_uri: string | null;
  qr_generated_at: string | null;
  qr_last_regenerated_at: string | null;
  qr_scan_count?: number;
  qr_last_scanned_at: string | null;
  qr_metadata?: Record<string, unknown> | null;
  premium_ready?: {
    scan_tracking: boolean;
    custom_logo: boolean;
    pdf_export: boolean;
  };
};

type Barber = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  photo_url?: string | null;
};

type Service = {
  id: number;
  name: string;
  price: string;
  duration_minutes: number;
};

type Appointment = {
  id: number;
  barber_id: number;
  service_id: number;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  status: "booked" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  barber: { id: number; name: string } | null;
  service: { id: number; name: string } | null;
};

type DayPayload = {
  date: string;
  timezone: string;
  summary: {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    revenue: number;
    clients: number;
    upcoming: number;
  };
  appointments: Appointment[];
};

type StatisticsPayload = {
  timezone: string;
  summary: {
    appointments_total: number;
    appointments_today: number;
    appointments_month: number;
    revenue_total: number;
    revenue_today: number;
    revenue_month: number;
    clients_total: number;
    services_used: Array<{
      service_id: number | null;
      name: string;
      appointments: number;
      revenue: number;
    }>;
  };
  clients: Array<{
    name: string;
    phone: string;
    email: string | null;
    appointments: number;
    last_appointment_at: string | null;
  }>;
  updated_at: string;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_super_admin: boolean;
  disabled_at: string | null;
  created_at: string;
  barbershop: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
  } | null;
};

type AdminBarbershop = {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  owner: {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
  } | null;
};

type AdminPlatformPayload = {
  summary: {
    users_total: number;
    users_active: number;
    users_inactive: number;
    clients_total: number;
    owners_total: number;
    barbershops_total: number;
    barbershops_active: number;
    barbershops_inactive: number;
  };
  users: AdminUser[];
  barbershops: AdminBarbershop[];
};

type AdminFilter = "active" | "inactive" | "clients" | "owners";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "agenda", label: "Agenda" },
  { id: "barbershop", label: "Barbearia" },
  { id: "branding", label: "Personalização" },
  { id: "barbers", label: "Barbeiros" },
  { id: "services", label: "Serviços" },
  { id: "clients", label: "Clientes" },
  { id: "statistics", label: "Estatísticas" },
  { id: "public-link", label: "Link público" },
  { id: "account", label: "Definições de conta" },
];

const inputClass =
  "w-full rounded-xl border border-[#D8C3A5]/70 bg-[#FFF7EC] px-4 py-3 text-base font-medium text-[#2B2118] outline-none transition-all placeholder:text-[#2B2118]/35 focus:border-[#A86840] focus:ring-2 focus:ring-[#A86840]/20";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#A86840] px-4 py-2.5 text-sm font-medium text-[#FFF7EC] transition-all hover:bg-[#8A5433] disabled:opacity-50";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#D8C3A5]/70 bg-[#FFF7EC] px-4 py-2.5 text-sm font-medium text-[#2B2118] transition-all hover:border-[#A86840]/45 hover:bg-[#F1DDC2]";
const ghostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#D8C3A5]/70 bg-[#FFF7EC] px-3.5 py-2 text-sm font-medium text-[#5B4F3A] transition-all hover:border-[#A86840]/45 hover:bg-[#F1DDC2]";
const whiteCardClass = "rounded-2xl border border-[#D8C3A5]/70 bg-[#FFF7EC] shadow-[0_12px_40px_rgba(0,0,0,0.18)]";

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13h7V4H4v9Zm9 7h7v-5h-7v5Zm0-9h7V4h-7v7ZM4 20h7v-3H4v3Z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 6 5h12l2 5.5M5 10h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9Zm4 4h6" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11A3.5 3.5 0 1 0 9.5 4a3.5 3.5 0 0 0 0 7Zm8 2a3 3 0 1 0 0-6m3 14v-1a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function IconScissors() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 8 6 6m0-6-6 6M4.5 8.5A2.5 2.5 0 1 0 4.5 3a2.5 2.5 0 0 0 0 5.5Zm0 12A2.5 2.5 0 1 0 4.5 15a2.5 2.5 0 0 0 0 5.5ZM20 4l-8.5 8.5M20 20l-8.5-8.5" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4m2 7a5 5 0 0 0-7.07 0L3.1 13.83a5 5 0 1 0 7.07 7.07L13 20" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M7 4h10m-9 7v7m4-7v7m4-7v7M6 7l1 13h10l1-13" />
    </svg>
  );
}

function getTabIcon(tabId: TabId) {
  if (tabId === "overview") return <IconDashboard />;
  if (tabId === "agenda") return <IconCalendar />;
  if (tabId === "barbershop") return <IconStore />;
  if (tabId === "branding") return <IconSpark />;
  if (tabId === "barbers") return <IconUsers />;
  if (tabId === "services") return <IconScissors />;
  if (tabId === "clients") return <IconUsers />;
  if (tabId === "statistics") return <IconSpark />;
  if (tabId === "public-link") return <IconLink />;
  if (tabId === "admin") return <IconSpark />;
  return <IconSettings />;
}

function getTodayInAzores() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Azores",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return `${parts.find((part) => part.type === "year")?.value ?? "0000"}-${
    parts.find((part) => part.type === "month")?.value ?? "00"
  }-${parts.find((part) => part.type === "day")?.value ?? "00"}`;
}

function formatDayTitle(date: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: timezone || "Atlantic/Azores",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

function formatDateLabel(date: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: timezone || "Atlantic/Azores",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatDateTimeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: timezone || "Atlantic/Azores",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(value: string) {
  return value.slice(11, 16);
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function statusBadge(status: Appointment["status"]) {
  if (status === "booked") return "border border-amber-200 bg-amber-100 text-amber-800";
  if (status === "completed") return "border border-emerald-200 bg-emerald-100 text-emerald-800";
  return "border border-rose-200 bg-rose-100 text-rose-700";
}

function statusLabel(status: Appointment["status"]) {
  const labels: Record<Appointment["status"], string> = {
    booked: "Marcada",
    pending: "Pendente",
    confirmed: "Confirmada",
    completed: "Concluída",
    cancelled: "Cancelada",
    no_show: "Faltou",
  };

  return labels[status] ?? status;
}

function parseApiResponse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function isTechnicalMessage(message: unknown) {
  if (typeof message !== "string") return true;

  const text = message.trim();

  if (!text) return true;

  return [
    "SQLSTATE",
    "Exception",
    "TypeError",
    "SyntaxError",
    "Stack trace",
    "vendor/",
    "vendor\\",
    "Illuminate\\",
    "App\\",
    "Laravel",
    "backend",
    "frontend",
    "Failed to fetch",
    "NetworkError",
    "<!DOCTYPE",
    "{",
    "}",
  ].some((pattern) => text.includes(pattern));
}

function firstValidationMessage(payload: any, fields: string[]) {
  for (const field of fields) {
    const message = payload?.errors?.[field]?.[0];

    if (!isTechnicalMessage(message)) {
      return message;
    }
  }

  return null;
}

function friendlyApiError(payload: any, fallback: string, fields: string[] = []) {
  return firstValidationMessage(payload, fields) ?? (!isTechnicalMessage(payload?.message) ? payload.message : fallback);
}

function slotIsCovered(appointment: Appointment, slot: string) {
  const slotDate = new Date(`${appointment.starts_at.slice(0, 10)}T${slot}:00`);
  const start = new Date(appointment.starts_at);
  const end = new Date(appointment.ends_at);
  return slotDate >= start && slotDate < end;
}

export function BackofficePanel() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [qrCode, setQrCode] = useState<BarbershopQrCode | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dayAgenda, setDayAgenda] = useState<DayPayload | null>(null);
  const [statistics, setStatistics] = useState<StatisticsPayload | null>(null);
  const [adminPlatform, setAdminPlatform] = useState<AdminPlatformPayload | null>(null);
  const [adminFilter, setAdminFilter] = useState<AdminFilter>("active");
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayInAzores());
  const [isLoading, setIsLoading] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isQrDownloading, setIsQrDownloading] = useState(false);
  const [isQrRegenerating, setIsQrRegenerating] = useState(false);
  const [isBrandingSaving, setIsBrandingSaving] = useState(false);
  const [isExportingAgenda, setIsExportingAgenda] = useState(false);
  const [qrActionFeedback, setQrActionFeedback] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [uploadingBarberPhotoId, setUploadingBarberPhotoId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Backoffice pronto",
    body: "Escolhe uma secção no menu para gerir a tua barbearia.",
  });

  const [barbershopForm, setBarbershopForm] = useState({
    name: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    timezone: "Atlantic/Azores",
  });
  const [brandingForm, setBrandingForm] = useState({
    instagram_url: "",
    facebook_url: "",
    background_image: null as File | null,
    logo: null as File | null,
  });
  const [barberForm, setBarberForm] = useState({ id: "", name: "", email: "", phone: "" });
  const [serviceForm, setServiceForm] = useState({ id: "", name: "", price: "", duration_minutes: "" });
  const [accountProfileForm, setAccountProfileForm] = useState({ email: "", phone: "" });
  const [accountPasswordForm, setAccountPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    id: "",
    barber_id: "",
    service_id: "",
    client_name: "",
    client_phone: "",
    client_email: "",
    starts_at: "",
    notes: "",
    status: "booked" as Appointment["status"],
  });

  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");
  }, []);

  const timezone = dayAgenda?.timezone ?? barbershop?.timezone ?? "Atlantic/Azores";
  const todayLabel = formatDateLabel(getTodayInAzores(), timezone);
  const isSuperAdmin = Boolean(user?.is_super_admin);
  const visibleTabs = useMemo(
    () => (isSuperAdmin ? [...tabs, { id: "admin" as TabId, label: "Admin global" }] : tabs),
    [isSuperAdmin]
  );

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return (dayAgenda?.appointments ?? []).filter((appointment) => new Date(appointment.starts_at) >= now).slice(0, 5);
  }, [dayAgenda]);

  const validDayAppointments = useMemo(
    () => (dayAgenda?.appointments ?? []).filter((appointment) => !["cancelled", "no_show"].includes(appointment.status)),
    [dayAgenda]
  );

  const topMetrics = useMemo(
    () => [
      { label: "Receita do dia", value: formatCurrency(statistics?.summary.revenue_today ?? dayAgenda?.summary.revenue ?? 0) },
      { label: "Marcações hoje", value: String(statistics?.summary.appointments_today ?? dayAgenda?.summary.total ?? 0) },
      { label: "Clientes", value: String(statistics?.summary.clients_total ?? dayAgenda?.summary.clients ?? 0) },
      { label: "Serviços usados", value: String(statistics?.summary.services_used?.length ?? 0) },
    ],
    [dayAgenda, statistics]
  );

  const clients = statistics?.clients ?? [];

  useEffect(() => {
    if (!token) {
      setUser(null);
      setBarbershop(null);
      setQrCode(null);
      setBarbers([]);
      setServices([]);
      setDayAgenda(null);
      setStatistics(null);
      setAdminPlatform(null);
      return;
    }

    void bootstrap(token, selectedDate);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadDayAgenda(token, selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (isSuperAdmin && !barbershop && activeTab === "overview") {
      setActiveTab("admin");
    }
  }, [isSuperAdmin, barbershop, activeTab]);

  async function apiRequest(path: string, init?: RequestInit) {
    const response = await fetch(apiUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    const payload = parseApiResponse(await response.text());
    return { response, payload };
  }

  async function bootstrap(currentToken: string, currentDate: string) {
    setIsLoading(true);

    try {
      const headers = { Accept: "application/json", Authorization: `Bearer ${currentToken}` };
      const [userResponse, barbershopResponse, qrResponse, barbersResponse, servicesResponse, agendaResponse, statisticsResponse] = await Promise.all([
        fetch(apiUrl("/user"), { headers }),
        fetch(apiUrl("/barbershop"), { headers }),
        fetch(apiUrl("/barbershop/qr-code"), { headers }),
        fetch(apiUrl("/barbers"), { headers }),
        fetch(apiUrl("/services"), { headers }),
        fetch(apiUrl(`/appointments/day?date=${currentDate}`), { headers }),
        fetch(apiUrl("/appointments/statistics"), { headers }),
      ]);

      const userPayload = parseApiResponse(await userResponse.text());
      const barbershopPayload = parseApiResponse(await barbershopResponse.text());
      const qrPayload = parseApiResponse(await qrResponse.text());
      const barbersPayload = parseApiResponse(await barbersResponse.text());
      const servicesPayload = parseApiResponse(await servicesResponse.text());
      const agendaPayload = parseApiResponse(await agendaResponse.text());
      const statisticsPayload = parseApiResponse(await statisticsResponse.text());

      if (!userResponse.ok) {
        setStatus({ kind: "error", title: "Sessão inválida", body: "Entra novamente para abrir o backoffice." });
        return;
      }

      const currentUser = userPayload?.user
        ? {
            ...userPayload.user,
            is_super_admin: Boolean(userPayload?.is_super_admin ?? userPayload.user?.is_super_admin),
            is_active: userPayload.user?.is_active ?? true,
          }
        : null;

      setUser(currentUser);
      setAccountProfileForm({
        email: userPayload?.user?.email ?? "",
        phone: userPayload?.user?.phone ?? "",
      });

      if (currentUser?.is_super_admin) {
        await loadAdminPlatform(currentToken);
      } else {
        setAdminPlatform(null);
      }

      if (barbershopResponse.status === 404 || agendaResponse.status === 404 || statisticsResponse.status === 404) {
        setBarbershop(null);
        setQrCode(null);
        setBarbers([]);
        setServices([]);
        setDayAgenda(null);
        setStatistics(null);
        setStatus({
          kind: "idle",
          title: "Ainda sem barbearia",
          body: "Cria primeiro a tua barbearia para desbloquear o resto do painel.",
        });
        return;
      }

      if (!barbershopResponse.ok || !barbersResponse.ok || !servicesResponse.ok || !agendaResponse.ok || !statisticsResponse.ok) {
        setStatus({ kind: "error", title: "Erro ao carregar o painel", body: "Não foi possível carregar todos os dados." });
        return;
      }

      const currentBarbershop = barbershopPayload?.barbershop ?? null;
      setBarbershop(currentBarbershop);
      setQrCode(qrResponse.ok ? qrPayload?.qr_code ?? null : null);
      setBarbers(barbersPayload?.barbers ?? []);
      setServices(servicesPayload?.services ?? []);
      setDayAgenda(agendaPayload ?? null);
      setStatistics(statisticsPayload ?? null);
      setBarbershopForm({
        name: currentBarbershop?.name ?? "",
        slug: currentBarbershop?.slug ?? "",
        phone: currentBarbershop?.phone ?? "",
        email: currentBarbershop?.email ?? "",
        address: currentBarbershop?.address ?? "",
        timezone: currentBarbershop?.timezone ?? "Atlantic/Azores",
      });
      setBrandingForm({
        instagram_url: currentBarbershop?.instagram_url ?? "",
        facebook_url: currentBarbershop?.facebook_url ?? "",
        background_image: null,
        logo: null,
      });
      setStatus({ kind: "success", title: "Painel carregado", body: "Os dados principais da tua barbearia já estão prontos." });
    } catch {
      setStatus({ kind: "error", title: "Falha de ligação", body: "Não foi possível carregar os dados neste momento. Tenta novamente dentro de instantes." });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDayAgenda(currentToken: string, currentDate: string) {
    const response = await fetch(apiUrl(`/appointments/day?date=${currentDate}`), {
      headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
    });
    const payload = parseApiResponse(await response.text());

    if (response.ok) {
      setDayAgenda(payload);
    }
  }

  async function loadStatistics(currentToken = token) {
    if (!currentToken) return null;

    const response = await fetch(apiUrl("/appointments/statistics"), {
      headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
    });
    const payload = parseApiResponse(await response.text());

    if (response.ok) {
      setStatistics(payload);
      return payload;
    }

    return null;
  }

  async function loadQrCode(currentToken = token) {
    if (!currentToken) return null;

    setIsQrLoading(true);
    try {
      const response = await fetch(apiUrl("/barbershop/qr-code"), {
        headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
      });
      const payload = parseApiResponse(await response.text());

      if (!response.ok) {
        setQrCode(null);
        return null;
      }

      setQrCode(payload?.qr_code ?? null);
      return payload?.qr_code ?? null;
    } finally {
      setIsQrLoading(false);
    }
  }

  async function loadAdminPlatform(currentToken = token) {
    if (!currentToken) return null;

    setIsAdminLoading(true);
    try {
      const response = await fetch(apiUrl("/admin/platform"), {
        headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
      });
      const payload = parseApiResponse(await response.text());

      if (!response.ok) {
        setAdminPlatform(null);
        setStatus({
          kind: "error",
          title: "Erro no painel admin",
          body: friendlyApiError(payload, "Não foi possível carregar a administração global."),
        });
        return null;
      }

      setAdminPlatform(payload);
      return payload;
    } finally {
      setIsAdminLoading(false);
    }
  }

  async function handleToggleUserStatus(adminUser: AdminUser) {
    const { response, payload } = await apiRequest(`/admin/users/${adminUser.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !adminUser.is_active }),
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao atualizar conta",
        body: friendlyApiError(payload, "Não foi possível alterar o estado da conta.", ["is_active"]),
      });
      return;
    }

    await loadAdminPlatform();
    setStatus({
      kind: "success",
      title: adminUser.is_active ? "Conta desativada" : "Conta ativada",
      body: "O estado da conta foi atualizado com sucesso.",
    });
  }

  async function handleToggleBarbershopStatus(adminBarbershop: AdminBarbershop) {
    const { response, payload } = await apiRequest(`/admin/barbershops/${adminBarbershop.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !adminBarbershop.is_active }),
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao atualizar barbearia",
        body: friendlyApiError(payload, "Não foi possível alterar o estado da barbearia."),
      });
      return;
    }

    await loadAdminPlatform();
    setStatus({
      kind: "success",
      title: adminBarbershop.is_active ? "Barbearia desativada" : "Barbearia ativada",
      body: "O estado da barbearia foi atualizado com sucesso.",
    });
  }

  function showQrFeedback(message: string) {
    setQrActionFeedback(message);
    window.setTimeout(() => setQrActionFeedback(""), 3200);
  }

  async function refreshBarbers() {
    const response = await fetch(apiUrl("/barbers"), {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const payload = parseApiResponse(await response.text());
    if (response.ok) {
      setBarbers(payload?.barbers ?? []);
    }
  }

  async function refreshServices() {
    const response = await fetch(apiUrl("/services"), {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const payload = parseApiResponse(await response.text());
    if (response.ok) {
      setServices(payload?.services ?? []);
    }
  }

  async function handleLogout() {
    if (!token) return;

    setIsLoggingOut(true);
    try {
      await fetch(apiUrl("/logout"), {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
    } finally {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY);
      window.sessionStorage.clear();
      setToken("");
      setIsLoggingOut(false);
      window.location.href = "/login";
    }
  }

  async function handleAccountProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { response, payload } = await apiRequest("/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: accountProfileForm.email,
        phone: accountProfileForm.phone || null,
      }),
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao atualizar a conta",
        body: friendlyApiError(payload, "Não foi possível atualizar o e-mail e o telemóvel.", ["email", "phone"]),
      });
      return;
    }

    setUser(payload?.user ? { ...payload.user, is_super_admin: user?.is_super_admin ?? false } : null);
    setAccountProfileForm({
      email: payload?.user?.email ?? "",
      phone: payload?.user?.phone ?? "",
    });
    setStatus({
      kind: "success",
      title: "Dados da conta atualizados",
      body: "O e-mail e o telemóvel foram atualizados com sucesso.",
    });
  }

  async function handleAccountPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { response, payload } = await apiRequest("/account/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountPasswordForm),
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao atualizar a palavra-passe",
        body: friendlyApiError(payload, "Não foi possível atualizar a palavra-passe.", ["current_password", "password", "password_confirmation"]),
      });
      return;
    }

    setAccountPasswordForm({
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    setStatus({
      kind: "success",
      title: "Palavra-passe atualizada",
      body: "A tua palavra-passe foi atualizada com sucesso.",
    });
  }

  async function handleBarbershopSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { response, payload } = await apiRequest("/barbershop", {
      method: barbershop ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: barbershopForm.name,
        slug: barbershopForm.slug || undefined,
        phone: barbershopForm.phone || null,
        email: barbershopForm.email || null,
        address: barbershopForm.address || null,
        timezone: barbershopForm.timezone || "Atlantic/Azores",
      }),
    });

    if (!response.ok) {
      setStatus({ kind: "error", title: "Erro ao guardar a barbearia", body: friendlyApiError(payload, "Não foi possível guardar a barbearia.", ["name", "slug", "email", "phone", "address"]) });
      return;
    }

    setBarbershop(payload.barbershop);
    setBarbershopForm({
      name: payload.barbershop.name ?? "",
      slug: payload.barbershop.slug ?? "",
      phone: payload.barbershop.phone ?? "",
      email: payload.barbershop.email ?? "",
      address: payload.barbershop.address ?? "",
      timezone: payload.barbershop.timezone ?? "Atlantic/Azores",
    });
    setBrandingForm({
      instagram_url: payload.barbershop.instagram_url ?? "",
      facebook_url: payload.barbershop.facebook_url ?? "",
      background_image: null,
      logo: null,
    });
    await loadQrCode();
    setStatus({ kind: "success", title: "Barbearia guardada", body: "Os dados da barbearia foram atualizados com sucesso." });
  }

  async function handleBrandingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!barbershop) {
      setStatus({ kind: "error", title: "Barbearia em falta", body: "Cria primeiro a barbearia antes de personalizar a página pública." });
      return;
    }

    setIsBrandingSaving(true);
    try {
      const formData = new FormData();
      formData.append("instagram_url", brandingForm.instagram_url);
      formData.append("facebook_url", brandingForm.facebook_url);

      if (brandingForm.background_image) {
        formData.append("background_image", brandingForm.background_image);
      }

      if (brandingForm.logo) {
        formData.append("logo", brandingForm.logo);
      }

      const { response, payload } = await apiRequest("/barbershop/branding", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao guardar personalização",
          body: friendlyApiError(payload, "Não foi possível guardar a personalização.", ["background_image", "logo", "instagram_url", "facebook_url"]),
        });
        return;
      }

      setBarbershop(payload.barbershop);
      setBrandingForm({
        instagram_url: payload.barbershop.instagram_url ?? "",
        facebook_url: payload.barbershop.facebook_url ?? "",
        background_image: null,
        logo: null,
      });
      setStatus({ kind: "success", title: "Personalização guardada", body: "A página pública já reflete a imagem e as redes sociais da barbearia." });
    } finally {
      setIsBrandingSaving(false);
    }
  }

  async function handleExportAgenda() {
    if (!token) return;

    setIsExportingAgenda(true);
    try {
      const response = await fetch(apiUrl(`/appointments/export?date=${selectedDate}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const payload = parseApiResponse(await response.text());
        setStatus({ kind: "error", title: "Erro ao exportar agenda", body: friendlyApiError(payload, "Não foi possível exportar a agenda.") });
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barberbook-agenda-${barbershop?.slug ?? "barbearia"}-${selectedDate}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus({ kind: "success", title: "Agenda exportada", body: "O ficheiro Excel foi descarregado com sucesso." });
    } finally {
      setIsExportingAgenda(false);
    }
  }

  async function handleRegenerateQrCode() {
    setIsQrRegenerating(true);
    try {
      const { response, payload } = await apiRequest("/barbershop/qr-code/regenerate", {
        method: "POST",
      });

      if (!response.ok) {
        setStatus({ kind: "error", title: "Erro ao gerar QR Code", body: friendlyApiError(payload, "Não foi possível gerar o QR Code.") });
        return;
      }

      setQrCode(payload?.qr_code ?? null);
      showQrFeedback("QR Code regenerado com sucesso.");
      setStatus({ kind: "success", title: "QR Code atualizado", body: "O QR Code da barbearia está pronto para partilha." });
    } finally {
      setIsQrRegenerating(false);
    }
  }

  async function handleCopyQrLink(publicLink: string) {
    await navigator.clipboard.writeText(publicLink);
    showQrFeedback("Link copiado para a área de transferência.");
    setStatus({ kind: "success", title: "Link copiado", body: "O link público da barbearia foi copiado." });
  }

  async function handleDownloadQrPng() {
    if (!qrCode?.qr_data_uri || typeof window === "undefined") return;

    setIsQrDownloading(true);
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 1200;
        const context = canvas.getContext("2d");

        if (!context) {
          setIsQrDownloading(false);
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 120, 120, 960, 960);
        canvas.toBlob((blob) => {
          if (!blob) {
            setIsQrDownloading(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `barberbook-qr-${barbershop?.slug ?? "barbearia"}.png`;
          link.click();
          URL.revokeObjectURL(url);
          showQrFeedback("PNG descarregado com sucesso.");
          setIsQrDownloading(false);
        }, "image/png");
      };
      image.onerror = () => {
        setIsQrDownloading(false);
        setStatus({ kind: "error", title: "Erro ao descarregar", body: "Não foi possível preparar o PNG do QR Code." });
      };
      image.src = qrCode.qr_data_uri;
    } catch {
      setIsQrDownloading(false);
      setStatus({ kind: "error", title: "Erro ao descarregar", body: "Não foi possível preparar o PNG do QR Code." });
    }
  }

  function handlePrintQrCode(publicLink: string) {
    if (!qrCode?.qr_data_uri || typeof window === "undefined") return;

    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      setStatus({ kind: "error", title: "Impressão bloqueada", body: "Permite pop-ups no navegador para imprimir o QR Code." });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code ${escapeHtml(barbershop?.name ?? "BarberBook")}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 48px; color: #111; text-align: center; }
            .card { border: 1px solid #ddd; border-radius: 24px; padding: 40px; max-width: 520px; margin: 0 auto; }
            img { width: 320px; height: 320px; }
            h1 { margin: 24px 0 8px; font-size: 28px; }
            p { margin: 8px 0; color: #555; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${qrCode.qr_data_uri}" alt="QR Code da barbearia" />
            <h1>${escapeHtml(barbershop?.name ?? "BarberBook")}</h1>
            <p>Marca a tua visita através deste QR Code.</p>
            <p>${escapeHtml(publicLink)}</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showQrFeedback("Janela de impressão aberta.");
  }

  async function handleBarberSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { response, payload } = await apiRequest(barberForm.id ? `/barbers/${barberForm.id}` : "/barbers", {
      method: barberForm.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: barberForm.name,
        email: barberForm.email || null,
        phone: barberForm.phone || null,
      }),
    });

    if (!response.ok) {
      setStatus({ kind: "error", title: "Erro ao guardar o barbeiro", body: friendlyApiError(payload, "Não foi possível guardar o barbeiro.", ["name", "email", "phone"]) });
      return;
    }

    setBarberForm({ id: "", name: "", email: "", phone: "" });
    await refreshBarbers();
    setStatus({ kind: "success", title: "Barbeiro guardado", body: "Os dados do barbeiro foram atualizados com sucesso." });
  }

  async function handleBarberPhotoUpload(barberId: number, file?: File | null) {
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    setUploadingBarberPhotoId(barberId);

    try {
      const { response, payload } = await apiRequest(`/barbers/${barberId}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao guardar a foto",
          body: friendlyApiError(payload, "Não foi possível atualizar a foto do barbeiro.", ["photo"]),
        });
        return;
      }

      await refreshBarbers();
      setStatus({ kind: "success", title: "Foto atualizada", body: "A foto do barbeiro já aparece no link público." });
    } finally {
      setUploadingBarberPhotoId(null);
    }
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { response, payload } = await apiRequest(serviceForm.id ? `/services/${serviceForm.id}` : "/services", {
      method: serviceForm.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: serviceForm.name,
        price: serviceForm.price,
        duration_minutes: Number(serviceForm.duration_minutes),
      }),
    });

    if (!response.ok) {
      setStatus({ kind: "error", title: "Erro ao guardar o serviço", body: friendlyApiError(payload, "Não foi possível guardar o serviço.", ["name", "price", "duration_minutes"]) });
      return;
    }

    setServiceForm({ id: "", name: "", price: "", duration_minutes: "" });
    await refreshServices();
      setStatus({ kind: "success", title: "Serviço guardado", body: "Os dados do serviço foram atualizados com sucesso." });
  }

  async function handleAppointmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { response, payload } = await apiRequest(appointmentForm.id ? `/appointments/${appointmentForm.id}` : "/appointments", {
      method: appointmentForm.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barber_id: Number(appointmentForm.barber_id),
        service_id: Number(appointmentForm.service_id),
        client_name: appointmentForm.client_name,
        client_phone: appointmentForm.client_phone,
        client_email: appointmentForm.client_email || null,
        starts_at: appointmentForm.starts_at,
        notes: appointmentForm.notes || null,
        status: appointmentForm.status,
      }),
    });

    const conflict =
      payload?.errors?.starts_at?.[0] === "Este horário já não está disponível" ||
      payload?.message === "Este horário já não está disponível";

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao guardar agendamento",
        body: conflict ? "Este horário acabou de ficar indisponível. Escolhe outro." : friendlyApiError(payload, "Não foi possível guardar o agendamento.", ["barber_id", "service_id", "client_name", "client_phone", "client_email", "starts_at", "status"]),
      });
      return;
    }

    setAppointmentForm({
      id: "",
      barber_id: "",
      service_id: "",
      client_name: "",
      client_phone: "",
      client_email: "",
      starts_at: "",
      notes: "",
      status: "booked",
    });
    await loadDayAgenda(token, selectedDate);
    await loadStatistics();
    setStatus({ kind: "success", title: "Agendamento guardado", body: "A agenda foi atualizada com sucesso." });
  }

  async function handleDeleteBarber(id: number) {
    const { response, payload } = await apiRequest(`/barbers/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ kind: "error", title: "Erro ao apagar o barbeiro", body: friendlyApiError(payload, "Não foi possível remover o barbeiro.") });
      return;
    }

    await refreshBarbers();
    setStatus({ kind: "success", title: "Barbeiro removido", body: "O barbeiro foi removido com sucesso." });
  }

  async function handleDeleteService(id: number) {
    const { response, payload } = await apiRequest(`/services/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ kind: "error", title: "Erro ao apagar o serviço", body: friendlyApiError(payload, "Não foi possível remover o serviço.") });
      return;
    }

    await refreshServices();
      setStatus({ kind: "success", title: "Serviço removido", body: "O serviço foi removido com sucesso." });
  }

  async function handleDeleteAppointment(id: number) {
    const { response, payload } = await apiRequest(`/appointments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ kind: "error", title: "Erro ao apagar o agendamento", body: friendlyApiError(payload, "Não foi possível remover o agendamento.") });
      return;
    }

    await loadDayAgenda(token, selectedDate);
    await loadStatistics();
    setStatus({ kind: "success", title: "Agendamento removido", body: "O agendamento foi removido com sucesso." });
  }

  function renderOverview() {
    if (!barbershop) {
      return (
        <div className="rounded-[28px] border border-dashed border-black/10 bg-[#fff8f1] p-6 text-sm text-black/65">
          Ainda não tens nenhuma barbearia criada. Vai ao separador <strong>Barbearia</strong> para começar.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Marcações válidas", value: validDayAppointments.length },
            { label: "Faturação hoje", value: formatCurrency(dayAgenda?.summary.revenue ?? 0) },
            { label: "Clientes hoje", value: dayAgenda?.summary.clients ?? 0 },
            { label: "Canceladas", value: dayAgenda?.summary.cancelled ?? 0 },
          ].map((metric) => (
            <article key={metric.label} className={`${whiteCardClass} rounded-2xl p-6`}>
              <p className="text-sm text-[#5B4F3A]/75">{metric.label}</p>
              <p className="mt-3 text-4xl font-semibold text-[#2B2118]">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className={`${whiteCardClass} rounded-2xl p-6`}>
            <p className="text-sm text-[#5B4F3A]/75">Resumo da unidade</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">{barbershop.name}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F8E8D3] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">Barbeiros ativos</p>
                <p className="mt-2 text-2xl font-medium text-[#2B2118]">{barbers.length}</p>
              </div>
              <div className="rounded-2xl bg-[#F8E8D3] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">Serviços ativos</p>
                <p className="mt-2 text-2xl font-medium text-[#2B2118]">{services.length}</p>
              </div>
            </div>
          </article>

          <article className={`${whiteCardClass} rounded-2xl p-6`}>
            <p className="text-sm text-[#5B4F3A]/75">Próximas marcações</p>
            <div className="mt-4 space-y-3">
              {upcomingAppointments.length === 0 ? (
                <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#D8C3A5]/70 bg-[#F8E8D3] px-4 py-5 text-sm text-[#5B4F3A]/75">
                  <IconEmpty />
                  <div>
                    <p className="font-medium text-[#2B2118]">Sem próximas marcações</p>
                    <p className="mt-1">Não há atendimentos futuros para esta data.</p>
                  </div>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
                    <p className="font-medium text-[#2B2118]">{appointment.client_name}</p>
                    <p className="mt-1 text-sm text-[#5B4F3A]/75">
                      {formatTime(appointment.starts_at)} · {appointment.service?.name ?? "Serviço"}
                    </p>
                    <p className="mt-1 text-sm text-[#5B4F3A]/75">{appointment.barber?.name ?? "Barbeiro"}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderBarbershop() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form className={`${whiteCardClass} rounded-2xl p-8`} onSubmit={handleBarbershopSubmit}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#2B2118]">{barbershop ? "Atualizar barbearia" : "Criar barbearia"}</h2>
            <p className="mt-2 text-sm text-[#5B4F3A]/75">Ajusta os dados principais da tua unidade sem sair do painel.</p>
          </div>
          <div className="mt-5 grid gap-4">
            <input className={inputClass} placeholder="Nome" value={barbershopForm.name} onChange={(event) => setBarbershopForm((current) => ({ ...current, name: event.target.value }))} />
            <input className={inputClass} placeholder="Slug" value={barbershopForm.slug} onChange={(event) => setBarbershopForm((current) => ({ ...current, slug: event.target.value }))} />
            <input className={inputClass} placeholder="Telefone" value={barbershopForm.phone} onChange={(event) => setBarbershopForm((current) => ({ ...current, phone: event.target.value }))} />
            <input className={inputClass} placeholder="E-mail" value={barbershopForm.email} onChange={(event) => setBarbershopForm((current) => ({ ...current, email: event.target.value }))} />
            <input className={inputClass} placeholder="Morada" value={barbershopForm.address} onChange={(event) => setBarbershopForm((current) => ({ ...current, address: event.target.value }))} />
            <input className={inputClass} placeholder="Timezone" value={barbershopForm.timezone} onChange={(event) => setBarbershopForm((current) => ({ ...current, timezone: event.target.value }))} />
          </div>
          <button type="submit" className={`mt-6 ${primaryButtonClass}`}>
            {barbershop ? "Atualizar barbearia" : "Criar barbearia"}
          </button>
        </form>

        <article className={`${whiteCardClass} rounded-2xl p-8`}>
          <p className="text-sm text-[#5B4F3A]/75">Resumo da barbearia</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#F8E8D3] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">Nome</p>
              <p className="mt-2 text-base font-medium text-[#2B2118]">{barbershop?.name ?? "Ainda sem barbearia"}</p>
            </div>
            <div className="rounded-2xl bg-[#F8E8D3] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">Slug</p>
              <p className="mt-2 text-base font-medium text-[#2B2118]">{barbershop?.slug ?? "-"}</p>
            </div>
            <div className="rounded-2xl bg-[#F8E8D3] p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">Morada</p>
              <p className="mt-2 text-base font-medium text-[#2B2118]">{barbershop?.address ?? "Sem morada definida"}</p>
            </div>
          </div>
        </article>

        <article className={`${whiteCardClass} rounded-2xl p-8 xl:col-span-2`}>
          <p className="text-sm text-[#5B4F3A]/75">Personalização pública</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">Imagem, logo e redes sociais</h2>
          <p className="mt-2 text-sm leading-6 text-[#5B4F3A]/75">
            Usa o separador <strong>Personalização</strong> para carregar as fotos, logo e redes sociais da tua página pública.
          </p>
          <button type="button" onClick={() => setActiveTab("branding")} className={`mt-5 ${primaryButtonClass}`}>
            Abrir personalização
          </button>
        </article>
      </div>
    );
  }

  function renderBranding() {
    return (
      <form className={`${whiteCardClass} rounded-2xl p-8`} onSubmit={handleBrandingSubmit}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm text-[#5B4F3A]/75">Personalização pública</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">Fotos, logo e redes sociais</h2>
            <p className="mt-2 text-sm leading-6 text-[#5B4F3A]/75">
              Estes dados aparecem automaticamente no link público da tua barbearia.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3]">
              {barbershop?.background_image_url || barbershop?.image_url ? (
                <img src={barbershop.background_image_url ?? barbershop.image_url ?? ""} alt="Imagem de fundo atual da barbearia" className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-[#5B4F3A]/75">
                  Ainda sem imagem de fundo. Carrega uma fotografia da fachada, interior ou equipa.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#FFF7EC] bg-[#A86840] text-xl font-bold text-[#FFF7EC]">
                {barbershop?.logo_url ? (
                  <img src={barbershop.logo_url} alt="Logo atual da barbearia" className="h-full w-full object-cover" />
                ) : (
                  <span>{(barbershop?.name ?? "BB").slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2B2118]">Logo da barbearia</p>
                <p className="mt-1 text-sm leading-6 text-[#5B4F3A]/75">
                  Este logo aparece no círculo da página pública. Se não existir, mostramos as iniciais.
                </p>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-5">
            <label className="grid gap-2 rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
              <span className="text-sm font-semibold text-[#2B2118]">Selecionar imagem de fundo</span>
              <input
                className={inputClass}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setBrandingForm((current) => ({ ...current, background_image: event.target.files?.[0] ?? null }))}
              />
              <span className="text-xs text-[#5B4F3A]/70">JPG, PNG ou WebP até 4 MB.</span>
            </label>

            <label className="grid gap-2 rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
              <span className="text-sm font-semibold text-[#2B2118]">Selecionar logo</span>
              <input
                className={inputClass}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setBrandingForm((current) => ({ ...current, logo: event.target.files?.[0] ?? null }))}
              />
              <span className="text-xs text-[#5B4F3A]/70">JPG, PNG ou WebP até 2 MB.</span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#2B2118]">Instagram</span>
              <input
                className={inputClass}
                placeholder="https://instagram.com/a_tua_barbearia"
                value={brandingForm.instagram_url}
                onChange={(event) => setBrandingForm((current) => ({ ...current, instagram_url: event.target.value }))}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#2B2118]">Facebook</span>
              <input
                className={inputClass}
                placeholder="https://facebook.com/a_tua_barbearia"
                value={brandingForm.facebook_url}
                onChange={(event) => setBrandingForm((current) => ({ ...current, facebook_url: event.target.value }))}
              />
            </label>

            <button type="submit" disabled={!barbershop || isBrandingSaving} className={primaryButtonClass}>
              {isBrandingSaving ? "A guardar..." : "Guardar personalização"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  function renderBarbers() {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className={`${whiteCardClass} rounded-2xl p-8`} onSubmit={handleBarberSubmit}>
          <h2 className="text-2xl font-semibold text-[#2B2118]">{barberForm.id ? "Editar barbeiro" : "Criar barbeiro"}</h2>
          <p className="mt-2 text-sm text-[#5B4F3A]/75">Adiciona ou atualiza elementos da equipa.</p>
          <div className="mt-5 grid gap-4">
            <input className={inputClass} placeholder="Nome" value={barberForm.name} onChange={(event) => setBarberForm((current) => ({ ...current, name: event.target.value }))} />
            <input className={inputClass} placeholder="E-mail" value={barberForm.email} onChange={(event) => setBarberForm((current) => ({ ...current, email: event.target.value }))} />
            <input className={inputClass} placeholder="Telefone" value={barberForm.phone} onChange={(event) => setBarberForm((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className={primaryButtonClass}>
              {barberForm.id ? "Atualizar barbeiro" : "Criar barbeiro"}
            </button>
            {barberForm.id ? (
              <button type="button" onClick={() => setBarberForm({ id: "", name: "", email: "", phone: "" })} className={secondaryButtonClass}>
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>

        <article className={`${whiteCardClass} rounded-2xl p-8`}>
          <h2 className="text-2xl font-semibold text-[#2B2118]">Barbeiros</h2>
          <div className="mt-5 space-y-3">
            {barbers.length === 0 ? (
              <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#D8C3A5]/70 bg-[#F8E8D3] px-4 py-5 text-sm text-[#5B4F3A]/75"><IconEmpty /><div><p className="font-medium text-[#2B2118]">Ainda sem barbeiros</p><p className="mt-1">Cria o primeiro profissional para começar a gerir a agenda.</p></div></div>
            ) : (
              barbers.map((barber) => (
                <div key={barber.id} className="rounded-2xl border border-[#D8C3A5]/70 p-4 transition-all hover:border-[#D8C3A5]/70 hover:shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A86840] text-lg font-semibold text-[#FFF7EC]">
                      {barber.photo_url ? (
                        <img src={barber.photo_url} alt={`Foto de ${barber.name}`} className="h-full w-full object-cover" />
                      ) : (
                        barber.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#2B2118]">{barber.name}</p>
                      <p className="mt-1 text-sm text-[#5B4F3A]/75">{barber.email || "Sem e-mail"}</p>
                      <p className="mt-1 text-sm text-[#5B4F3A]/75">{barber.phone || "Sem telefone"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setBarberForm({ id: String(barber.id), name: barber.name, email: barber.email ?? "", phone: barber.phone ?? "" })} className={ghostButtonClass}>
                      Editar
                    </button>
                    <label className={`${ghostButtonClass} cursor-pointer`}>
                      {uploadingBarberPhotoId === barber.id ? "A carregar..." : "Carregar foto"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingBarberPhotoId === barber.id}
                        onChange={(event) => void handleBarberPhotoUpload(barber.id, event.target.files?.[0])}
                      />
                    </label>
                    <button type="button" onClick={() => void handleDeleteBarber(barber.id)} className={ghostButtonClass}>
                      Apagar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    );
  }

  function renderServices() {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className={`${whiteCardClass} rounded-2xl p-8`} onSubmit={handleServiceSubmit}>
          <h2 className="text-2xl font-semibold text-[#2B2118]">{serviceForm.id ? "Editar serviço" : "Criar serviço"}</h2>
          <p className="mt-2 text-sm text-[#5B4F3A]/75">Define o catálogo e o tempo de atendimento de cada serviço.</p>
          <div className="mt-5 grid gap-4">
            <input className={inputClass} placeholder="Nome" value={serviceForm.name} onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))} />
            <input className={inputClass} placeholder="Preço" value={serviceForm.price} onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))} />
            <input className={inputClass} placeholder="Duração em minutos" value={serviceForm.duration_minutes} onChange={(event) => setServiceForm((current) => ({ ...current, duration_minutes: event.target.value }))} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className={primaryButtonClass}>
              {serviceForm.id ? "Atualizar serviço" : "Criar serviço"}
            </button>
            {serviceForm.id ? (
              <button type="button" onClick={() => setServiceForm({ id: "", name: "", price: "", duration_minutes: "" })} className={secondaryButtonClass}>
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>

        <article className={`${whiteCardClass} rounded-2xl p-8`}>
          <h2 className="text-2xl font-semibold text-[#2B2118]">Serviços</h2>
          <div className="mt-5 space-y-3">
            {services.length === 0 ? (
              <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#D8C3A5]/70 bg-[#F8E8D3] px-4 py-5 text-sm text-[#5B4F3A]/75"><IconEmpty /><div><p className="font-medium text-[#2B2118]">Ainda sem serviços</p><p className="mt-1">Adiciona o primeiro serviço para abrir marcações online.</p></div></div>
            ) : (
              services.map((service) => (
                <div key={service.id} className="rounded-2xl border border-[#D8C3A5]/70 p-4 transition-all hover:border-[#D8C3A5]/70 hover:shadow-sm">
                  <p className="font-medium text-[#2B2118]">{service.name}</p>
                  <p className="mt-1 text-sm text-[#5B4F3A]/75">Preço: {service.price} EUR</p>
                  <p className="mt-1 text-sm text-[#5B4F3A]/75">Duração: {service.duration_minutes} minutos</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setServiceForm({ id: String(service.id), name: service.name, price: String(service.price), duration_minutes: String(service.duration_minutes) })} className={ghostButtonClass}>
                      Editar
                    </button>
                    <button type="button" onClick={() => void handleDeleteService(service.id)} className={ghostButtonClass}>
                      Apagar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    );
  }

  function renderAgenda() {
    const appointments = dayAgenda?.appointments ?? [];
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    const calendarBarbers = barbers.length > 0 ? barbers : [{ id: 0, name: "Agenda", email: null, phone: null } satisfies Barber];

    return (
      <div className="space-y-6">
        <article className={`${whiteCardClass} rounded-2xl p-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-[#5B4F3A]/75">Agenda</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">{dayAgenda ? formatDayTitle(dayAgenda.date, timezone) : "Seleciona uma data"}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className={inputClass} />
              <button type="button" onClick={() => void loadDayAgenda(token, selectedDate)} className={secondaryButtonClass}>
                Atualizar agenda
              </button>
              <button type="button" onClick={handleExportAgenda} disabled={isExportingAgenda} className={primaryButtonClass}>
                {isExportingAgenda ? "A exportar..." : "Exportar agenda"}
              </button>
            </div>
          </div>
        </article>

        <article className={`${whiteCardClass} overflow-hidden rounded-2xl`}>
          <div className="flex flex-col gap-3 border-b border-[#D8C3A5]/70 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A86840]">Calendário diário</p>
              <h3 className="mt-1 text-2xl font-black text-[#2B2118]">Marcações por horário e barbeiro</h3>
            </div>
            <p className="text-sm font-medium text-[#5B4F3A]/80">
              {appointments.length === 0 ? "Sem marcações neste dia." : `${appointments.length} marcações neste dia.`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid min-w-[860px]"
              style={{ gridTemplateColumns: `92px repeat(${calendarBarbers.length}, minmax(220px, 1fr))` }}
            >
              <div className="sticky left-0 z-10 border-b border-r border-[#D8C3A5]/70 bg-[#F8E8D3] p-3 text-xs font-black uppercase tracking-[0.16em] text-[#5B4F3A]">
                Hora
              </div>
              {calendarBarbers.map((barber) => (
                <div key={barber.id} className="border-b border-r border-[#D8C3A5]/70 bg-[#F8E8D3] p-3">
                  <p className="text-base font-black text-[#2B2118]">{barber.name}</p>
                </div>
              ))}

              {DAY_SLOTS.map((slot) => (
                <div key={slot} className="contents">
                  <div key={`${slot}-time`} className="sticky left-0 z-10 flex min-h-[92px] items-start border-b border-r border-[#D8C3A5]/70 bg-[#FFF7EC] p-3">
                    <p className="text-base font-black text-[#2B2118]">{slot}</p>
                  </div>

                  {calendarBarbers.map((barber) => {
                    const appointment = appointments.find((item) => {
                      const sameBarber = barber.id === 0 || item.barber_id === barber.id;
                      return sameBarber && slotIsCovered(item, slot);
                    });

                    return (
                      <div key={`${slot}-${barber.id}`} className="min-h-[92px] border-b border-r border-[#D8C3A5]/70 bg-[#FFF7EC] p-2">
                        {appointment ? (
                          <button
                            type="button"
                            onClick={() => setAppointmentForm({ id: String(appointment.id), barber_id: String(appointment.barber_id), service_id: String(appointment.service_id), client_name: appointment.client_name, client_phone: appointment.client_phone, client_email: appointment.client_email ?? "", starts_at: toDatetimeLocal(appointment.starts_at), notes: appointment.notes ?? "", status: appointment.status })}
                            className="h-full w-full rounded-2xl border border-[#A86840]/25 bg-[#F8E8D3] p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#A86840]/60 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-black text-[#2B2118]">{formatTime(appointment.starts_at)}</p>
                              <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${statusBadge(appointment.status)}`}>
                                {statusLabel(appointment.status)}
                              </span>
                            </div>
                            <p className="mt-2 text-base font-black text-[#2B2118]">{appointment.client_name}</p>
                            <p className="mt-1 text-sm font-semibold text-[#5B4F3A]">{appointment.service?.name ?? "Serviço"}</p>
                            <p className="mt-1 text-xs font-medium text-[#5B4F3A]/75">{appointment.client_phone}</p>
                          </button>
                        ) : (
                          <div className="flex h-full min-h-[74px] items-center justify-center rounded-2xl border border-dashed border-[#D8C3A5]/70 bg-[#FFF7EC] text-xs font-bold text-[#5B4F3A]/45">
                            Livre
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </article>

        <div className="grid gap-6">
          <form className={`${whiteCardClass} rounded-2xl p-8`} onSubmit={handleAppointmentSubmit}>
            <h3 className="text-2xl font-semibold text-[#2B2118]">{appointmentForm.id ? "Editar agendamento" : "Criar agendamento"}</h3>
            <p className="mt-2 text-sm text-[#5B4F3A]/75">Agenda manual para a equipa quando o cliente marca diretamente com a barbearia.</p>
            <div className="mt-5 grid gap-3">
              <select className={inputClass} value={appointmentForm.barber_id} onChange={(event) => setAppointmentForm((current) => ({ ...current, barber_id: event.target.value }))}>
                <option value="">Selecionar barbeiro</option>
                {barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
              </select>
              <select className={inputClass} value={appointmentForm.service_id} onChange={(event) => setAppointmentForm((current) => ({ ...current, service_id: event.target.value }))}>
                <option value="">Selecionar serviço</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name} ({service.duration_minutes} min)</option>)}
              </select>
              <input className={inputClass} placeholder="Nome do cliente" value={appointmentForm.client_name} onChange={(event) => setAppointmentForm((current) => ({ ...current, client_name: event.target.value }))} />
              <input className={inputClass} placeholder="Telefone do cliente" value={appointmentForm.client_phone} onChange={(event) => setAppointmentForm((current) => ({ ...current, client_phone: event.target.value }))} />
              <input className={inputClass} placeholder="E-mail do cliente" value={appointmentForm.client_email} onChange={(event) => setAppointmentForm((current) => ({ ...current, client_email: event.target.value }))} />
              <input className={inputClass} type="datetime-local" value={appointmentForm.starts_at} onChange={(event) => setAppointmentForm((current) => ({ ...current, starts_at: event.target.value }))} />
              <textarea className={`${inputClass} min-h-24`} placeholder="Notas" value={appointmentForm.notes} onChange={(event) => setAppointmentForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className={primaryButtonClass}>
                {appointmentForm.id ? "Atualizar agendamento" : "Criar agendamento"}
              </button>
              {appointmentForm.id ? (
                <button type="button" onClick={() => setAppointmentForm({ id: "", barber_id: "", service_id: "", client_name: "", client_phone: "", client_email: "", starts_at: "", notes: "", status: "booked" })} className={secondaryButtonClass}>
                  Cancelar edicao
                </button>
              ) : null}
            </div>
          </form>

          <div className="hidden">
            <article className={`${whiteCardClass} rounded-2xl p-8`}>
              <p className="text-sm text-[#5B4F3A]/75">Agenda visual</p>
              <div className="mt-5 grid gap-2">
                {DAY_SLOTS.map((slot) => {
                  const appointment = (dayAgenda?.appointments ?? []).find((item) => slotIsCovered(item, slot));
                  return (
                    <div key={slot} className={`rounded-xl border px-3 py-3 ${appointment ? "border-[#D8C3A5]/70 bg-[#F8E8D3] shadow-sm" : "border-dashed border-[#D8C3A5]/70 bg-[#FFF7EC]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[#2B2118]">{slot}</p>
                        {!appointment ? (
                          <span className="rounded-full border border-[#D8C3A5]/70 bg-[#F8E8D3] px-2.5 py-1 text-[11px] font-medium text-[#5B4F3A]/75">
                            Livre
                          </span>
                        ) : null}
                      </div>
                      {appointment ? (
                        <>
                          <div className="mt-3 rounded-xl bg-[#FFF7EC] p-3 ring-1 ring-neutral-200">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[#2B2118]">{slot}</p>
                                <p className="mt-1 font-medium text-[#2B2118]">{appointment.client_name}</p>
                              </div>
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[#5B4F3A]/75">{appointment.service?.name ?? "Serviço"}</p>
                            <p className="mt-1 text-sm text-[#5B4F3A]/75">{appointment.barber?.name ?? "Barbeiro"}</p>
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-[#5B4F3A]/75">Disponível para marcação.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>

            <article className={`${whiteCardClass} rounded-2xl p-8`}>
              <p className="text-sm text-[#5B4F3A]/75">Lista por hora</p>
              <div className="mt-5 space-y-3">
                {(dayAgenda?.appointments ?? []).length === 0 ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#D8C3A5]/70 bg-[#F8E8D3] px-4 py-5 text-sm text-[#5B4F3A]/75"><IconEmpty /><div><p className="font-medium text-[#2B2118]">Sem agendamentos</p><p className="mt-1">Este dia ainda não tem marcações.</p></div></div>
                ) : (
                  (dayAgenda?.appointments ?? []).map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-[#D8C3A5]/70 p-4 transition-all hover:border-[#D8C3A5]/70 hover:shadow-sm">
                      <p className="font-medium text-[#2B2118]">{formatTime(appointment.starts_at)} · {appointment.client_name}</p>
                      <p className="mt-1 text-sm text-[#5B4F3A]/75">{appointment.service?.name ?? "Serviço"} · {appointment.barber?.name ?? "Barbeiro"}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={() => setAppointmentForm({ id: String(appointment.id), barber_id: String(appointment.barber_id), service_id: String(appointment.service_id), client_name: appointment.client_name, client_phone: appointment.client_phone, client_email: appointment.client_email ?? "", starts_at: toDatetimeLocal(appointment.starts_at), notes: appointment.notes ?? "", status: appointment.status })} className={ghostButtonClass}>
                          Editar
                        </button>
                        <button type="button" onClick={() => void handleDeleteAppointment(appointment.id)} className={ghostButtonClass}>
                          Apagar
                        </button>
                        <span className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ${statusBadge(appointment.status)}`}>{appointment.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    );
  }

  function renderPublicLink() {
    const publicLink = barbershop ? qrCode?.public_url ?? `${typeof window !== "undefined" ? window.location.origin : ""}/book/${barbershop.slug}` : "";
    const scanCount = qrCode?.qr_scan_count ?? 0;

    return (
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className={`${whiteCardClass} overflow-hidden rounded-2xl p-0`}>
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col justify-between border-b border-[#D8C3A5]/70 bg-[#F8E8D3] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div>
                <span className="inline-flex rounded-full border border-[#A86840]/35 bg-[#A86840]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5B4F3A]">
                  QR Code da barbearia
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#2B2118] sm:text-3xl">
                  Recebe marcações diretas em qualquer ponto de contacto.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5B4F3A]/78">
                  Coloca este QR na porta, balcão ou redes sociais para receber marcações diretas.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F4EADB] p-4">
                  <p className="text-xs text-[#5B4F3A]/70">Scans</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2B2118]">{scanCount}</p>
                </div>
                <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F4EADB] p-4 sm:col-span-2">
                  <p className="text-xs text-[#5B4F3A]/70">Último scan</p>
                  <p className="mt-2 text-sm font-medium text-[#2B2118]">
                    {qrCode?.qr_last_scanned_at ? formatDateTimeLabel(qrCode.qr_last_scanned_at, timezone) : "Ainda sem scans registados"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#D8C3A5]/70 bg-[#F4EADB] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#2B2118]/40">URL pública</p>
                <p className="mt-2 break-all text-sm text-[#5B4F3A]">
                  {barbershop ? publicLink : "Cria primeiro a tua barbearia para gerar o link público."}
                </p>
              </div>

              {qrActionFeedback ? (
                <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100">
                  {qrActionFeedback}
                </div>
              ) : null}
            </div>

            <div className="p-6 sm:p-8">
              <div className="mx-auto max-w-sm rounded-[2rem] border border-[#D8C3A5]/70 bg-[#F4EADB] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
                <div className="rounded-[1.5rem] bg-white p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
                  <div className="flex aspect-square items-center justify-center rounded-2xl border border-neutral-100 bg-white">
                    {isQrLoading ? (
                      <span className="text-sm font-medium text-neutral-500">A gerar QR...</span>
                    ) : qrCode?.qr_data_uri ? (
                      <img src={qrCode.qr_data_uri} alt="QR Code da barbearia" className="h-full w-full object-contain p-2" />
                    ) : (
                      <span className="px-6 text-center text-sm font-medium text-neutral-500">QR Code disponível depois de criares a barbearia.</span>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-neutral-950">{barbershop?.name ?? "BarberBook"}</p>
                    <p className="mt-1 text-xs text-neutral-500">Marcações online em segundos</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => handleCopyQrLink(publicLink)} disabled={!barbershop} className={`${primaryButtonClass} w-full`}>
                  Copiar link
                </button>
                <button type="button" onClick={handleDownloadQrPng} disabled={!qrCode?.qr_data_uri || isQrDownloading} className={`${secondaryButtonClass} w-full`}>
                  {isQrDownloading ? "A preparar..." : "Descarregar PNG"}
                </button>
                <button type="button" onClick={() => handlePrintQrCode(publicLink)} disabled={!qrCode?.qr_data_uri} className={`${secondaryButtonClass} w-full`}>
                  Imprimir
                </button>
                <button type="button" onClick={handleRegenerateQrCode} disabled={!barbershop || isQrRegenerating} className={`${ghostButtonClass} w-full`}>
                  {isQrRegenerating ? "A regenerar..." : "Regenerar QR"}
                </button>
              </div>

              {barbershop ? (
                <Link href={`/book/${barbershop.slug}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#D8C3A5]/70 bg-[#F4EADB] px-4 py-2.5 text-sm font-medium text-[#5B4F3A] transition-all hover:border-[#A86840]/45 hover:text-[#2B2118]">
                  Abrir página pública
                </Link>
              ) : null}

              <p className="mt-4 text-center text-xs text-[#5B4F3A]/70">
                {qrCode?.qr_last_regenerated_at ? `Atualizado em ${formatDateTimeLabel(qrCode.qr_last_regenerated_at, timezone)}` : "Gerado automaticamente quando a barbearia existe."}
              </p>
            </div>
          </div>
        </article>

        <article className={`${whiteCardClass} rounded-2xl p-8`}>
          <p className="text-sm text-[#5B4F3A]/75">Checklist de partilha</p>
          <div className="mt-5 space-y-3">
            {[
              { label: "Barbearia criada", ok: Boolean(barbershop) },
              { label: "Pelo menos um barbeiro", ok: barbers.length > 0 },
              { label: "Pelo menos um serviço", ok: services.length > 0 },
              { label: "Slug pronto para partilha", ok: Boolean(barbershop?.slug) },
              { label: "QR Code gerado", ok: Boolean(qrCode?.qr_data_uri) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[#F8E8D3] px-4 py-4">
                <p className="font-medium text-[#2B2118]">{item.label}</p>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.ok ? "bg-emerald-100 text-emerald-800" : "bg-black/8 text-black/60"}`}>
                  {item.ok ? "OK" : "Pendente"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#D8C3A5]/70 bg-[#F4EADB] p-5">
            <p className="text-sm font-semibold text-[#2B2118]">Preparado para premium</p>
            <p className="mt-2 text-sm leading-6 text-[#5B4F3A]/75">
              A estrutura já guarda metadados para tracking de scans, QR personalizado com logo e exportação em PDF.
            </p>
            <div className="mt-4 grid gap-3">
              {[
                "Contagem de scans por QR",
                "Último scan registado",
                "PDF de impressão pronto para ativar",
                "QR com branding e logo da barbearia",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-[#F8E8D3] px-3 py-3 text-sm text-[#5B4F3A]/85">
                  <span className="h-2 w-2 rounded-full bg-[#A86840]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  function renderClients() {
    return (
      <section className={`${whiteCardClass} overflow-hidden`}>
        <div className="border-b border-[#D8C3A5]/70 p-6">
          <h2 className="text-2xl font-semibold text-[#2B2118]">Clientes</h2>
          <p className="mt-1 text-sm text-[#5B4F3A]/75">Lista real agregada a partir das marcações válidas da barbearia.</p>
        </div>
        <div className="divide-y divide-[#D8C3A5]/60">
          {clients.map((client) => (
            <div key={`${client.email ?? client.phone}-${client.name}`} className="grid gap-4 p-5 md:grid-cols-[1fr_0.8fr_0.5fr] md:items-center">
              <div>
                <p className="font-semibold text-[#2B2118]">{client.name}</p>
                <p className="mt-1 text-sm text-[#5B4F3A]/75">{client.email ?? "Sem e-mail"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#2B2118]/40">Contacto</p>
                <p className="mt-1 text-sm text-[#2B2118]">{client.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#2B2118]/40">Marcações</p>
                <p className="mt-1 text-sm font-semibold text-[#2B2118]">{client.appointments}</p>
              </div>
            </div>
          ))}
          {clients.length === 0 ? (
            <div className="p-6 text-sm text-[#5B4F3A]/75">Ainda não existem clientes com marcações válidas.</div>
          ) : null}
        </div>
      </section>
    );
  }

  function renderStatistics() {
    const summary = statistics?.summary;

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Faturação total", value: formatCurrency(summary?.revenue_total ?? 0) },
            { label: "Faturação mensal", value: formatCurrency(summary?.revenue_month ?? 0) },
            { label: "Marcações válidas", value: summary?.appointments_total ?? 0 },
            { label: "Clientes únicos", value: summary?.clients_total ?? 0 },
          ].map((metric) => (
            <article key={metric.label} className={`${whiteCardClass} p-5`}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/70">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#2B2118]">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className={`${whiteCardClass} overflow-hidden`}>
          <div className="border-b border-[#D8C3A5]/70 p-6">
            <h2 className="text-2xl font-semibold text-[#2B2118]">Serviços mais usados</h2>
            <p className="mt-1 text-sm text-[#5B4F3A]/75">Calculado com base em marcações válidas, sem canceladas.</p>
          </div>
          <div className="divide-y divide-[#D8C3A5]/60">
            {(summary?.services_used ?? []).map((service) => (
              <div key={service.service_id ?? service.name} className="grid gap-4 p-5 md:grid-cols-[1fr_0.5fr_0.5fr] md:items-center">
                <p className="font-semibold text-[#2B2118]">{service.name}</p>
                <p className="text-sm text-[#5B4F3A]/75">{service.appointments} marcações</p>
                <p className="text-sm font-semibold text-[#2B2118]">{formatCurrency(service.revenue)}</p>
              </div>
            ))}
            {(summary?.services_used ?? []).length === 0 ? (
              <div className="p-6 text-sm text-[#5B4F3A]/75">Ainda não há dados suficientes para estatísticas detalhadas.</div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  function renderAdminPanel() {
    if (!isSuperAdmin) {
      return (
        <article className={`${whiteCardClass} p-8`}>
          <h2 className="text-2xl font-semibold text-[#2B2118]">Acesso reservado</h2>
          <p className="mt-2 text-sm text-[#5B4F3A]/75">Apenas o super admin principal pode abrir esta área.</p>
        </article>
      );
    }

    const summary = adminPlatform?.summary;
    const metricCards = [
      { label: "Contas totais", value: summary?.users_total ?? 0 },
      { label: "Contas ativas", value: summary?.users_active ?? 0 },
      { label: "Utilizadores", value: summary?.clients_total ?? 0 },
      { label: "Barbearias ativas", value: summary?.barbershops_active ?? 0 },
    ];
    const filteredUsers = (adminPlatform?.users ?? []).filter((adminUser) => {
      if (adminFilter === "active") return adminUser.is_active;
      if (adminFilter === "inactive") return !adminUser.is_active;
      if (adminFilter === "clients") return adminUser.role === "client";
      return adminUser.role === "owner" || Boolean(adminUser.barbershop);
    });
    const filteredBarbershops = (adminPlatform?.barbershops ?? []).filter((adminBarbershop) => {
      if (adminFilter === "active") return adminBarbershop.is_active;
      if (adminFilter === "inactive") return !adminBarbershop.is_active;
      if (adminFilter === "clients") return false;
      return true;
    });
    const filterButtons: Array<{ id: AdminFilter; label: string; count: number }> = [
      { id: "active", label: "Contas Ativas", count: summary?.users_active ?? 0 },
      { id: "inactive", label: "Contas Inativas", count: summary?.users_inactive ?? 0 },
      { id: "clients", label: "Utilizadores", count: summary?.clients_total ?? 0 },
      { id: "owners", label: "Barbearias", count: summary?.owners_total ?? 0 },
    ];

    return (
      <div className="space-y-6">
        <article className={`${whiteCardClass} p-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#5B4F3A]/75">Administração global</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">Controlo da plataforma BarberBook</h2>
              <p className="mt-2 text-sm text-[#5B4F3A]/75">
                Gere contas, barbearias e acesso ativo sem interferir no fluxo normal dos barbeiros.
              </p>
            </div>
            <button type="button" onClick={() => void loadAdminPlatform()} className={secondaryButtonClass} disabled={isAdminLoading}>
              {isAdminLoading ? "A atualizar..." : "Atualizar dados"}
            </button>
          </div>
        </article>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <article key={metric.label} className={`${whiteCardClass} p-5`}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/70">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#2B2118]">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className={`${whiteCardClass} p-4`}>
          <div className="grid gap-3 md:grid-cols-4">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setAdminFilter(filter.id)}
                className={`rounded-2xl px-4 py-3 text-left transition-all ${
                  adminFilter === filter.id ? "bg-[#A86840] text-[#FFF7EC]" : "bg-[#F8E8D3] text-[#2B2118] hover:bg-[#F1DDC2]"
                }`}
              >
                <span className="block text-sm font-semibold">{filter.label}</span>
                <span className="mt-1 block text-xs opacity-75">{filter.count} registos</span>
              </button>
            ))}
          </div>
        </section>

        <section className={`${whiteCardClass} overflow-hidden`}>
          <div className="border-b border-[#D8C3A5]/70 p-6">
            <h3 className="text-xl font-semibold text-[#2B2118]">Contas de utilizador</h3>
            <p className="mt-1 text-sm text-[#5B4F3A]/75">Ativa ou desativa acessos à plataforma.</p>
          </div>
          <div className="divide-y divide-white/10">
            {filteredUsers.map((adminUser) => (
              <div key={adminUser.id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.6fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-[#2B2118]">{adminUser.name}</p>
                  <p className="mt-1 text-sm text-[#5B4F3A]/75">{adminUser.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#2B2118]/40">Barbearia</p>
                  <p className="mt-1 text-sm text-[#2B2118]">{adminUser.barbershop?.name ?? "Sem barbearia"}</p>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${adminUser.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                    {adminUser.is_active ? "Ativa" : "Desativada"}
                  </span>
                  {adminUser.is_super_admin ? <span className="ml-2 inline-flex rounded-full bg-[#A86840]/20 px-3 py-1 text-xs font-semibold text-[#FFF7EC]">Super admin</span> : null}
                </div>
                <button
                  type="button"
                  onClick={() => void handleToggleUserStatus(adminUser)}
                  className={adminUser.is_active ? secondaryButtonClass : primaryButtonClass}
                  disabled={adminUser.is_super_admin && adminUser.email === user?.email}
                >
                  {adminUser.is_active ? "Desativar" : "Ativar"}
                </button>
              </div>
            ))}
            {!isAdminLoading && filteredUsers.length === 0 ? (
              <div className="p-6 text-sm text-[#5B4F3A]/75">Não existem contas para este filtro.</div>
            ) : null}
          </div>
        </section>

        <section className={`${whiteCardClass} overflow-hidden`}>
          <div className="border-b border-[#D8C3A5]/70 p-6">
            <h3 className="text-xl font-semibold text-[#2B2118]">Barbearias</h3>
            <p className="mt-1 text-sm text-[#5B4F3A]/75">Controla a visibilidade pública e o acesso operacional de cada barbearia.</p>
          </div>
          <div className="divide-y divide-white/10">
            {filteredBarbershops.map((adminBarbershop) => (
              <div key={adminBarbershop.id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.9fr_0.6fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-[#2B2118]">{adminBarbershop.name}</p>
                  <p className="mt-1 text-sm text-[#5B4F3A]/75">/book/{adminBarbershop.slug}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#2B2118]/40">Conta associada</p>
                  <p className="mt-1 text-sm text-[#2B2118]">{adminBarbershop.owner?.email ?? "Sem conta"}</p>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${adminBarbershop.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                    {adminBarbershop.is_active ? "Ativa" : "Desativada"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleToggleBarbershopStatus(adminBarbershop)}
                  className={adminBarbershop.is_active ? secondaryButtonClass : primaryButtonClass}
                >
                  {adminBarbershop.is_active ? "Desativar" : "Ativar"}
                </button>
              </div>
            ))}
            {!isAdminLoading && filteredBarbershops.length === 0 ? (
              <div className="p-6 text-sm text-[#5B4F3A]/75">Não existem barbearias para este filtro.</div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  function renderAccountSettings() {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className={`${whiteCardClass} rounded-2xl p-8`}>
          <p className="text-sm text-[#5B4F3A]/75">Dados da conta</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">Atualiza o e-mail e o telemóvel</h2>
          <p className="mt-2 text-sm text-[#5B4F3A]/75">
            Mantém os dados de acesso e contacto da tua conta sempre atualizados.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleAccountProfileSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#2B2118]">Nome</span>
              <input className={inputClass} value={user?.name ?? ""} disabled />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#2B2118]">E-mail</span>
              <input
                className={inputClass}
                type="email"
                value={accountProfileForm.email}
                onChange={(event) => setAccountProfileForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="utilizador@example.com"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#2B2118]">Telemóvel</span>
              <input
                className={inputClass}
                value={accountProfileForm.phone}
                onChange={(event) => setAccountProfileForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+351 912 345 678"
              />
            </label>
            <button type="submit" className={primaryButtonClass}>
              Guardar dados da conta
            </button>
          </form>
        </article>

        <div className="space-y-6">
          <article className={`${whiteCardClass} rounded-2xl p-8`}>
            <p className="text-sm text-[#5B4F3A]/75">Segurança</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2B2118]">Alterar palavra-passe</h2>
            <p className="mt-2 text-sm text-[#5B4F3A]/75">
              Para proteger a conta, pedimos sempre a palavra-passe atual antes da alteração.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleAccountPasswordSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#2B2118]">Palavra-passe atual</span>
                <input
                  className={inputClass}
                  type="password"
                  value={accountPasswordForm.current_password}
                  onChange={(event) => setAccountPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
                  placeholder="Palavra-passe atual"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#2B2118]">Nova palavra-passe</span>
                <input
                  className={inputClass}
                  type="password"
                  value={accountPasswordForm.password}
                  onChange={(event) => setAccountPasswordForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Nova palavra-passe"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#2B2118]">Confirmação</span>
                <input
                  className={inputClass}
                  type="password"
                  value={accountPasswordForm.password_confirmation}
                  onChange={(event) => setAccountPasswordForm((current) => ({ ...current, password_confirmation: event.target.value }))}
                  placeholder="Repete a nova palavra-passe"
                />
              </label>
              <button type="submit" className={primaryButtonClass}>
                Atualizar palavra-passe
              </button>
            </form>
          </article>

          <article className={`${whiteCardClass} rounded-2xl p-8`}>
            <p className="text-sm text-[#5B4F3A]/75">Estado da conta</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F8E8D3] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">E-mail atual</p>
                <p className="mt-2 text-base font-medium text-[#2B2118]">{user?.email ?? "Sem e-mail"}</p>
              </div>
              <div className="rounded-2xl bg-[#F8E8D3] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#5B4F3A]/75">Telemóvel atual</p>
                <p className="mt-2 text-base font-medium text-[#2B2118]">{user?.phone ?? "Sem telemóvel"}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "agenda":
        return renderAgenda();
      case "barbershop":
        return renderBarbershop();
      case "branding":
        return renderBranding();
      case "barbers":
        return renderBarbers();
      case "services":
        return renderServices();
      case "clients":
        return renderClients();
      case "statistics":
        return renderStatistics();
      case "public-link":
        return renderPublicLink();
      case "account":
        return renderAccountSettings();
      case "admin":
        return renderAdminPanel();
      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EADB] text-[#2B2118]">
      <div className="flex min-h-screen">
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          className="fixed left-4 top-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D8C3A5]/80 bg-[#2B2118] text-[#FFF7EC] shadow-[0_12px_30px_rgba(43,33,24,0.28)] transition-all hover:bg-[#A86840] lg:hidden"
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={sidebarOpen}
        >
          <IconMenu />
        </button>

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-[#2B2118]/45 backdrop-blur-[1px] lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto border-r border-[#D8C3A5]/70 bg-[#EAD8BF] px-5 py-6 pt-20 text-[#2B2118] transition-all duration-300 lg:translate-x-0 lg:pt-6 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF7EC] text-[#A86840] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <IconSpark />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#2B2118]">BarberBook</p>
              <p className="text-sm text-[#5B4F3A]/70">Painel de gestão</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2 border-t border-[#D8C3A5]/70 pt-6">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FFF7EC] text-[#A86840] shadow-sm ring-1 ring-white/10"
                    : "text-[#5B4F3A] hover:bg-[#FFF7EC] hover:text-[#2B2118]"
                }`}
              >
                <span className={activeTab === tab.id ? "text-[#2B2118]" : "text-[#5B4F3A]"}>{getTabIcon(tab.id)}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 space-y-3 rounded-2xl border border-[#D8C3A5]/70 bg-[#FFF7EC]/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#5B4F3A]/75">Utilizador</p>
              <p className="mt-2 text-sm font-medium text-[#2B2118]">{user?.name ?? "Sem sessão ativa"}</p>
            </div>
            <div className="border-t border-[#D8C3A5]/70 pt-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#5B4F3A]/75">Barbearia</p>
              <p className="mt-2 text-sm font-medium text-[#2B2118]">{barbershop?.name ?? "Ainda sem barbearia"}</p>
            </div>
          </div>
        </aside>

        <div className="w-full lg:pl-72">
          <section className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6 xl:p-8">
            <header className={`${whiteCardClass} flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between`}>
              <div className="flex items-start gap-3">
                <div className="pl-12 lg:pl-0">
                  <p className="text-sm font-medium text-[#5B4F3A]/75">Backoffice principal</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2118]">{barbershop?.name ?? "BarberBook"}</h1>
                  <p className="mt-2 text-sm text-[#5B4F3A]/75">
                    {visibleTabs.find((tab) => tab.id === activeTab)?.label} · Hoje, {todayLabel}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl bg-[#F8E8D3] px-4 py-3 text-left sm:text-right">
                  <p className="text-sm font-medium text-[#2B2118]">{user?.name ?? "Sem sessão ativa"}</p>
                  <p className="mt-1 text-sm text-[#5B4F3A]/75">{formatDateLabel(selectedDate, timezone)}</p>
                </div>
                <button type="button" onClick={() => void handleLogout()} disabled={isLoggingOut} className={ghostButtonClass}>
                  {isLoggingOut ? "A terminar..." : "Terminar sessão"}
                </button>
              </div>
            </header>

            {!token ? (
              <section className={`${whiteCardClass} p-8`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-[#5B4F3A]/85">
                    <IconEmpty />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[#2B2118]">Início de sessão necessário</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5B4F3A]/75">
                      Faz login para abrir o painel principal de gestão.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <section className={`${whiteCardClass} p-4`}>
                  <div className={`rounded-2xl border px-4 py-4 text-sm ${
                    status.kind === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : status.kind === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-[#D8C3A5]/70 bg-[#F8E8D3] text-[#5B4F3A]/85"
                  }`}>
                    <p className="font-semibold">{status.title}</p>
                    <p className="mt-2 leading-6">{status.body}</p>
                    <p className="mt-2 text-xs opacity-80">{isLoading ? "A carregar painel..." : "Pronto."}</p>
                  </div>
                </section>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {topMetrics.map((metric) => (
                    <article key={metric.label} className="rounded-2xl bg-[#FFF7EC] p-4 shadow-sm">
                      <p className="text-xs text-[#5B4F3A]/75">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-[#2B2118]">{metric.value}</p>
                    </article>
                  ))}
                </section>
                {!isLoading ? renderActiveTab() : (
                  <section className={`${whiteCardClass} p-8`}>
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 animate-pulse rounded-2xl bg-neutral-100" />
                      <div>
                        <p className="text-2xl font-semibold text-[#2B2118]">A carregar o painel</p>
                        <p className="mt-2 text-sm leading-6 text-[#5B4F3A]/75">
                          Estamos a preparar a tua agenda, os barbeiros, os serviços e a configuração da barbearia.
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
