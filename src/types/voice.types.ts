export type ElderReminderStatus =
  | "pending"
  | "queued"
  | "delivered"
  | "acknowledged"
  | "cancelled"
  | "failed"
  | "needs_confirmation";

export type ElderReminder = {
  id: string;
  source: "voice" | "caregiver" | "scene";
  title: string;
  message: string;
  dueAt: string;
  timezone: string;
  recurrenceRule: string | null;
  status: ElderReminderStatus;
  deliveredAt: string | null;
  acknowledgedAt: string | null;
  cancelledAt: string | null;
  failedAt: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  device: { id: string; name: string | null; deviceId: string };
  elderProfile: { id: string; name: string };
  home: { id: string; name: string } | null;
};
