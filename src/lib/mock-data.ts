// Mock data for CUBO CRM

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'lead' | 'paciente_ativo' | 'em_tratamento' | 'inativo' | 'vip';
  origin: string;
  origin_detail?: string;
  gender?: string;
  birth_date?: string;
  instagram?: string;
  cpf?: string;
  address?: { street: string; neighborhood: string; city: string; state: string; zip: string };
  tags: string[];
  value_class: 'A' | 'B' | 'C';
  procedures_interest: string[];
  preferred_professional?: string;
  pipeline_stage: number;
  pipeline_stage_days: number;
  budget_value?: number;
  ltv: number;
  procedures_count: number;
  no_shows: number;
  last_visit?: string;
  next_appointment?: string;
  nps_score?: number;
  created_at: string;
  avatar?: string;
  allergies?: string;
  medical_notes?: string;
  insurance?: string;
  preferred_time?: string;
  consent_whatsapp: boolean;
  consent_email: boolean;
  consent_sms: boolean;
  consent_date?: string;
}

export interface Budget {
  id: string;
  patient_id: string;
  patient_name: string;
  professional: string;
  created_at: string;
  valid_until: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_condition: string;
  notes?: string;
  pipeline_stage: number;
}

export interface BudgetItem {
  id: string;
  procedure: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  category: string;
  suggested_price: number;
  duration_minutes: number;
  active: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'clinic_owner' | 'clinic_staff' | 'clinic_receptionist';
  specialty?: string;
  active: boolean;
  avatar?: string;
}

export const PATIENT_PIPELINE_STAGES = [
  { id: 1, name: 'Novo Lead', color: '#3B82F6' },
  { id: 2, name: 'Tentativa de Contato', color: '#60A5FA' },
  { id: 3, name: 'Em Conversa', color: '#FBBF24' },
  { id: 4, name: 'Agendamento Marcado', color: '#F97316' },
  { id: 5, name: 'Avaliacao Realizada', color: '#A855F7' },
  { id: 6, name: 'Orcamento Enviado', color: '#EC4899' },
  { id: 7, name: 'Em Negociacao', color: '#F59E0B' },
  { id: 8, name: 'Tratamento Iniciado', color: '#22C55E' },
  { id: 9, name: 'Concluido', color: '#10B981' },
  { id: 10, name: 'Perdido', color: '#EF4444' },
];

export const BUDGET_PIPELINE_STAGES = [
  { id: 1, name: 'Rascunho', color: '#9CA3AF' },
  { id: 2, name: 'Enviado ao Paciente', color: '#3B82F6' },
  { id: 3, name: 'Visualizado', color: '#FBBF24' },
  { id: 4, name: 'Em Negociacao', color: '#F97316' },
  { id: 5, name: 'Aprovado', color: '#22C55E' },
  { id: 6, name: 'Recusado', color: '#EF4444' },
  { id: 7, name: 'Expirado', color: '#6B7280' },
];

export const LOSS_REASONS = [
  'Preco',
  'Concorrente',
  'Timing/Momento',
  'Medo/Inseguranca',
  'Nao respondeu',
  'Mudou de ideia',
  'Outro',
];

export const ORIGINS = [
  'Google Ads',
  'Instagram Ads',
  'Indicacao de paciente',
  'Indicacao de medico',
  'Organico',
  'Site',
  'Walk-in',
  'Outro',
];

export const STATUS_OPTIONS = [
  { value: 'lead', label: 'Lead', color: '#3B82F6' },
  { value: 'paciente_ativo', label: 'Paciente Ativo', color: '#22C55E' },
  { value: 'em_tratamento', label: 'Em Tratamento', color: '#A855F7' },
  { value: 'inativo', label: 'Inativo', color: '#6B7280' },
  { value: 'vip', label: 'VIP', color: '#F59E0B' },
];

