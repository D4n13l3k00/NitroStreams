export const SETTINGS_CSS = `
.nitrostreams-settings { color:var(--text-normal, var(--text-default)); font-size:14px; line-height:1.4; padding:0; }
.nitrostreams-settings .ns-row { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:12px 0; }
.nitrostreams-settings .ns-copy { min-width:0; flex:1; }
.nitrostreams-settings .ns-title { display:block; font-size:16px; font-weight:500; }
.nitrostreams-settings .ns-description { color:var(--text-muted); font-size:12px; margin:4px 0 0; overflow-wrap:anywhere; }
.nitrostreams-settings .ns-section { border-top:1px solid var(--background-modifier-accent, var(--border-subtle)); margin-top:8px; padding-top:8px; }
.nitrostreams-settings .ns-toggle { appearance:none; -webkit-appearance:none; position:relative; flex:none; width:44px; height:24px; margin:0; border:1px solid var(--background-modifier-accent, #45454b); border-radius:14px; background:var(--background-tertiary, #232428); cursor:pointer; }
.nitrostreams-settings .ns-toggle::after { content:""; position:absolute; width:18px; height:18px; border-radius:50%; background:#fff; top:2px; left:2px; transition:transform .15s ease; }
.nitrostreams-settings .ns-toggle:checked { background:var(--brand-500, #5865f2); border-color:var(--brand-500, #5865f2); }
.nitrostreams-settings .ns-toggle:checked::after { transform:translateX(20px); }
.nitrostreams-settings .ns-buttons { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
.nitrostreams-settings button { min-height:36px; padding:8px 16px; border:0; border-radius:6px; background:var(--button-secondary-background, #4e5058); color:var(--button-secondary-text, #fff); font:inherit; font-weight:500; cursor:pointer; }
.nitrostreams-settings button.ns-primary { background:var(--brand-500, #5865f2); color:#fff; }
.nitrostreams-settings button:hover:not(:disabled) { filter:brightness(1.12); }
.nitrostreams-settings button:disabled { opacity:.5; cursor:not-allowed; }
.nitrostreams-settings button[hidden] { display:none; }
.nitrostreams-settings .ns-donate { display:inline-flex; align-items:center; justify-content:center; min-height:36px; box-sizing:border-box; padding:8px 16px; border-radius:6px; background:var(--button-secondary-background, #4e5058); color:var(--button-secondary-text, #fff); font-weight:500; text-decoration:none; white-space:nowrap; }
.nitrostreams-settings .ns-donate:hover { filter:brightness(1.12); }
.nitrostreams-settings :is(button,input,a):focus-visible { outline:2px solid var(--brand-500, #5865f2); outline-offset:3px; }
@media (prefers-reduced-motion:reduce) { .nitrostreams-settings .ns-toggle::after { transition:none; } }
@media (max-width:480px) { .nitrostreams-settings .ns-row { gap:12px; flex-wrap:wrap; } }
`;

export function settingsRow(title, description, control = null) {
  const row = document.createElement(control?.type === "checkbox" ? "label" : "div");
  row.className = "ns-row";
  const copy = document.createElement("div");
  copy.className = "ns-copy";
  const heading = document.createElement("span");
  heading.className = "ns-title";
  heading.textContent = title;
  description.className = "ns-description";
  copy.append(heading, description);
  row.append(copy);
  if (control) row.append(control);
  return row;
}
