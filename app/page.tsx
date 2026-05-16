"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "design" | "links" | "analytics" | "audience";
type ThemePreset = "classic" | "midnight" | "mint";
type HeaderStyle = "centered" | "compact";
type WallpaperStyle = "solid" | "gradient" | "pattern";
type ButtonStyle = "rounded" | "pill" | "outline";
type FontStyle = "modern" | "serif" | "mono";

type LinkItem = { id: string; title: string; url: string; isActive: boolean; order: number };
type ProfileData = { username: string; displayName: string; bio: string; avatar: string };
type DesignData = {
  theme: ThemePreset;
  headerStyle: HeaderStyle;
  wallpaper: WallpaperStyle;
  buttonStyle: ButtonStyle;
  font: FontStyle;
  primaryColor: string;
  accentColor: string;
  showFooter: boolean;
};
type AnalyticsData = { views: number; totalClicks: number; linkClicks: Record<string, number> };
type AudienceData = { enabled: boolean; placeholder: string; buttonText: string; emails: string[] };
type SocialPlatform = "tiktok" | "whatsapp" | "instagram" | "youtube" | "x" | "facebook" | "linkedin" | "email";
type SocialAccount = {
  platform: SocialPlatform;
  label: string;
  username?: string;
  url: string;
  phone?: string;
  message?: string;
  subject?: string;
  body?: string;
};
type LinkDeskData = {
  profile: ProfileData;
  design: DesignData;
  links: LinkItem[];
  analytics: AnalyticsData;
  audience: AudienceData;
  socials: Partial<Record<SocialPlatform, SocialAccount>>;
};

const STORAGE_KEY = "linkdesk_mvp_data";

const defaultData: LinkDeskData = {
  profile: {
    username: "demo_creator",
    displayName: "@demo_creator",
    bio: "Designer, maker, and coffee enthusiast",
    avatar: "DL"
  },
  design: {
    theme: "classic",
    headerStyle: "centered",
    wallpaper: "gradient",
    buttonStyle: "rounded",
    font: "modern",
    primaryColor: "#0f172a",
    accentColor: "#22c55e",
    showFooter: true
  },
  links: [
    { id: "l1", title: "Visit my portfolio", url: "https://example.com", isActive: true, order: 0 },
    { id: "l2", title: "Book a call", url: "https://example.com/call", isActive: true, order: 1 },
    { id: "l3", title: "WhatsApp", url: "https://wa.me/100000000", isActive: true, order: 2 }
  ],
  analytics: { views: 120, totalClicks: 36, linkClicks: { l1: 14, l2: 12, l3: 10 } },
  audience: { enabled: false, placeholder: "Enter your email", buttonText: "Subscribe", emails: [] },
  socials: {}
};

const themeDefaults: Record<ThemePreset, Pick<DesignData, "primaryColor" | "accentColor" | "wallpaper" | "buttonStyle" | "font">> = {
  classic: { primaryColor: "#0f172a", accentColor: "#22c55e", wallpaper: "gradient", buttonStyle: "rounded", font: "modern" },
  midnight: { primaryColor: "#111827", accentColor: "#38bdf8", wallpaper: "solid", buttonStyle: "pill", font: "mono" },
  mint: { primaryColor: "#064e3b", accentColor: "#14b8a6", wallpaper: "pattern", buttonStyle: "outline", font: "serif" }
};

