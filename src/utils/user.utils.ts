export function maskEmail(email?: string | null) {
  if (!email) return "-";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 3);
  return `${visible}${"*".repeat(Math.max(4, name.length - 3))}@${domain}`;
}

export function userCode(id?: string) {
  if (!id) return "-";
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(-10) || "-";
}
