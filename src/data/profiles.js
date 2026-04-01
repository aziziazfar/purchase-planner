const PROFILES_KEY = 'purchase_planner_profiles';

export function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function addProfile(profiles, name) {
  const updated = [...profiles, { id: crypto.randomUUID(), name: name.trim() }];
  saveProfiles(updated);
  return updated;
}

export function deleteProfile(profiles, id) {
  const updated = profiles.filter((p) => p.id !== id);
  saveProfiles(updated);
  return updated;
}
