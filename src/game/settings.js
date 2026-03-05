const SETTINGS_KEY = "pvz_clone_settings";

const DEFAULT_SETTINGS = Object.freeze({
  difficulty: "normal",
  muted: true
});

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    return {
      difficulty: parsed.difficulty ?? DEFAULT_SETTINGS.difficulty,
      muted: typeof parsed.muted === "boolean" ? parsed.muted : DEFAULT_SETTINGS.muted
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const nextSettings = {
    difficulty: settings.difficulty ?? DEFAULT_SETTINGS.difficulty,
    muted: typeof settings.muted === "boolean" ? settings.muted : DEFAULT_SETTINGS.muted
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  return nextSettings;
}

export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

export function getSettingsKey() {
  return SETTINGS_KEY;
}
