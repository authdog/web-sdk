/**
 * Opens `url` in the user's default browser via Electron's `shell.openExternal`.
 *
 * The `electron` module is loaded only when this runs, so unit tests and the
 * renderer (where `electron` is not installed) can inject their own opener
 * instead of importing this helper.
 */
export const openExternal = async (url: string): Promise<void> => {
  const importer = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<{
    shell: { openExternal: (target: string) => Promise<void> | void };
  }>;
  const electron = await importer("electron");
  await electron.shell.openExternal(url);
};

export interface ElectronShell {
  openExternal: (url: string) => Promise<void> | void;
}

/** Adapts an Electron `shell` (or a test double) to the client `openUrl` hook. */
export const createElectronOpener =
  (shell: ElectronShell): ((url: string) => Promise<void>) =>
  async (url: string) => {
    await shell.openExternal(url);
  };
