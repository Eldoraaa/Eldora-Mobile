import { QueryClient } from "@tanstack/react-query";

function byteLength(value: unknown) {
  try {
    return new Blob([JSON.stringify(value)]).size;
  } catch {
    return 0;
  }
}

export function getQueryCacheSize(queryClient: QueryClient) {
  return queryClient
    .getQueryCache()
    .getAll()
    .reduce((total, query) => total + byteLength(query.state.data), 0);
}

export function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
