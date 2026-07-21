export interface AuthdogStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface ChromeStorageArea {
  get(key: string, callback: (items: Record<string, unknown>) => void): void;
  set(items: Record<string, unknown>, callback?: () => void): void;
  remove(key: string, callback?: () => void): void;
}

interface ChromeApi {
  identity: {
    getRedirectURL(path?: string): string;
    launchWebAuthFlow(
      details: { url: string; interactive: boolean },
      callback: (responseUrl?: string) => void,
    ): void;
  };
  runtime: {
    lastError?: { message?: string };
  };
  storage: {
    local: ChromeStorageArea;
    onChanged?: {
      addListener(
        callback: (
          changes: Record<string, { newValue?: unknown }>,
          areaName: string,
        ) => void,
      ): void;
      removeListener(
        callback: (
          changes: Record<string, { newValue?: unknown }>,
          areaName: string,
        ) => void,
      ): void;
    };
  };
}

const getChrome = (): ChromeApi => {
  const api = (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;
  if (!api?.identity || !api.storage?.local) {
    throw new Error(
      "Authdog requires the Chrome identity and storage extension APIs",
    );
  }
  return api;
};

const getLastError = (api: ChromeApi): Error | null => {
  const message = api.runtime.lastError?.message;
  return message ? new Error(message) : null;
};

export const createChromeStorage = (): AuthdogStorage => ({
  getItem: (key) =>
    new Promise((resolve, reject) => {
      const api = getChrome();
      api.storage.local.get(key, (items) => {
        const error = getLastError(api);
        if (error) return reject(error);
        resolve(typeof items[key] === "string" ? items[key] : null);
      });
    }),
  setItem: (key, value) =>
    new Promise((resolve, reject) => {
      const api = getChrome();
      api.storage.local.set({ [key]: value }, () => {
        const error = getLastError(api);
        if (error) return reject(error);
        resolve();
      });
    }),
  removeItem: (key) =>
    new Promise((resolve, reject) => {
      const api = getChrome();
      api.storage.local.remove(key, () => {
        const error = getLastError(api);
        if (error) return reject(error);
        resolve();
      });
    }),
});

export const getAuthRedirectUrl = (): string =>
  getChrome().identity.getRedirectURL("authdog");

export const launchAuthFlow = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const api = getChrome();
    api.identity.launchWebAuthFlow(
      { url, interactive: true },
      (responseUrl) => {
        const error = getLastError(api);
        if (error) return reject(error);
        if (!responseUrl) {
          return reject(new Error("Authdog authentication was cancelled"));
        }
        resolve(responseUrl);
      },
    );
  });

export const subscribeToChromeStorage = (
  key: string,
  callback: (token: string | null) => void,
): (() => void) => {
  const changes = getChrome().storage.onChanged;
  if (!changes) return () => undefined;

  const listener = (
    values: Record<string, { newValue?: unknown }>,
    areaName: string,
  ) => {
    if (areaName !== "local" || !(key in values)) return;
    const value = values[key]?.newValue;
    callback(typeof value === "string" ? value : null);
  };

  changes.addListener(listener);
  return () => changes.removeListener(listener);
};
