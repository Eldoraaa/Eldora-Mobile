export interface DeviceStatus {
  id: string;
  deviceId: string;
  name: string;
  elderName?: string;
  isOnline: boolean;
  lastSeen: string | null;
  batteryLevel?: number | null;
  isCharging?: boolean;
  wifiSsid?: string | null;
  wifiRssi?: number | null;
  firmwareVersion?: string | null;
}

export interface HomeSummary {
  devices: DeviceStatus[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmergencyContactPayload {
  name: string;
  phone: string;
  relation?: string | null;
  isPrimary?: boolean;
  homeId?: string | null;
}

export interface WellnessSummary {
  period: string;
  moodTrend: "stable" | "needs_attention" | "distressed" | string;
  distressLevel: "low" | "medium" | "high" | string;
  distressScore: number;
  interactionSummary: string;
  careSignals: string[];
  recommendation: string;
  generatedAt: string;
  voiceEmotionSummary: {
    totalInteractions: number;
    dominantEmotion: "distressed" | "anxious" | "sad" | "positive" | null;
    breakdown: {
      distressed: number;
      anxious: number;
      sad: number;
      positive: number;
      neutral: number;
    };
  };
}

export interface SafetySummary {
  elder: { name: string; primaryDeviceId: string } | null;
  status: "safe" | "needs_attention" | "device_offline" | "setup_needed";
  openAlert: {
    id: string;
    type: "alarm" | "home" | "device";
    title: string;
    body: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  } | null;
  latestEvent: {
    id: string;
    type: "alarm" | "home" | "device";
    title: string;
    body: string | null;
    createdAt: string;
  } | null;
  emergencyContact: EmergencyContact | null;
  unresolvedAlertCount: number;
  risk: {
    score: number;
    level: "low" | "medium" | "high";
    anomalyFlags: string[];
    recommendation: string;
  };
  devices: DeviceStatus[];
}

export type HomeMemberRole = "Home Owner" | "Administrator" | "Common Member";
export type HomeMemberRoleInput =
  | "home_owner"
  | "administrator"
  | "common_member";

export interface HomeListItem {
  id: string;
  name: string;
  locationLabel: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  roomCount: number;
  memberCount: number;
  role: HomeMemberRole;
}

export interface HomeMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: HomeMemberRole;
}

export interface HomeInvitation {
  id: string;
  email: string | null;
  role: HomeMemberRole;
  status: string;
  inviteCode: string;
  expiresAt: string;
}

export interface HomeSettings {
  id: string;
  name: string;
  locationLabel: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  roomCount: number;
  memberCount: number;
  rooms: Array<{
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isDefault: boolean;
    deviceCount: number;
  }>;
  members: HomeMember[];
  invitations: HomeInvitation[];
}

export interface CreateHomePayload {
  name: string;
}

export interface JoinHomePayload {
  inviteCode: string;
}

export interface CreateHomeInvitationPayload {
  email?: string | null;
  role?: HomeMemberRoleInput;
}

export interface UpdateHomePayload {
  name?: string;
  locationLabel?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