export default function Page() {
  const [tab, setTab] = useState<Tab>("design");
  const [data, setData] = useState<LinkDeskData>(defaultData);
  const [draftEmail, setDraftEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(null);
  const [socialDraft, setSocialDraft] = useState<Record<string, string>>({});
  const [socialError, setSocialError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<LinkDeskData>;
        setData({ ...defaultData, ...parsed, profile: { ...defaultData.profile, ...parsed.profile }, design: { ...defaultData.design, ...parsed.design }, audience: { ...defaultData.audience, ...parsed.audience }, analytics: { ...defaultData.analytics, ...parsed.analytics }, socials: { ...defaultData.socials, ...parsed.socials } });
      } catch {
        setData(defaultData);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const showToast = (message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2000);
  };

  const activeLinks = useMemo(() => [...data.links].sort((a, b) => a.order - b.order).filter((l) => l.isActive), [data.links]);

  const previewStyles = useMemo(() => {
    const fontFamilyMap: Record<FontStyle, string> = {
      modern: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif",
      serif: "\"Lora\", ui-serif, Georgia, serif",
      mono: "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, monospace"
    };
    const wallpaperMap: Record<WallpaperStyle, string> = {
      solid: data.design.primaryColor,
      gradient: `linear-gradient(160deg, ${data.design.primaryColor} 0%, ${data.design.accentColor} 100%)`,
      pattern: `radial-gradient(circle at 20% 20%, ${data.design.accentColor} 10%, transparent 11%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.35) 8%, transparent 9%), linear-gradient(160deg, ${data.design.primaryColor} 0%, ${data.design.primaryColor} 100%)`
    };
    return { fontFamily: fontFamilyMap[data.design.font], background: wallpaperMap[data.design.wallpaper], color: "#ffffff" };
  }, [data.design]);

  const updateDesign = (patch: Partial<DesignData>) => setData((p) => ({ ...p, design: { ...p.design, ...patch } }));
  const updateProfile = (patch: Partial<ProfileData>) => setData((p) => ({ ...p, profile: { ...p.profile, ...patch } }));

  const addLink = () => {
    setData((p) => ({ ...p, links: [...p.links, { id: crypto.randomUUID(), title: "New Link", url: "https://example.com", isActive: true, order: p.links.length }] }));
    showToast("Link added");
  };

  const moveLink = (id: string, direction: -1 | 1) => {
    setData((p) => {
      const sorted = [...p.links].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((l) => l.id === id);
      const other = idx + direction;
      if (idx < 0 || other < 0 || other >= sorted.length) return p;
      [sorted[idx], sorted[other]] = [sorted[other], sorted[idx]];
      return { ...p, links: sorted.map((l, i) => ({ ...l, order: i })) };
    });
  };

  const trackClick = (id: string) => {
    setData((p) => ({ ...p, analytics: { ...p.analytics, totalClicks: p.analytics.totalClicks + 1, linkClicks: { ...p.analytics.linkClicks, [id]: (p.analytics.linkClicks[id] || 0) + 1 } } }));
    showToast("Click tracked");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "linkdesk-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const platformMeta: { id: SocialPlatform; name: string; icon: string }[] = [
    { id: "tiktok", name: "TikTok", icon: "TT" },
    { id: "whatsapp", name: "WhatsApp", icon: "WA" },
    { id: "instagram", name: "Instagram", icon: "IG" },
    { id: "youtube", name: "YouTube", icon: "YT" },
    { id: "x", name: "X / Twitter", icon: "X" },
    { id: "facebook", name: "Facebook", icon: "FB" },
    { id: "linkedin", name: "LinkedIn", icon: "IN" },
    { id: "email", name: "Email", icon: "@" }
  ];

  const openSocialEditor = (platform: SocialPlatform) => {
    const existing = data.socials[platform];
    setEditingPlatform(platform);
    setSocialError("");
    setSocialDraft({
      username: existing?.username || "",
      url: existing?.url || "",
      label: existing?.label || (platform === "whatsapp" ? "WhatsApp" : platformMeta.find((p) => p.id === platform)?.name || ""),
      phone: existing?.phone || "",
      message: existing?.message || "",
      subject: existing?.subject || "",
      body: existing?.body || ""
    });
  };

  const saveSocial = () => {
    if (!editingPlatform) return;
    const d = socialDraft;
    if (editingPlatform === "tiktok") {
      if (!d.username?.trim()) return setSocialError("Username cannot be empty.");
      if (!/^https:\/\/(www\.)?tiktok\.com\//.test(d.url || "")) return setSocialError("TikTok URL must start with https://www.tiktok.com/ or https://tiktok.com/");
    }
    if (editingPlatform === "whatsapp") {
      if (!d.phone?.trim()) return setSocialError("Phone number cannot be empty.");
      if (!d.label?.trim()) return setSocialError("Display label cannot be empty.");
      const clean = (d.phone || "").replace(/\D/g, "");
      const msg = encodeURIComponent(d.message || "");
      d.url = `https://wa.me/${clean}${msg ? `?text=${msg}` : ""}`;
    }
    if (editingPlatform === "email") {
      if (!d.username?.trim()) return setSocialError("Email address cannot be empty.");
      d.url = `mailto:${d.username}?subject=${encodeURIComponent(d.subject || "")}&body=${encodeURIComponent(d.body || "")}`;
    }
    if (editingPlatform !== "whatsapp" && editingPlatform !== "tiktok" && editingPlatform !== "email") {
      if (!d.username?.trim()) return setSocialError("Username cannot be empty.");
      if (!d.url?.trim()) return setSocialError("URL cannot be empty.");
      if (!d.label?.trim()) return setSocialError("Display label cannot be empty.");
    }

    const payload: SocialAccount = {
      platform: editingPlatform,
      label: d.label || platformMeta.find((p) => p.id === editingPlatform)?.name || "",
      username: d.username,
      url: d.url || "",
      phone: d.phone,
      message: d.message,
      subject: d.subject,
      body: d.body
    };

    setData((p) => {
      let links = p.links;
      if (editingPlatform === "whatsapp") {
        const existing = links.find((l) => l.title.toLowerCase().includes("whatsapp") || l.url.includes("wa.me"));
        if (existing) {
          links = links.map((l) => (l.id === existing.id ? { ...l, title: payload.label, url: payload.url, isActive: true } : l));
        } else {
          links = [...links, { id: crypto.randomUUID(), title: payload.label, url: payload.url, isActive: true, order: links.length }];
        }
      }
      return { ...p, socials: { ...p.socials, [editingPlatform]: payload }, links };
    });

    showToast(`${platformMeta.find((p) => p.id === editingPlatform)?.name} connected`);
    setEditingPlatform(null);
  };

  const disconnectSocial = (platform: SocialPlatform) => {
    if (!window.confirm("Disconnect this social account?")) return;
    setData((p) => {
      const next = { ...p.socials };
      delete next[platform];
      return { ...p, socials: next };
    });
    showToast("Account disconnected");
    setEditingPlatform(null);
  };

  const renderMain = () => {
    if (tab === "links") {
      const sorted = [...data.links].sort((a, b) => a.order - b.order);
      return (
        <>
          <header className="page-header"><h1>Links</h1><p>Manage your public links and order.</p></header>
          <Card title="Profile Header">
            <div className="profile-head-mini">
              <div className="avatar avatar-mini">{data.profile.avatar || "DL"}</div>
              <div>
                <strong>{data.profile.displayName}</strong>
                <p>{data.profile.bio}</p>
              </div>
              <button className="subtle-btn" onClick={() => setShowSocialModal(true)}>Connect social</button>
            </div>
          </Card>
          <div className="toolbar"><button className="primary-btn" onClick={addLink}>Add Link</button><button className="subtle-btn" onClick={() => setShowSocialModal(true)}>Add social icon</button></div>
          <section className="cards-stack">
            {sorted.length === 0 && <div className="empty-state">No links yet. Add your first link.</div>}
            {sorted.map((link, i) => (
              <Card key={link.id} title={`Link #${i + 1}`}>
                <input className="text-input" value={link.title} onChange={(e) => setData((p) => ({ ...p, links: p.links.map((l) => l.id === link.id ? { ...l, title: e.target.value } : l) }))} />
                <input className="text-input" value={link.url} onChange={(e) => setData((p) => ({ ...p, links: p.links.map((l) => l.id === link.id ? { ...l, url: e.target.value } : l) }))} />
                <div className="row-actions">
                  <label><input type="checkbox" checked={link.isActive} onChange={(e) => setData((p) => ({ ...p, links: p.links.map((l) => l.id === link.id ? { ...l, isActive: e.target.checked } : l) }))} /> Active</label>
                  <button className="subtle-btn" onClick={() => moveLink(link.id, -1)}>Up</button>
                  <button className="subtle-btn" onClick={() => moveLink(link.id, 1)}>Down</button>
                  <button className="danger-btn" onClick={() => { setData((p) => ({ ...p, links: p.links.filter((l) => l.id !== link.id).map((l, idx) => ({ ...l, order: idx })) })); showToast("Link deleted"); }}>Delete</button>
                </div>
              </Card>
            ))}
          </section>
        </>
      );
    }

    if (tab === "analytics") {
      const clicks = Object.entries(data.analytics.linkClicks);
      const best = clicks.sort((a, b) => b[1] - a[1])[0];
      return (
        <>
          <header className="page-header"><h1>Analytics</h1><p>Simple demo metrics for your page.</p></header>
          <section className="cards-grid">
            <Card title="Total views"><div className="metric">{data.analytics.views}</div></Card>
            <Card title="Total clicks"><div className="metric">{data.analytics.totalClicks}</div></Card>
            <Card title="Best performing link"><div className="metric small">{best ? `${data.links.find((l) => l.id === best[0])?.title || "Unknown"} (${best[1]})` : "No data yet"}</div></Card>
            <Card title="Clicks per link">
              {activeLinks.length === 0 ? <div className="empty-state">No click data yet.</div> : activeLinks.map((l) => <div key={l.id} className="stat-row"><span>{l.title}</span><strong>{data.analytics.linkClicks[l.id] || 0}</strong></div>)}
            </Card>
          </section>
          <div className="toolbar">
            <button className="primary-btn" onClick={() => { setData((p) => ({ ...p, analytics: { ...p.analytics, views: p.analytics.views + 1 } })); showToast("Analytics updated"); }}>Simulate Visit</button>
            <button className="subtle-btn" onClick={() => { const target = activeLinks[0]?.id; if (target) trackClick(target); setData((p) => ({ ...p, analytics: { ...p.analytics, views: p.analytics.views + 1 } })); showToast("Analytics updated"); }}>Simulate Link Click</button>
          </div>
        </>
      );
    }

    if (tab === "audience") {
      return (
        <>
          <header className="page-header"><h1>Audience</h1><p>Collect demo audience emails from preview.</p></header>
          <section className="cards-stack">
            <Card title="Email Signup">
              <label className="toggle-row">Enable form<input type="checkbox" checked={data.audience.enabled} onChange={(e) => setData((p) => ({ ...p, audience: { ...p.audience, enabled: e.target.checked } }))} /></label>
              <input className="text-input" value={data.audience.placeholder} onChange={(e) => setData((p) => ({ ...p, audience: { ...p.audience, placeholder: e.target.value } }))} />
              <input className="text-input" value={data.audience.buttonText} onChange={(e) => setData((p) => ({ ...p, audience: { ...p.audience, buttonText: e.target.value } }))} />
            </Card>
            <Card title="Collected Emails">
              {data.audience.emails.length === 0 ? <div className="empty-state">No audience members yet.</div> : data.audience.emails.map((e, i) => <div key={`${e}-${i}`} className="stat-row"><span>{e}</span></div>)}
              <button className="danger-btn" onClick={() => setData((p) => ({ ...p, audience: { ...p.audience, emails: [] } }))}>Clear audience list</button>
            </Card>
            <Card title="Tools"><button className="subtle-btn" onClick={() => setShowSocialModal(true)}>Connect social media</button></Card>
          </section>
        </>
      );
    }

    return (
      <>
        <header className="page-header"><h1>Design Customization</h1><p>Customize your page style and watch the preview update in real time.</p></header>
        <div className="toolbar">
          <button className="primary-btn" onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); showToast("Design saved"); }}>Save Design</button>
          <button className="subtle-btn" onClick={() => { if (window.confirm("Reset design settings to default?")) { updateDesign(defaultData.design); showToast("Settings reset"); } }}>Reset Design</button>
          <button className="subtle-btn" onClick={() => {
            const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
            updateDesign({ theme: pick(["classic", "midnight", "mint"]), wallpaper: pick(["solid", "gradient", "pattern"]), buttonStyle: pick(["rounded", "pill", "outline"]), font: pick(["modern", "serif", "mono"]), primaryColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`, accentColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}` });
          }}>Randomize Design</button>
        </div>
        <section className="cards-grid">
          <Card title="Theme"><div className="button-group">{(["classic", "midnight", "mint"] as ThemePreset[]).map((v) => <button key={v} className={data.design.theme === v ? "chip active" : "chip"} onClick={() => updateDesign({ theme: v, ...themeDefaults[v] })}>{v}</button>)}</div></Card>
          <Card title="Header"><div className="button-group">{(["centered", "compact"] as HeaderStyle[]).map((v) => <button key={v} className={data.design.headerStyle === v ? "chip active" : "chip"} onClick={() => updateDesign({ headerStyle: v })}>{v}</button>)}</div></Card>
          <Card title="Wallpaper"><div className="button-group">{(["solid", "gradient", "pattern"] as WallpaperStyle[]).map((v) => <button key={v} className={data.design.wallpaper === v ? "chip active" : "chip"} onClick={() => updateDesign({ wallpaper: v })}>{v}</button>)}</div></Card>
          <Card title="Buttons"><div className="button-group">{(["rounded", "pill", "outline"] as ButtonStyle[]).map((v) => <button key={v} className={data.design.buttonStyle === v ? "chip active" : "chip"} onClick={() => updateDesign({ buttonStyle: v })}>{v}</button>)}</div></Card>
          <Card title="Text"><div className="button-group">{(["modern", "serif", "mono"] as FontStyle[]).map((v) => <button key={v} className={data.design.font === v ? "chip active" : "chip"} onClick={() => updateDesign({ font: v })}>{v}</button>)}</div></Card>
          <Card title="Colors"><label className="color-row">Primary<input type="color" value={data.design.primaryColor} onChange={(e) => updateDesign({ primaryColor: e.target.value })} /></label><label className="color-row">Accent<input type="color" value={data.design.accentColor} onChange={(e) => updateDesign({ accentColor: e.target.value })} /></label></Card>
          <Card title="Footer"><label className="toggle-row">Show footer<input type="checkbox" checked={data.design.showFooter} onChange={(e) => updateDesign({ showFooter: e.target.checked })} /></label></Card>
          <Card title="Profile Mini Editor"><input className="text-input" value={data.profile.username} onChange={(e) => updateProfile({ username: e.target.value })} placeholder="Username" /><input className="text-input" value={data.profile.displayName} onChange={(e) => updateProfile({ displayName: e.target.value })} placeholder="Display name" /><textarea className="text-input" rows={2} value={data.profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} /><input className="text-input" value={data.profile.avatar} onChange={(e) => updateProfile({ avatar: e.target.value })} placeholder="Avatar initials or emoji" /></Card>
        </section>
      </>
    );
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">LinkDesk</div>
        <nav>
          {(["design", "links", "analytics", "audience"] as Tab[]).map((item) => (
            <button key={item} className={tab === item ? "nav-item active" : "nav-item"} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>
          ))}
        </nav>
        <button className="subtle-btn" onClick={() => setShowSettingsModal(true)}>Settings</button>
      </aside>
      <main className="main-panel">{renderMain()}</main>
      <aside className="preview-panel">
        <div className="preview-actions">
          <button className="subtle-btn" onClick={() => { navigator.clipboard.writeText(`https://linkdesk.app/${data.profile.username}`); showToast("Link copied"); }}>Copy Page Link</button>
          <button className="subtle-btn" onClick={() => { setShowPreviewModal(true); showToast("Preview opened"); }}>Preview Mode</button>
          <button className="subtle-btn" onClick={exportJson}>Export JSON</button>
        </div>
        <PreviewCard
          data={data}
          previewStyles={previewStyles}
          activeLinks={activeLinks}
          draftEmail={draftEmail}
          setDraftEmail={setDraftEmail}
          onClickLink={trackClick}
          onSubscribe={() => {
            if (!draftEmail.trim()) return;
            setData((p) => ({ ...p, audience: { ...p.audience, emails: [...p.audience.emails, draftEmail.trim()] } }));
            setDraftEmail("");
            showToast("Audience saved");
          }}
        />
      </aside>
      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="subtle-btn close-btn" onClick={() => setShowSettingsModal(false)}>Close</button>
            <h3>Settings</h3>
            <p>Connected social accounts</p>
            <div className="connected-list">
              {Object.values(data.socials).length === 0 ? <div className="empty-state">No social accounts connected.</div> : Object.values(data.socials).map((s) => <div key={s?.platform} className="stat-row"><span>{platformMeta.find((p) => p.id === s?.platform)?.name}</span><strong>{s?.label}</strong></div>)}
            </div>
            <button className="subtle-btn" onClick={() => { setShowSettingsModal(false); setShowSocialModal(true); }}>Connect social media</button>
          </div>
        </div>
      )}
      {showSocialModal && (
        <div className="modal-overlay">
          <div className="modal-card social-modal">
            <button className="subtle-btn close-btn" onClick={() => { setShowSocialModal(false); setEditingPlatform(null); }}>Close</button>
            <h3>Connect social media</h3>
            <p>Add your social accounts to show them on your public page.</p>
            <div className="social-grid">
              {platformMeta.map((p) => {
                const connected = data.socials[p.id];
                return (
                  <div key={p.id} className="social-card">
                    <div className="social-icon">{p.icon}</div>
                    <div>
                      <strong>{p.name}</strong>
                      <div className={connected ? "badge connected" : "badge"}>{connected ? "Connected" : "Not connected"}</div>
                      {connected && <small>{connected.username || connected.label}</small>}
                    </div>
                    <div className="row-actions">
                      {!connected && <button className="subtle-btn" onClick={() => openSocialEditor(p.id)}>Connect</button>}
                      {connected && <button className="subtle-btn" onClick={() => openSocialEditor(p.id)}>Edit</button>}
                      {connected && <button className="danger-btn" onClick={() => disconnectSocial(p.id)}>Disconnect</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            {editingPlatform && (
              <Card title={`Edit ${platformMeta.find((p) => p.id === editingPlatform)?.name}`}>
                {editingPlatform !== "whatsapp" && editingPlatform !== "email" && <input className="text-input" placeholder="Username or handle" value={socialDraft.username || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, username: e.target.value }))} />}
                {editingPlatform === "email" && <input className="text-input" placeholder="Email address" value={socialDraft.username || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, username: e.target.value }))} />}
                {editingPlatform === "whatsapp" && <input className="text-input" placeholder="WhatsApp phone number" value={socialDraft.phone || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, phone: e.target.value }))} />}
                {editingPlatform !== "email" && editingPlatform !== "whatsapp" && <input className="text-input" placeholder="Profile URL" value={socialDraft.url || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, url: e.target.value }))} />}
                {editingPlatform !== "tiktok" && <input className="text-input" placeholder="Display label" value={socialDraft.label || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, label: e.target.value }))} />}
                {editingPlatform === "whatsapp" && <input className="text-input" placeholder="Optional pre-filled message" value={socialDraft.message || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, message: e.target.value }))} />}
                {editingPlatform === "email" && <input className="text-input" placeholder="Subject" value={socialDraft.subject || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, subject: e.target.value }))} />}
                {editingPlatform === "email" && <textarea className="text-input" placeholder="Body" rows={2} value={socialDraft.body || ""} onChange={(e) => setSocialDraft((p) => ({ ...p, body: e.target.value }))} />}
                {socialError && <div className="error-text">{socialError}</div>}
                <div className="row-actions"><button className="primary-btn" onClick={saveSocial}>Save</button><button className="subtle-btn" onClick={() => setEditingPlatform(null)}>Cancel</button></div>
              </Card>
            )}
          </div>
        </div>
      )}
      {showPreviewModal && <div className="modal-overlay"><div className="modal-card"><button className="subtle-btn close-btn" onClick={() => setShowPreviewModal(false)}>Close</button><PreviewCard data={data} previewStyles={previewStyles} activeLinks={activeLinks} draftEmail={draftEmail} setDraftEmail={setDraftEmail} onClickLink={trackClick} onSubscribe={() => {}} /></div></div>}
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className="toast">{t.message}</div>)}</div>
    </div>
  );
}

