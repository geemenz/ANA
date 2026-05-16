"use client";

import { useEffect, useMemo, useState } from "react";

type ThemePreset = "classic" | "midnight" | "mint";
type HeaderStyle = "centered" | "compact";
type WallpaperStyle = "solid" | "gradient" | "pattern";
type ButtonStyle = "rounded" | "pill" | "outline";
type FontStyle = "modern" | "serif" | "mono";

type DesignSettings = {
  theme: ThemePreset;
  header: HeaderStyle;
  wallpaper: WallpaperStyle;
  button: ButtonStyle;
  font: FontStyle;
  primaryColor: string;
  accentColor: string;
  showFooter: boolean;
  username: string;
  bio: string;
};

const STORAGE_KEY = "design-mvp-settings";

const baseSettings: DesignSettings = {
  theme: "classic",
  header: "centered",
  wallpaper: "gradient",
  button: "rounded",
  font: "modern",
  primaryColor: "#0f172a",
  accentColor: "#22c55e",
  showFooter: true,
  username: "@demo_creator",
  bio: "Designer, maker, and coffee enthusiast"
};

const themeDefaults: Record<ThemePreset, Pick<DesignSettings, "primaryColor" | "accentColor" | "wallpaper" | "button" | "font">> = {
  classic: {
    primaryColor: "#0f172a",
    accentColor: "#22c55e",
    wallpaper: "gradient",
    button: "rounded",
    font: "modern"
  },
  midnight: {
    primaryColor: "#111827",
    accentColor: "#38bdf8",
    wallpaper: "solid",
    button: "pill",
    font: "mono"
  },
  mint: {
    primaryColor: "#064e3b",
    accentColor: "#14b8a6",
    wallpaper: "pattern",
    button: "outline",
    font: "serif"
  }
};

export default function Page() {
  const [settings, setSettings] = useState<DesignSettings>(baseSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DesignSettings;
        setSettings({ ...baseSettings, ...parsed });
      } catch {
        setSettings(baseSettings);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, ready]);

  const previewStyles = useMemo(() => {
    const fontFamilyMap: Record<FontStyle, string> = {
      modern: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif",
      serif: "\"Lora\", ui-serif, Georgia, serif",
      mono: "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, monospace"
    };

    const wallpaperMap: Record<WallpaperStyle, string> = {
      solid: settings.primaryColor,
      gradient: `linear-gradient(160deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
      pattern: `radial-gradient(circle at 20% 20%, ${settings.accentColor} 10%, transparent 11%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.35) 8%, transparent 9%), linear-gradient(160deg, ${settings.primaryColor} 0%, ${settings.primaryColor} 100%)`
    };

    return {
      fontFamily: fontFamilyMap[settings.font],
      background: wallpaperMap[settings.wallpaper],
      color: "#ffffff"
    };
  }, [settings]);

  const applyThemePreset = (theme: ThemePreset) => {
    const selected = themeDefaults[theme];
    setSettings((prev) => ({ ...prev, theme, ...selected }));
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">LinkDesk</div>
        <nav>
          <button className="nav-item active">Design</button>
          <button className="nav-item" disabled>Links</button>
          <button className="nav-item" disabled>Analytics</button>
          <button className="nav-item" disabled>Audience</button>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <h1>Design Customization</h1>
          <p>Customize your page style and watch the preview update in real time.</p>
        </header>

        <section className="cards-grid">
          <Card title="Theme">
            <div className="button-group">
              {(["classic", "midnight", "mint"] as ThemePreset[]).map((theme) => (
                <button
                  key={theme}
                  className={settings.theme === theme ? "chip active" : "chip"}
                  onClick={() => applyThemePreset(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Header">
            <Select
              value={settings.header}
              onChange={(value) => setSettings((s) => ({ ...s, header: value as HeaderStyle }))}
              options={[
                { label: "Centered", value: "centered" },
                { label: "Compact", value: "compact" }
              ]}
            />
          </Card>

          <Card title="Wallpaper">
            <Select
              value={settings.wallpaper}
              onChange={(value) => setSettings((s) => ({ ...s, wallpaper: value as WallpaperStyle }))}
              options={[
                { label: "Solid", value: "solid" },
                { label: "Gradient", value: "gradient" },
                { label: "Pattern", value: "pattern" }
              ]}
            />
          </Card>

          <Card title="Buttons">
            <Select
              value={settings.button}
              onChange={(value) => setSettings((s) => ({ ...s, button: value as ButtonStyle }))}
              options={[
                { label: "Rounded", value: "rounded" },
                { label: "Pill", value: "pill" },
                { label: "Outline", value: "outline" }
              ]}
            />
          </Card>

          <Card title="Text">
            <Select
              value={settings.font}
              onChange={(value) => setSettings((s) => ({ ...s, font: value as FontStyle }))}
              options={[
                { label: "Modern", value: "modern" },
                { label: "Serif", value: "serif" },
                { label: "Mono", value: "mono" }
              ]}
            />
            <input
              className="text-input"
              value={settings.username}
              onChange={(e) => setSettings((s) => ({ ...s, username: e.target.value }))}
              placeholder="Username"
            />
            <textarea
              className="text-input"
              value={settings.bio}
              onChange={(e) => setSettings((s) => ({ ...s, bio: e.target.value }))}
              placeholder="Bio (optional)"
              rows={2}
            />
          </Card>

          <Card title="Colors">
            <label className="color-row">
              Primary
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
              />
            </label>
            <label className="color-row">
              Accent
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
              />
            </label>
          </Card>

          <Card title="Footer">
            <label className="toggle-row">
              Show footer
              <input
                type="checkbox"
                checked={settings.showFooter}
                onChange={(e) => setSettings((s) => ({ ...s, showFooter: e.target.checked }))}
              />
            </label>
          </Card>
        </section>
      </main>

      <aside className="preview-panel">
        <div className="phone-frame">
          <div className="phone-screen" style={previewStyles}>
            <div className={settings.header === "compact" ? "profile compact" : "profile centered"}>
              <div className="avatar" />
              <h2>{settings.username || "@username"}</h2>
              {settings.bio.trim() && <p>{settings.bio}</p>}
            </div>

            <div className="links">
              <button className={`preview-button ${settings.button}`}>
                Visit my portfolio
              </button>
              <button className={`preview-button ${settings.button}`}>
                Book a call
              </button>
            </div>

            {settings.showFooter && <footer>Made with LinkDesk</footer>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </article>
  );
}

function Select({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