export const mockPatients: Patient[] = [
  {
    id: '1', name: 'Ana Carolina Silva', phone: '(11) 99876-5432', email: 'ana.silva@email.com',
    status: 'paciente_ativo', origin: 'Instagram Ads', origin_detail: 'Campanha Harmonizacao Marco',
    gender: 'feminino', birth_date: '1990-03-15', instagram: '@anacarolina',
    tags: ['VIP', 'Alto ticket'], value_class: 'A', procedures_interest: ['Harmonizacao', 'Botox'],
    preferred_professional: 'Dra. Marina Costa', pipeline_stage: 8, pipeline_stage_days: 12,
    budget_value: 4500, ltv: 12800, procedures_count: 5, no_shows: 0,
    last_visit: '2026-02-20', next_appointment: '2026-03-05', nps_score: 10,
    created_at: '2025-06-10', consent_whatsapp: true, consent_email: true, consent_sms: false,
    consent_date: '2025-06-10T14:30:00', allergies: 'Nenhuma', medical_notes: 'Pele sensivel',
    address: { street: 'Rua Augusta, 1200', neighborhood: 'Consolacao', city: 'Sao Paulo', state: 'SP', zip: '01304-001' },
  },
  {
    id: '2', name: 'Carlos Eduardo Mendes', phone: '(11) 98765-4321', email: 'carlos.mendes@email.com',
    status: 'lead', origin: 'Google Ads', tags: ['Primeira consulta'], value_class: 'B',
    procedures_interest: ['Lente de contato dental'], pipeline_stage: 1, pipeline_stage_days: 2,
    ltv: 0, procedures_count: 0, no_shows: 0, created_at: '2026-02-22',
    consent_whatsapp: true, consent_email: false, consent_sms: false,
  },
  {
    id: '3', name: 'Juliana Ferreira Santos', phone: '(11) 97654-3210', email: 'juliana.santos@email.com',
    status: 'em_tratamento', origin: 'Indicacao de paciente', origin_detail: 'Indicada pela Ana Carolina',
    tags: ['Indicacao'], value_class: 'A', procedures_interest: ['Preenchimento labial', 'Botox'],
    preferred_professional: 'Dra. Marina Costa', pipeline_stage: 8, pipeline_stage_days: 5,
    budget_value: 3200, ltv: 6500, procedures_count: 3, no_shows: 1,
    last_visit: '2026-02-18', created_at: '2025-09-01', consent_whatsapp: true,
    consent_email: true, consent_sms: true, consent_date: '2025-09-01T10:00:00',
  },
  {
    id: '4', name: 'Roberto Almeida', phone: '(11) 96543-2109', email: 'roberto.a@email.com',
    status: 'lead', origin: 'Site', tags: ['Sensivel a preco'], value_class: 'C',
    procedures_interest: ['Clareamento dental'], pipeline_stage: 3, pipeline_stage_days: 4,
    ltv: 0, procedures_count: 0, no_shows: 0, created_at: '2026-02-18',
    consent_whatsapp: true, consent_email: false, consent_sms: false,
  },
  {
    id: '5', name: 'Patricia Lima Oliveira', phone: '(11) 95432-1098', email: 'patricia.lima@email.com',
    status: 'vip', origin: 'Indicacao de medico', tags: ['VIP', 'Indicou 3 pacientes', 'Alto ticket'],
    value_class: 'A', procedures_interest: ['Harmonizacao', 'Skinbooster', 'Peeling'],
    preferred_professional: 'Dr. Ricardo Nunes', pipeline_stage: 9, pipeline_stage_days: 0,
    budget_value: 8500, ltv: 32000, procedures_count: 15, no_shows: 0,
    last_visit: '2026-02-15', nps_score: 10, created_at: '2024-01-15',
    consent_whatsapp: true, consent_email: true, consent_sms: true,
  },
  {
    id: '6', name: 'Fernando Gomes', phone: '(11) 94321-0987', email: 'fernando.g@email.com',
    status: 'lead', origin: 'Google Ads', tags: [], value_class: 'B',
    procedures_interest: ['Implante dental'], pipeline_stage: 4, pipeline_stage_days: 1,
    ltv: 0, procedures_count: 0, no_shows: 0, created_at: '2026-02-21',
    consent_whatsapp: true, consent_email: false, consent_sms: false,
  },
  {
    id: '7', name: 'Mariana Rocha', phone: '(11) 93210-9876', email: 'mariana.r@email.com',
    status: 'inativo', origin: 'Walk-in', tags: ['Inativa'], value_class: 'C',
    procedures_interest: ['Limpeza de pele'], pipeline_stage: 10, pipeline_stage_days: 30,
    ltv: 350, procedures_count: 1, no_shows: 2, last_visit: '2025-11-10',
    created_at: '2025-10-01', consent_whatsapp: false, consent_email: false, consent_sms: false,
  },
  {
    id: '8', name: 'Lucas Ribeiro', phone: '(11) 92109-8765', email: 'lucas.r@email.com',
    status: 'lead', origin: 'Instagram Ads', origin_detail: 'Campanha Lentes Fev',
    tags: [], value_class: 'B', procedures_interest: ['Lente de contato dental', 'Clareamento dental'],
    pipeline_stage: 6, pipeline_stage_days: 3, budget_value: 6000,
    ltv: 0, procedures_count: 0, no_shows: 0, created_at: '2026-02-15',
    consent_whatsapp: true, consent_email: true, consent_sms: false,
  },
];

