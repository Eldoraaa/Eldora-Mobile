export type AlertPriority = "critical" | "high" | "medium" | "low";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: AlertPriority;
  status: AlertStatus;
  createdAt: string;
  eventType: string;
}
