"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusNotice } from "@/components/app-ui";
import {
  BookingStepCard,
  SelectionList,
  SelectionTile,
  StepNavigation,
  publicInputClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
} from "@/components/public-ui";
import {
  createPublicAppointment,
  getPublicAppointments,
  type BookingBarber,
  type ServiceCard,
} from "@/lib/api";

type PublicBookingFlowProps = {
  slug: string;
  timezone: string;
  source: "api" | "mock";
  barbers: BookingBarber[];
  services: ServiceCard[];
};

type StatusState = {
  kind: "idle" | "success" | "error";
  title: string;
  body: string;
};

type BookingStep = "service" | "barber" | "schedule" | "details" | "confirm";

type CalendarDay = {
  isoDate: string;
  dayNumber: string;
  isCurrentMonth: boolean;
  isDisabled: boolean;
  isToday: boolean;
};

type SelectedDay = {
  title: string;
  compact: string;
  full: string;
};

type ZonedNowInfo = {
  isoDate: string;
  minutes: number;
};

type SlotState = {
  slot: string;
  isOccupied: boolean;
  isPast: boolean;
  isDisabled: boolean;
};

const FIXED_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
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

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const steps: BookingStep[] = ["service", "barber", "schedule", "details", "confirm"];
const MINIMUM_BOOKING_BUFFER_MINUTES = 30;
const LAST_SLOT_MINUTES = slotToMinutes(FIXED_SLOTS[FIXED_SLOTS.length - 1]);

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

function getIsoDateInTimezone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getZonedNowInfo(timezone: string): ZonedNowInfo {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return {
    isoDate: `${year}-${month}-${day}`,
    minutes: hour * 60 + minute,
  };
}

function slotToMinutes(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  return hours * 60 + minutes;
}

function getMinimumBookableMinutes(nowMinutes: number) {
  return nowMinutes + MINIMUM_BOOKING_BUFFER_MINUTES;
}

function getMonthDateFromIso(isoDate: string) {
  const [year, month] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
}

function shiftUtcMonth(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12, 0, 0));
}

function getMonthLabel(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("pt-PT", {
    timeZone: timezone,
    month: "long",
    year: "numeric",
  });
  const label = formatter.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getBookingDayLabel(isoDate: string, timezone: string): SelectedDay {
  const safeTimezone = resolveSafeTimezone(timezone);
  const target = new Date(`${isoDate}T12:00:00Z`);
  const todayIso = getIsoDateInTimezone(new Date(), safeTimezone);
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowIso = getIsoDateInTimezone(tomorrow, safeTimezone);
  const parts = new Intl.DateTimeFormat("pt-PT", {
    timeZone: safeTimezone,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(target);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Dia";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const normalizedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1).toLowerCase()}`;
  const title = isoDate === todayIso ? "Hoje" : isoDate === tomorrowIso ? "Amanhã" : normalizedWeekday;

  return {
    title,
    compact: `${day}/${month}`,
    full: `${title} - ${day}/${month}`,
  };
}

function buildCalendarDays(visibleMonth: Date, timezone: string) {
  const safeTimezone = resolveSafeTimezone(timezone);
  const nowInfo = getZonedNowInfo(safeTimezone);
  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, month, 1, 12, 0, 0)).getUTCDay() + 6) % 7;
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const minimumBookableMinutes = getMinimumBookableMinutes(nowInfo.minutes);

  return Array.from({ length: totalCells }, (_, index): CalendarDay => {
    const dateNumber = index - firstWeekday + 1;

    if (dateNumber < 1 || dateNumber > daysInMonth) {
      return {
        isoDate: "",
        dayNumber: "",
        isCurrentMonth: false,
        isDisabled: true,
        isToday: false,
      };
    }

    const monthDate = new Date(Date.UTC(year, month, dateNumber, 12, 0, 0));
    const isoDate = getIsoDateInTimezone(monthDate, safeTimezone);
    const isToday = isoDate === nowInfo.isoDate;
    const hasBookableSlotsToday = minimumBookableMinutes <= LAST_SLOT_MINUTES;

    return {
      isoDate,
      dayNumber: String(dateNumber),
      isCurrentMonth: true,
      isDisabled: isoDate < nowInfo.isoDate || (isToday && !hasBookableSlotsToday),
      isToday,
    };
  });
}

