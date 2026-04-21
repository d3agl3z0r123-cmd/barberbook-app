import {
  appointments as mockAppointments,
  metrics as mockMetrics,
  organizationProfile,
  publicBookingBarbers,
  services as mockServices,
  team as mockTeam,
} from "@/lib/mock-data";
import { normalizeApiBaseUrl } from "@/lib/api-url";

export type ServiceCard = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

export type BookingBarber = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  nextOpenSlot: string;
};

export type BookingDay = {
  label: string;
  date: string;
  isoDate: string;
};

export type BookingSummary = {
  id?: number;
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  tagline: string;
  bookingFeeNote: string;
  averageRating: string;
  reviewCount: number;
  timezone: string;
  services: ServiceCard[];
  barbers: BookingBarber[];
  source: "api" | "mock";
};

function resolveSafeTimezone(timezone?: string | null) {
  if (!timezone) {
    return "Atlantic/Azores";
  }

  try {
    new Intl.DateTimeFormat("pt-PT", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return "Atlantic/Azores";
  }
}

export type PublicAppointmentSlot = {
  id: number;
  starts_at: string;
  ends_at: string;
  status: "booked" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  slot: string;
};

export type PublicBookingPayload = {
  slug: string;
  barber_id: number;
  service_id: number;
  starts_at: string;
  client_name: string;
  client_phone: string;
  client_email?: string | null;
  notes?: string | null;
};

export type DashboardMetric = {
  label: string;
  value: string;
  note: string;
};

export type DashboardAppointment = {
  time: string;
  client: string;
  service: string;
  barber: string;
  status: "Confirmado" | "Aguardando" | "Concluido";
};

export type DashboardTeamMember = {
  id: string;
  name: string;
  role: string;
  rating: string;
  bookingsToday: number;
};

export type DashboardData = {
  shopName: string;
  shopDescription: string;
  bookingSlug: string;
  metrics: DashboardMetric[];
  appointments: DashboardAppointment[];
  services: ServiceCard[];
  team: DashboardTeamMember[];
  source: "api" | "mock";
};

type ApiBarbershop = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  timezone: string;
  services?: Array<{
    id: number;
    name: string;
    duration_minutes: number;
    price: string | number;
  }>;
  barbers?: Array<{
    id: number;
    name: string;
  }>;
};

type ApiAppointment = {
  id: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  starts_at_local: string;
  client: { id: number; name: string | null };
  barber: { id: number; name: string | null };
  service: { id: number; name: string | null; duration_minutes: number | null; price: string | number | null };
};

type ApiOwnerDashboard = {
  barbershop: {
    id: number;
    name: string;
    address: string | null;
  };
  metrics: {
    clients: number;
    appointments_today: number;
    appointments_pending: number;
  };
};

export const publicApiBaseUrl =
  normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL);

function getServerApiBaseUrl() {
  return normalizeApiBaseUrl(process.env.API_URL ?? publicApiBaseUrl);
}

async function safeFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { revalidate?: number }
): Promise<T | null> {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      next: options?.revalidate ? { revalidate: options.revalidate } : undefined,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatMoney(value: string | number, currency = "EUR") {
  const amount = typeof value === "number" ? value : Number(value);

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDuration(minutes: number) {
  return `${minutes} min`;
}

function extractCity(address: string | null) {
  if (!address) return organizationProfile.city;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);

  return parts[0] ?? organizationProfile.city;
}

function extractNeighborhood(address: string | null) {
  if (!address) return organizationProfile.neighborhood;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);

  return parts[1] ?? parts[0] ?? organizationProfile.neighborhood;
}

function formatSlotLabel(isoString: string, timezone: string) {
  const safeTimezone = resolveSafeTimezone(timezone);

  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: safeTimezone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function mapStatus(status: ApiAppointment["status"]): DashboardAppointment["status"] {
  if (status === "confirmed") return "Confirmado";
  if (status === "pending") return "Aguardando";

  return "Concluido";
}

export async function getBookingSummary(slug: string): Promise<BookingSummary | null> {
  const apiShop = await safeFetch<ApiBarbershop>(`/public/barbershop/${slug}`, undefined, {
    revalidate: 120,
  });

  if (!apiShop) {
    if (slug !== organizationProfile.slug) {
      return null;
    }

    return {
      ...organizationProfile,
      slug: organizationProfile.slug,
      timezone: "Atlantic/Azores",
      services: mockServices,
      barbers: publicBookingBarbers.map((barber) => ({
        id: barber.id,
        name: barber.name,
        specialty: barber.specialty,
        rating: barber.rating,
        nextOpenSlot: barber.nextOpenSlot,
      })),
      source: "mock",
    };
  }

  const safeTimezone = resolveSafeTimezone(apiShop.timezone);
  const safeServices = Array.isArray(apiShop.services) ? apiShop.services : [];
  const safeBarbers = Array.isArray(apiShop.barbers) ? apiShop.barbers : [];

  return {
    id: apiShop.id,
    slug: apiShop.slug,
    name: apiShop.name,
    city: extractCity(apiShop.address),
    neighborhood: extractNeighborhood(apiShop.address),
    tagline: apiShop.description ?? "Agendamento moderno e sem atrito para clientes recorrentes.",
    bookingFeeNote: "Horário confirmado no painel e pronto para lembretes automatizados.",
    averageRating: "4.9",
    reviewCount: 0,
    timezone: safeTimezone,
    services: safeServices.map((service) => ({
      id: String(service.id),
      name: service.name,
      duration: formatDuration(service.duration_minutes),
      price: formatMoney(service.price),
    })),
    barbers: safeBarbers.map((barber) => ({
      id: String(barber.id),
      name: barber.name,
      specialty: "Disponível para agendamento online",
      rating: "4.8",
      nextOpenSlot: "Consulte a disponibilidade abaixo",
    })),
    source: "api",
  };
}

export async function getAvailabilityForDate(
  slug: string,
  serviceId: string,
  barberId: string,
  date: string
) {
  const query = new URLSearchParams({
    service_id: serviceId,
    barber_id: barberId,
    date,
  });

  return safeFetch<{
    timezone: string;
    date: string;
    slots: Array<{
      starts_at_local: string;
      starts_at_utc: string;
      ends_at_local: string;
    }>;
  }>(`/public/barbershops/${slug}/availability?${query.toString()}`, undefined, {
    revalidate: 30,
  });
}

export async function getPublicAppointments(barberId: string, date: string) {
  const query = new URLSearchParams({
    barber_id: barberId,
    date,
  });

  return safeFetch<{
    barber_id: number;
    date: string;
    timezone: string;
    appointments: PublicAppointmentSlot[];
  }>(`/public/appointments?${query.toString()}`, undefined, {
    revalidate: 10,
  });
}

export async function createPublicAppointment(payload: PublicBookingPayload) {
  const response = await fetch(`${publicApiBaseUrl}/public/appointments`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || "Resposta invalida do servidor." };
  }

  return { response, data };
}