export const mockProcedures: Procedure[] = [
  { id: '1', name: 'Harmonizacao Facial', description: 'Procedimento completo de harmonizacao facial', category: 'Estetica Facial', suggested_price: 3500, duration_minutes: 90, active: true },
  { id: '2', name: 'Botox', description: 'Aplicacao de toxina botulinica', category: 'Estetica Facial', suggested_price: 1200, duration_minutes: 30, active: true },
  { id: '3', name: 'Preenchimento Labial', description: 'Preenchimento com acido hialuronico nos labios', category: 'Estetica Facial', suggested_price: 1800, duration_minutes: 45, active: true },
  { id: '4', name: 'Lente de Contato Dental', description: 'Faceta em porcelana ultrafina por unidade', category: 'Odonto Estetica', suggested_price: 2000, duration_minutes: 60, active: true },
  { id: '5', name: 'Clareamento Dental', description: 'Clareamento a laser em consultorio', category: 'Odonto Estetica', suggested_price: 800, duration_minutes: 60, active: true },
  { id: '6', name: 'Skinbooster', description: 'Bioestimulador de colageno', category: 'Estetica Facial', suggested_price: 1500, duration_minutes: 45, active: true },
  { id: '7', name: 'Peeling Quimico', description: 'Peeling de acido glicolico', category: 'Estetica Facial', suggested_price: 400, duration_minutes: 30, active: true },
  { id: '8', name: 'Implante Dental', description: 'Implante de titanio por unidade', category: 'Odonto', suggested_price: 3000, duration_minutes: 120, active: true },
  { id: '9', name: 'Limpeza de Pele', description: 'Limpeza profunda com extracao', category: 'Estetica Facial', suggested_price: 250, duration_minutes: 60, active: true },
  { id: '10', name: 'Criolipolise', description: 'Reducao de gordura localizada', category: 'Corporal', suggested_price: 800, duration_minutes: 60, active: true },
];

export const mockBudgets: Budget[] = [
  {
    id: '1', patient_id: '8', patient_name: 'Lucas Ribeiro', professional: 'Dr. Ricardo Nunes',
    created_at: '2026-02-15', valid_until: '2026-03-02',
    items: [
      { id: '1', procedure: 'Lente de Contato Dental', description: '10 unidades superiores', quantity: 10, unit_price: 2000, discount: 10, total: 18000 },
      { id: '2', procedure: 'Clareamento Dental', description: 'Previo as lentes', quantity: 1, unit_price: 800, discount: 0, total: 800 },
    ],
    subtotal: 20800, discount: 2000, total: 18800, payment_condition: '10x sem juros',
    pipeline_stage: 2,
  },
  {
    id: '2', patient_id: '3', patient_name: 'Juliana Ferreira Santos', professional: 'Dra. Marina Costa',
    created_at: '2026-02-10', valid_until: '2026-02-25',
    items: [
      { id: '3', procedure: 'Preenchimento Labial', description: '1ml', quantity: 1, unit_price: 1800, discount: 0, total: 1800 },
      { id: '4', procedure: 'Botox', description: 'Testa + periocular', quantity: 1, unit_price: 1200, discount: 0, total: 1200 },
    ],
    subtotal: 3000, discount: 0, total: 3000, payment_condition: 'A vista com 5% desconto',
    pipeline_stage: 5,
  },
  {
    id: '3', patient_id: '4', patient_name: 'Roberto Almeida', professional: 'Dr. Ricardo Nunes',
    created_at: '2026-02-18', valid_until: '2026-03-05',
    items: [
      { id: '5', procedure: 'Clareamento Dental', description: 'Laser em consultorio', quantity: 1, unit_price: 800, discount: 0, total: 800 },
    ],
    subtotal: 800, discount: 0, total: 800, payment_condition: 'A vista',
    pipeline_stage: 4,
  },
];