export function PublicBookingFlow({
  slug,
  timezone,
  source,
  barbers,
  services,
}: PublicBookingFlowProps) {
  const safeBarbers = Array.isArray(barbers) ? barbers : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeTimezone = useMemo(() => resolveSafeTimezone(timezone), [timezone]);
  const [selectedDateIso, setSelectedDateIso] = useState(() => getIsoDateInTimezone(new Date(), safeTimezone));
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthDateFromIso(getIsoDateInTimezone(new Date(), safeTimezone))
  );
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState(safeServices[0]?.id ?? "");
  const [selectedBarberId, setSelectedBarberId] = useState(safeBarbers[0]?.id ?? "");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNoPreference, setHasNoPreference] = useState(false);
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Nova Marcação",
    body: "Escolhe o serviço, o profissional, a data e confirma os teus dados.",
  });
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    notes: "",
    accepted_terms: false,
  });

  const selectedService =
    safeServices.find((service) => service.id === selectedServiceId) ?? safeServices[0] ?? null;
  const selectedBarber =
    safeBarbers.find((barber) => barber.id === selectedBarberId) ?? safeBarbers[0] ?? null;
  const selectedDay = useMemo(
    () => getBookingDayLabel(selectedDateIso, safeTimezone),
    [selectedDateIso, safeTimezone]
  );
  const zonedNowInfo = useMemo(() => getZonedNowInfo(safeTimezone), [safeTimezone]);
  const currentMonthFloor = useMemo(
    () => getMonthDateFromIso(getIsoDateInTimezone(new Date(), safeTimezone)),
    [safeTimezone]
  );
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, safeTimezone),
    [visibleMonth, safeTimezone]
  );
  const slotStates = useMemo<SlotState[]>(() => {
    const minimumBookableMinutes = getMinimumBookableMinutes(zonedNowInfo.minutes);
    const isToday = selectedDateIso === zonedNowInfo.isoDate;

    return FIXED_SLOTS.map((slot) => {
      const slotMinutes = slotToMinutes(slot);
      const isPast = isToday && slotMinutes < minimumBookableMinutes;
      const isOccupied = occupiedSlots.includes(slot);

      return {
        slot,
        isOccupied,
        isPast,
        isDisabled: isOccupied || isPast,
      };
    });
  }, [occupiedSlots, selectedDateIso, zonedNowInfo]);
  const hasAvailableSlots = slotStates.some((slot) => !slot.isDisabled);
  const chosenProfessionalLabel = hasNoPreference ? "Sem preferência" : selectedBarber?.name ?? "Por definir";
  const canAdvanceFromService = Boolean(selectedServiceId);
  const canAdvanceFromBarber = Boolean(selectedBarberId);
  const canAdvanceFromSchedule = Boolean(selectedSlot);
  const canAdvanceFromDetails = Boolean(form.client_name && form.client_phone && form.accepted_terms);

  useEffect(() => {
    if (!selectedServiceId && safeServices[0]?.id) {
      setSelectedServiceId(safeServices[0].id);
    }
  }, [safeServices, selectedServiceId]);

  useEffect(() => {
    if (!selectedBarberId && safeBarbers[0]?.id) {
      setSelectedBarberId(safeBarbers[0].id);
    }
  }, [safeBarbers, selectedBarberId]);

  useEffect(() => {
    if (!selectedDateIso) {
      const todayIso = getIsoDateInTimezone(new Date(), safeTimezone);
      setSelectedDateIso(todayIso);
      setVisibleMonth(getMonthDateFromIso(todayIso));
    }
  }, [selectedDateIso, safeTimezone]);

  useEffect(() => {
    if (!selectedBarberId || !selectedDateIso) {
      setOccupiedSlots([]);
      return;
    }

    let active = true;

    async function loadAppointments() {
      setIsLoadingSlots(true);
      const payload = await getPublicAppointments(selectedBarberId, selectedDateIso);

      if (!active) {
        return;
      }

      setOccupiedSlots((payload?.appointments ?? []).map((appointment) => appointment.slot));
      setSelectedSlot("");
      setIsLoadingSlots(false);
    }

    void loadAppointments();

    return () => {
      active = false;
    };
  }, [selectedBarberId, selectedDateIso]);

  async function submitBooking() {
    if (!selectedDateIso || !selectedSlot || !selectedBarberId || !selectedServiceId) {
      setStatus({
        kind: "error",
        title: "Faltam dados",
        body: "Completa os passos anteriores antes de confirmar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingPayload = {
        slug,
        barber_id: Number(selectedBarberId),
        service_id: Number(selectedServiceId),
        starts_at: `${selectedDateIso}T${selectedSlot}:00`,
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email || null,
        notes: form.notes || null,
      };

      const { response, data } = await createPublicAppointment(bookingPayload);

      if (!response.ok) {
        const slotUnavailableMessage =
          data?.errors?.time?.[0]?.includes("indispon") || data?.message?.includes("indispon");

        setStatus({
          kind: "error",
          title: "Não foi possível marcar",
          body: slotUnavailableMessage
            ? "Este horário acabou de ficar indisponível. Escolhe outro."
            : data?.errors?.time?.[0] ?? data?.message ?? "Verifica os dados e tenta novamente.",
        });
        setCurrentStep(slotUnavailableMessage ? "schedule" : "confirm");
        return;
      }

      setStatus({
        kind: "success",
        title: "Marcação confirmada com sucesso",
        body: `${selectedService?.name ?? "Serviço"} marcado para ${selectedDay.full} às ${selectedSlot}.`,
      });
      setForm({
        client_name: "",
        client_phone: "",
        client_email: "",
        notes: "",
        accepted_terms: false,
      });
      setOccupiedSlots((current) => [...current, selectedSlot]);
      setSelectedSlot("");
      setCurrentStep("service");
    } catch {
      setStatus({
        kind: "error",
        title: "Falha de ligação",
        body: "Não foi possível contactar o backend Laravel.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }

  function handleNext() {
    if (currentStep === "service" && canAdvanceFromService) {
      setCurrentStep("barber");
      return;
    }

    if (currentStep === "barber" && canAdvanceFromBarber) {
      setCurrentStep("schedule");
      return;
    }

    if (currentStep === "schedule" && canAdvanceFromSchedule) {
      setCurrentStep("details");
      return;
    }

    if (currentStep === "details" && canAdvanceFromDetails) {
      setCurrentStep("confirm");
    }
  }

  if (safeServices.length === 0) {
    return (
      <div className="rounded-[32px] border border-neutral-200 bg-white p-7 text-sm text-neutral-500 shadow-sm">
        Sem serviços disponíveis.
      </div>
    );
  }

  if (safeBarbers.length === 0) {
    return (
      <div className="rounded-[32px] border border-neutral-200 bg-white p-7 text-sm text-neutral-500 shadow-sm">
        Sem barbeiros disponíveis.
      </div>
    );
  }

  if (!selectedService || !selectedBarber) {
    return (
      <div className="rounded-[32px] border border-neutral-200 bg-white p-7 text-sm text-neutral-500 shadow-sm">
        Não foi possível preparar os dados da marcação. Atualiza a página e tenta novamente.
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[56rem] gap-5">
      <div className="px-2">
        <StepNavigation currentStep={steps.indexOf(currentStep) + 1} totalSteps={steps.length} />
      </div>

      {currentStep === "service" ? (
        <BookingStepCard
          title="Nova Marcação"
          description="Escolhe o serviço"
          onNext={handleNext}
          isNextDisabled={!canAdvanceFromService}
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                className={`${publicPrimaryButtonClass} min-w-40`}
                disabled={!canAdvanceFromService}
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          }
        >
          <SelectionList>
            {safeServices.map((service) => (
              <SelectionTile
                key={service.id}
                active={selectedServiceId === service.id}
                title={service.name}
                subtitle={service.duration}
                meta={service.price}
                onClick={() => setSelectedServiceId(service.id)}
              />
            ))}
          </SelectionList>
        </BookingStepCard>
      ) : null}

      {currentStep === "barber" ? (
        <BookingStepCard
          title="Nova Marcação"
          description="Escolhe um profissional"
          onBack={handleBack}
          onNext={handleNext}
          isNextDisabled={!canAdvanceFromBarber}
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                className={`${publicPrimaryButtonClass} min-w-40`}
                disabled={!canAdvanceFromBarber}
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          }
        >
          <SelectionList>
            <SelectionTile
              active={hasNoPreference}
              title="Sem preferência"
              subtitle="Atribuímos o primeiro profissional disponível."
              onClick={() => {
                setHasNoPreference(true);
                setSelectedBarberId(safeBarbers[0]?.id ?? "");
              }}
            />
            {safeBarbers.map((barber) => (
              <SelectionTile
                key={barber.id}
                active={!hasNoPreference && selectedBarberId === barber.id}
                title={barber.name}
                subtitle={barber.specialty}
                leading={
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-base font-semibold text-neutral-500">
                    {barber.name.charAt(0).toUpperCase()}
                  </div>
                }
                onClick={() => {
                  setHasNoPreference(false);
                  setSelectedBarberId(barber.id);
                }}
              />
            ))}
          </SelectionList>
        </BookingStepCard>
      ) : null}

      {currentStep === "schedule" ? (
        <BookingStepCard
          title="Nova Marcação"
          description="Escolhe um dia e a hora"
          onBack={handleBack}
          onNext={handleNext}
          isNextDisabled={!canAdvanceFromSchedule}
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                className={`${publicPrimaryButtonClass} min-w-40`}
                disabled={!canAdvanceFromSchedule}
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          }
        >
          <div className="rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Calendário</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-neutral-950">
                  {getMonthLabel(visibleMonth, safeTimezone)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleMonth((current) => shiftUtcMonth(current, -1))}
                  disabled={visibleMonth.getTime() <= currentMonthFloor.getTime()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-neutral-300 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((current) => shiftUtcMonth(current, 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-neutral-300 hover:text-neutral-950"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  {label}
                </span>
              ))}

              {calendarDays.map((day, index) =>
                day.isCurrentMonth ? (
                  <button
                    key={`${day.isoDate}-${index}`}
                    type="button"
                    disabled={day.isDisabled}
                    onClick={() => {
                      setSelectedDateIso(day.isoDate);
                      setSelectedSlot("");
                    }}
                    className={`flex aspect-square items-center justify-center rounded-2xl text-sm font-semibold transition-all ${
                      day.isoDate === selectedDateIso
                        ? "bg-neutral-950 text-white shadow-sm"
                        : day.isDisabled
                          ? "cursor-not-allowed text-neutral-300"
                          : day.isToday
                            ? "border border-neutral-950 bg-white text-neutral-950"
                            : "bg-white text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {day.dayNumber}
                  </button>
                ) : (
                  <span key={`empty-${index}`} className="aspect-square" />
                )
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Horários</p>
                <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-neutral-950">{selectedDay.full}</p>
              </div>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-500">
                {chosenProfessionalLabel}
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-500">
                A carregar horários disponíveis...
              </div>
            ) : hasAvailableSlots ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {slotStates.map((slotState) => (
                  <SelectionTile
                    key={slotState.slot}
                    disabled={slotState.isDisabled}
                    active={selectedSlot === slotState.slot}
                    title={slotState.slot}
                    subtitle={
                      slotState.isOccupied
                        ? "Indisponível"
                        : slotState.isPast
                          ? "Já passou"
                          : "Disponível"
                    }
                    onClick={() => setSelectedSlot(slotState.slot)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-500">
                Não existem horários disponíveis para este dia.
              </div>
            )}
          </div>
        </BookingStepCard>
      ) : null}

      {currentStep === "details" ? (
        <BookingStepCard
          title="Nova Marcação"
          description="Preenche os teus dados"
          onBack={handleBack}
          onNext={handleNext}
          isNextDisabled={!canAdvanceFromDetails}
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                className={`${publicPrimaryButtonClass} min-w-40`}
                disabled={!canAdvanceFromDetails}
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          }
        >
          <div className="grid gap-4">
            <input
              className={publicInputClass}
              placeholder="Primeiro e último nome"
              value={form.client_name}
              onChange={(event) => setForm((current) => ({ ...current, client_name: event.target.value }))}
            />
            <input
              className={publicInputClass}
              placeholder="Telemóvel"
              value={form.client_phone}
              onChange={(event) => setForm((current) => ({ ...current, client_phone: event.target.value }))}
            />
            <input
              className={publicInputClass}
              placeholder="O teu e-mail"
              value={form.client_email}
              onChange={(event) => setForm((current) => ({ ...current, client_email: event.target.value }))}
            />
            <textarea
              className={`${publicInputClass} min-h-28 resize-none`}
              placeholder="Observações"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 text-sm leading-6 text-neutral-600">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-neutral-300"
                checked={form.accepted_terms}
                onChange={(event) => setForm((current) => ({ ...current, accepted_terms: event.target.checked }))}
              />
              <span>Li e concordo com os Termos e Condições e a Política de Privacidade.</span>
            </label>
          </div>
        </BookingStepCard>
      ) : null}

      {currentStep === "confirm" ? (
        <BookingStepCard
          title="Nova Marcação"
          description="Confirma a tua marcação"
          onBack={handleBack}
          footer={
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void submitBooking()}
                className={publicPrimaryButtonClass}
              >
                {isSubmitting ? "A confirmar..." : "Confirmar marcação"}
              </button>
              <button type="button" onClick={handleBack} className={publicSecondaryButtonClass}>
                Voltar
              </button>
            </div>
          }
        >
          <div className="space-y-4 rounded-[28px] border border-neutral-200 bg-neutral-50 p-6">
            <div className="text-center">
              <p className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">{selectedService.name}</p>
              <p className="mt-1 text-sm text-neutral-500">{chosenProfessionalLabel}</p>
              <p className="mt-2 text-sm font-medium text-neutral-700">
                {selectedDay.full} / {selectedSlot}
              </p>
            </div>
            <div className="grid gap-3 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Serviço</span>
                <span className="font-semibold text-neutral-950">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Profissional</span>
                <span className="font-semibold text-neutral-950">{chosenProfessionalLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Data</span>
                <span className="font-semibold text-neutral-950">{selectedDay.compact}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Hora</span>
                <span className="font-semibold text-neutral-950">{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Preço</span>
                <span className="font-semibold text-neutral-950">{selectedService.price}</span>
              </div>
            </div>
          </div>
        </BookingStepCard>
      ) : null}

      {status.kind !== "idle" ? <StatusNotice kind={status.kind} title={status.title} body={status.body} /> : null}

      <p className="text-center text-sm text-neutral-400">
        {source === "api" ? `Horários reais em ${timezone}.` : "Modo de demonstração ativo."}
      </p>
    </div>
  );
}
