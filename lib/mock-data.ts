export type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  rating: string;
  bookingsToday: number;
};

export type Appointment = {
  time: string;
  client: string;
  service: string;
  barber: string;
  status: "Confirmado" | "Aguardando" | "Concluido";
};

export type PublicBookingDay = {
  label: string;
  date: string;
  slots: string[];
};

export type PublicBookingBarber = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  nextOpenSlot: string;
  days: PublicBookingDay[];
};

export type OrganizationProfile = {
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  tagline: string;
  bookingFeeNote: string;
  averageRating: string;
  reviewCount: number;
};

export const metrics = [
  { label: "Faturamento mensal", value: "R$ 18.400", note: "+14% vs. mes passado" },
  { label: "Agendamentos hoje", value: "27", note: "5 horarios livres" },
  { label: "Clientes ativos", value: "312", note: "43 recorrentes VIP" },
  { label: "No-show", value: "3.2%", note: "Lembretes reduziram faltas" },
];

export const services: Service[] = [
  { id: "cut-premium", name: "Corte premium", duration: "45 min", price: "R$ 55" },
  { id: "beard-design", name: "Barba desenhada", duration: "30 min", price: "R$ 35" },
  { id: "combo", name: "Combo corte + barba", duration: "60 min", price: "R$ 80" },
  { id: "pigmentation", name: "Pigmentacao", duration: "25 min", price: "R$ 30" },
];

export const team: TeamMember[] = [
  { id: "rafael", name: "Rafael Costa", role: "Barbeiro master", rating: "4.9", bookingsToday: 8 },
  { id: "diego", name: "Diego Martins", role: "Especialista em fade", rating: "4.8", bookingsToday: 7 },
  { id: "bruno", name: "Bruno Alves", role: "Barba e acabamento", rating: "4.7", bookingsToday: 6 },
];

export const appointments: Appointment[] = [
  {
    time: "09:00",
    client: "Matheus Lima",
    service: "Corte premium",
    barber: "Rafael",
    status: "Confirmado",
  },
  {
    time: "10:30",
    client: "Joao Pedro",
    service: "Combo corte + barba",
    barber: "Diego",
    status: "Aguardando",
  },
  {
    time: "13:00",
    client: "Carlos Vinicius",
    service: "Barba desenhada",
    barber: "Bruno",
    status: "Concluido",
  },
  {
    time: "16:00",
    client: "Felipe Moura",
    service: "Pigmentacao",
    barber: "Rafael",
    status: "Confirmado",
  },
];

export const plans = [
  {
    name: "Start",
    price: "R$ 79",
    description: "Para barbearias iniciando a operacao digital.",
    features: ["1 unidade", "ate 3 barbeiros", "agenda online", "relatorios basicos"],
  },
  {
    name: "Growth",
    price: "R$ 149",
    description: "Para equipes que querem lotar agenda e reduzir faltas.",
    features: ["ate 10 barbeiros", "WhatsApp e lembretes", "dashboard completo", "clientes VIP"],
  },
  {
    name: "Scale",
    price: "R$ 249",
    description: "Para redes com varias unidades e operacao centralizada.",
    features: ["multiplas unidades", "permissoes por equipe", "assinaturas", "suporte prioritario"],
  },
];

export const steps = [
  {
    title: "Crie sua barbearia",
    description: "Cadastre marca, horarios, servicos e a identidade visual da unidade.",
  },
  {
    title: "Monte a equipe",
    description: "Adicione barbeiros, especialidades, metas e comissoes de cada profissional.",
  },
  {
    title: "Abra a agenda online",
    description: "Compartilhe o link com clientes e aceite agendamentos em poucos minutos.",
  },
];

export const organizationProfile: OrganizationProfile = {
  slug: "north-blend",
  name: "North Blend Barber Club",
  city: "Sao Paulo",
  neighborhood: "Centro",
  tagline: "Cortes precisos, experiencia premium e agendamento sem friccao.",
  bookingFeeNote: "Confirmacao rapida por WhatsApp apos o pedido.",
  averageRating: "4.9",
  reviewCount: 248,
};

export const publicBookingBarbers: PublicBookingBarber[] = [
  {
    id: "rafael",
    name: "Rafael Costa",
    specialty: "Cortes classicos e atendimento VIP",
    rating: "4.9",
    nextOpenSlot: "Hoje, 18:00",
    days: [
      { label: "Hoje", date: "16 Abr", slots: ["14:00", "15:30", "18:00"] },
      { label: "Amanha", date: "17 Abr", slots: ["09:00", "11:00", "13:30", "16:30"] },
      { label: "Sab", date: "18 Abr", slots: ["10:00", "12:00", "15:00"] },
    ],
  },
  {
    id: "diego",
    name: "Diego Martins",
    specialty: "Fade, degradê e acabamento preciso",
    rating: "4.8",
    nextOpenSlot: "Hoje, 16:30",
    days: [
      { label: "Hoje", date: "16 Abr", slots: ["13:30", "16:30", "19:00"] },
      { label: "Amanha", date: "17 Abr", slots: ["10:00", "12:30", "14:00", "17:00"] },
      { label: "Sab", date: "18 Abr", slots: ["09:30", "11:30", "14:30"] },
    ],
  },
  {
    id: "bruno",
    name: "Bruno Alves",
    specialty: "Barba, pigmentacao e finalizacao",
    rating: "4.7",
    nextOpenSlot: "Hoje, 17:30",
    days: [
      { label: "Hoje", date: "16 Abr", slots: ["15:00", "17:30"] },
      { label: "Amanha", date: "17 Abr", slots: ["09:30", "11:30", "15:30", "18:30"] },
      { label: "Sab", date: "18 Abr", slots: ["10:30", "13:00", "16:00"] },
    ],
  },
];
