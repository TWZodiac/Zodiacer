import { emptyProfile, type Profile } from "@/domain/profile";

const KEY = "zodiacer.profile.v1";

export function loadProfile(): Profile {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Profile;
    return parsed.version === 1 ? parsed : emptyProfile();
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(profile: Profile): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // 無痕模式或儲存空間滿時，只是不保存進度
  }
}

/** 匯出成 JSON 檔，之後可以拿來校正題庫權重 */
export function downloadProfile(profile: Profile): void {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zodiacer-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
