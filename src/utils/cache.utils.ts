import * as FileSystem from "expo-file-system/legacy";
import { QueryClient } from "@tanstack/react-query";

function byteLength(value: unknown) {
  try {
    return new Blob([JSON.stringify(value)]).size;
  } catch {
    return 0;
  }
}

async function getDirectorySize(uri?: string | null): Promise<number> {
  if (!uri) return 0;

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return 0;
    if (!info.isDirectory) return info.size ?? 0;

    const entries = await FileSystem.readDirectoryAsync(uri);
    const sizes = await Promise.all(
      entries.map((entry) => getDirectorySize(`${uri}${entry}`))
    );
    return sizes.reduce((total, size) => total + size, 0);
  } catch {
    return 0;
  }
}

async function clearDirectory(uri?: string | null): Promise<void> {
  if (!uri) return;

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || !info.isDirectory) return;

    const entries = await FileSystem.readDirectoryAsync(uri);
    await Promise.all(
      entries.map((entry) =>
        FileSystem.deleteAsync(`${uri}${entry}`, { idempotent: true })
      )
    );
  } catch {
    return;
  }
}

export function getQueryCacheSize(queryClient: QueryClient) {
  return queryClient
    .getQueryCache()
    .getAll()
    .reduce((total, query) => total + byteLength(query.state.data), 0);
}

export async function getAppCacheSize(queryClient: QueryClient) {
  const [fileCacheSize] = await Promise.all([
    getDirectorySize(FileSystem.cacheDirectory),
  ]);

  return getQueryCacheSize(queryClient) + fileCacheSize;
}

export async function clearAppCache(queryClient: QueryClient) {
  const clearedSize = await getAppCacheSize(queryClient);
  queryClient.clear();
  await clearDirectory(FileSystem.cacheDirectory);
  return clearedSize;
}

export function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
