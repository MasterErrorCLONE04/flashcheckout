export interface StoreSettingsData {
  id: string;
  name: string;
  whatsapp: string;
  bio: string | null;
  logoUrl: string | null;
  category?: string | null;
  stripeConnectAccountId?: string | null;
  stripeConnectChargesEnabled?: boolean;
  mpAccessToken?: string | null;
  mpPublicKey?: string | null;
  mpConnected?: boolean;
  mpUserId?: string | null;
  whatsappInstanceName?: string | null;
  whatsappConnected?: boolean;
  settings?: any;
}

export interface BrebConfig {
  enabled: boolean;
  keyType: string;
  keyValue: string;
  bankProvider: string;
  merchantDisplayName: string;
  participantId: string;
  keyTypeCode: string;
  verificationStatus: string;
}

export interface ScheduleDay {
  key: string;
  label: string;
  from: string;
  to: string;
  enabled: boolean;
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface ActivityLogEntry {
  event: string;
  detail: string;
  user: string;
  time: string;
}

export interface StoreFormState {
  name: string;
  whatsapp: string;
  bio: string;
  category: string;
  logoFile: File | null;
  contactEmail: string;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  isActive: boolean;
  botEnabled: boolean;
  autoReply: boolean;
  humanHandoff: boolean;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  country: string;
}

export interface NotificationSettings {
  orderWhatsapp: boolean;
  orderEmail: boolean;
  resumenEmail: boolean;
  resumenWhatsapp: boolean;
  stockWhatsapp: boolean;
  stockEmail: boolean;
  esperaWhatsapp: boolean;
  esperaEmail: boolean;
}