export function getUpcomingDays(timezone: string, count = 3): BookingDay[] {
  const safeTimezone = resolveSafeTimezone(timezone);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const labelFormatter = new Intl.DateTimeFormat("pt-PT", {
    timeZone: safeTimezone,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + index);
    const isoDate = formatter.format(date);
    const parts = labelFormatter.formatToParts(date);
    const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Dia";
    const day = parts.find((part) => part.type === "day")?.value ?? "00";
    const month = parts.find((part) => part.type === "month")?.value ?? "00";
    const normalizedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1).toLowerCase()}`;

    return {
      label: index === 0 ? "Hoje" : index === 1 ? "Amanhã" : normalizedWeekday,
      date: `${day}/${month}`,
      isoDate,
    };
  });
}

export function formatAvailabilitySlots(
  slots: Array<{ starts_at_local: string }>,
  timezone: string
) {
  const safeTimezone = resolveSafeTimezone(timezone);

  return slots.map((slot) => ({
    label: new Intl.DateTimeFormat("pt-PT", {
      timeZone: safeTimezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(slot.starts_at_local)),
    startsAtLocal: slot.starts_at_local,
    fullLabel: formatSlotLabel(slot.starts_at_local, safeTimezone),
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const ownerBarbershopId = process.env.BARBERPRO_OWNER_BARBERSHOP_ID;
  const ownerToken = process.env.BARBERPRO_OWNER_TOKEN;

  if (!ownerBarbershopId || !ownerToken) {
    return {
      shopName: "North Blend",
      shopDescription: "Centro, 2 unidades, 9 barbeiros ativos",
      bookingSlug: organizationProfile.slug,
      metrics: mockMetrics,
      appointments: mockAppointments,
      services: mockServices,
      team: mockTeam,
      source: "mock",
    };
  }

  const [dashboard, appointments] = await Promise.all([
    safeFetch<ApiOwnerDashboard>(`/owner/barbershops/${ownerBarbershopId}/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
      cache: "no-store",
    }),
    safeFetch<{ data: ApiAppointment[] }>(`/owner/barbershops/${ownerBarbershopId}/appointments`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
      cache: "no-store",
    }),
  ]);

  if (!dashboard || !appointments) {
    return {
      shopName: "North Blend",
      shopDescription: "Centro, 2 unidades, 9 barbeiros ativos",
      bookingSlug: organizationProfile.slug,
      metrics: mockMetrics,
      appointments: mockAppointments,
      services: mockServices,
      team: mockTeam,
      source: "mock",
    };
  }

  const appointmentRows = appointments.data.slice(0, 6).map((appointment) => ({
    time: new Intl.DateTimeFormat("pt-PT", {
      timeZone: "Atlantic/Azores",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(appointment.starts_at_local)),
    client: appointment.client.name ?? "Cliente",
    service: appointment.service.name ?? "Serviço",
    barber: appointment.barber.name ?? "Barbeiro",
    status: mapStatus(appointment.status),
  }));

  return {
    shopName: dashboard.barbershop.name,
    shopDescription: dashboard.barbershop.address ?? "Tenant ligado ao backend Laravel",
    bookingSlug: "barbearia-central",
    metrics: [
      {
        label: "Clientes registados",
        value: String(dashboard.metrics.clients),
        note: "Clientes associados ao tenant atual",
      },
      {
        label: "Agendamentos hoje",
        value: String(dashboard.metrics.appointments_today),
        note: "Calculado no backend em UTC com leitura local",
      },
      {
        label: "Pendentes",
        value: String(dashboard.metrics.appointments_pending),
        note: "Pedidos a confirmar pela equipa",
      },
      {
        label: "Fonte de dados",
        value: "API",
        note: "Painel consumindo Laravel",
      },
    ],
    appointments: appointmentRows,
    services: mockServices,
    team: mockTeam,
    source: "api",
  };
}