function PreviewCard({ data, previewStyles, activeLinks, draftEmail, setDraftEmail, onClickLink, onSubscribe }: { data: LinkDeskData; previewStyles: React.CSSProperties; activeLinks: LinkItem[]; draftEmail: string; setDraftEmail: (v: string) => void; onClickLink: (id: string) => void; onSubscribe: () => void }) {
  const socials = Object.values(data.socials).filter(Boolean) as SocialAccount[];
  return (
    <div className="phone-frame"><div className="phone-screen" style={previewStyles}><div className={data.design.headerStyle === "compact" ? "profile compact" : "profile centered"}><div className="avatar">{data.profile.avatar || "DL"}</div><h2>{data.profile.displayName || "@demo_creator"}</h2>{data.profile.bio.trim() && <p>{data.profile.bio}</p>}</div><div className="social-strip">{socials.map((s) => <button key={s.platform} className="social-pill" title={s.label}>{s.platform.slice(0, 2).toUpperCase()}</button>)}</div><div className="links">{activeLinks.map((l) => <button key={l.id} className={`preview-button ${data.design.buttonStyle}`} onClick={() => onClickLink(l.id)} title={l.url}>{l.title}</button>)}{activeLinks.length === 0 && <div className="empty-preview">No active links</div>}</div>{data.audience.enabled && <div className="audience-preview"><input className="text-input" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} placeholder={data.audience.placeholder} /><button className={`preview-button ${data.design.buttonStyle}`} onClick={onSubscribe}>{data.audience.buttonText}</button></div>}{data.design.showFooter && <footer>Made with LinkDesk</footer>}</div></div>
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
