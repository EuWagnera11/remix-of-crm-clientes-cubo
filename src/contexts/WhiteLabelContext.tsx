import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WhiteLabelSettings {
  clinicName: string;
  clinicSubtitle: string;
  logoUrl: string | null;
  primaryColor: string; // HSL string like "24 95% 53%"
  faviconUrl: string | null;
}

const DEFAULT_SETTINGS: WhiteLabelSettings = {
  clinicName: "CUBO",
  clinicSubtitle: "CRM",
  logoUrl: null,
  primaryColor: "24 95% 53%",
  faviconUrl: null,
};

const STORAGE_KEY = "cubo-whitelabel";

interface WhiteLabelContextType {
  settings: WhiteLabelSettings;
  updateSettings: (updates: Partial<WhiteLabelSettings>) => void;
  resetSettings: () => void;
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

function loadSettings(): WhiteLabelSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function applyPrimaryColor(hsl: string) {
  document.documentElement.style.setProperty("--primary", hsl);
  document.documentElement.style.setProperty("--ring", hsl);
  document.documentElement.style.setProperty("--sidebar-primary", hsl);
  document.documentElement.style.setProperty("--sidebar-ring", hsl);
}

function applyFavicon(url: string | null) {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url || "/favicon.ico";
}

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WhiteLabelSettings>(loadSettings);

  useEffect(() => {
    applyPrimaryColor(settings.primaryColor);
    applyFavicon(settings.faviconUrl);
    document.title = `${settings.clinicName} ${settings.clinicSubtitle}`.trim();
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<WhiteLabelSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <WhiteLabelContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const ctx = useContext(WhiteLabelContext);
  if (!ctx) throw new Error("useWhiteLabel must be used within WhiteLabelProvider");
  return ctx;
}