export const mockTeam: TeamMember[] = [
  { id: '1', name: 'Dra. Marina Costa', email: 'marina@clinica.com', role: 'clinic_staff', specialty: 'Dermatologia', active: true },
  { id: '2', name: 'Dr. Ricardo Nunes', email: 'ricardo@clinica.com', role: 'clinic_staff', specialty: 'Odontologia Estetica', active: true },
  { id: '3', name: 'Camila Souza', email: 'camila@clinica.com', role: 'clinic_receptionist', active: true },
  { id: '4', name: 'Dr. Paulo Henrique', email: 'paulo@clinica.com', role: 'clinic_staff', specialty: 'Cirurgia Plastica', active: false },
];

// Dashboard data
export const dashboardData = {
  leadsThisMonth: 24,
  leadsLastMonth: 18,
  appointmentsThisWeek: 32,
  appointmentsConfirmed: 28,
  pendingBudgets: 42600,
  revenueThisMonth: 87500,
  conversionRate: 35,
  avgResponseTime: 12,
  weeklyLeads: [
    { week: 'Sem 1', leads: 5 },
    { week: 'Sem 2', leads: 8 },
    { week: 'Sem 3', leads: 3 },
    { week: 'Sem 4', leads: 6 },
    { week: 'Sem 5', leads: 9 },
    { week: 'Sem 6', leads: 4 },
    { week: 'Sem 7', leads: 7 },
    { week: 'Sem 8', leads: 6 },
  ],
  leadsByOrigin: [
    { origin: 'Google Ads', value: 35 },
    { origin: 'Instagram Ads', value: 28 },
    { origin: 'Indicacao', value: 20 },
    { origin: 'Organico', value: 10 },
    { origin: 'Site', value: 5 },
    { origin: 'Walk-in', value: 2 },
  ],
  monthlyRevenue: [
    { month: 'Set', value: 62000 },
    { month: 'Out', value: 71000 },
    { month: 'Nov', value: 68000 },
    { month: 'Dez', value: 95000 },
    { month: 'Jan', value: 82000 },
    { month: 'Fev', value: 87500 },
  ],
  topProcedures: [
    { name: 'Harmonizacao', count: 18 },
    { name: 'Botox', count: 32 },
    { name: 'Lentes', count: 8 },
    { name: 'Preenchimento', count: 14 },
    { name: 'Clareamento', count: 11 },
  ],
  lossReasons: [
    { reason: 'Preco', value: 35 },
    { reason: 'Concorrente', value: 15 },
    { reason: 'Timing', value: 20 },
    { reason: 'Nao respondeu', value: 25 },
    { reason: 'Outro', value: 5 },
  ],
  funnel: [
    { stage: 'Leads', value: 100 },
    { stage: 'Agendaram', value: 65 },
    { stage: 'Avaliaram', value: 50 },
    { stage: 'Orcaram', value: 38 },
    { stage: 'Fecharam', value: 25 },
  ],
};

export const activityLog = [
  { id: '1', type: 'whatsapp', description: 'Mensagem enviada: confirmacao de consulta', date: '2026-02-24T10:30:00', user: 'Camila Souza' },
  { id: '2', type: 'appointment', description: 'Agendamento criado: Botox com Dra. Marina', date: '2026-02-24T09:15:00', user: 'Camila Souza' },
  { id: '3', type: 'budget', description: 'Orcamento enviado: R$ 3.000', date: '2026-02-23T16:00:00', user: 'Dra. Marina Costa' },
  { id: '4', type: 'note', description: 'Paciente demonstrou interesse em skinbooster', date: '2026-02-23T14:30:00', user: 'Dra. Marina Costa' },
  { id: '5', type: 'payment', description: 'Pagamento recebido: R$ 1.200 (Botox)', date: '2026-02-22T11:00:00', user: 'Sistema' },
  { id: '6', type: 'pipeline', description: 'Movido para "Tratamento Iniciado"', date: '2026-02-22T10:00:00', user: 'Camila Souza' },
];
