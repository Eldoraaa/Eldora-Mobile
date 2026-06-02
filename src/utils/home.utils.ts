export function formatExpiresIn(isoString: string) {
  const diffMs = new Date(isoString).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";

  const diffMins = Math.ceil(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} mins left`;

  const diffHours = Math.ceil(diffMins / 60);
  return `${diffHours} hours left`;
}
