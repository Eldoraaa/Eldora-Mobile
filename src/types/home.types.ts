export interface DeviceStatus {
  id: string;
  deviceId: string;
  name: string;
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
