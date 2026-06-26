export type MemoryFact = {
  id: string;
  type: string;
  key: string;
  value: string;
  confidence: number;
  status: "candidate" | "confirmed" | "rejected" | string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  elderProfileId: string;
  sourceTurnId: string | null;
  elderProfile: { id: string; name: string };
};
