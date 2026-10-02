import ReleaseUpdater from "./updater.js";
import { version } from "../package.json";
import { CREDIT_CSS, createCredit } from "./credit.js";
import { SETTINGS_CSS, settingsRow } from "./settings.js";
import { donate as donateUrl } from "../plugin.config.json";

const PLUGIN_NAME = "NitroStreams";
const FEATURE_KEYS = ["q", "X", "G"];
const REFRESH_INTERVAL_MS = 5_000;
const CREDIT_ATTRIBUTE = "data-nitrostreams-credit";
const MODAL_SELECTOR = '[data-mana-component="modal"], [role="dialog"]';
const QUALITY_DETAILS_SELECTOR = '[data-text-variant="text-xs/medium"]';
const FOOTER_SELECTOR = '[class*="footerContent_"]';
const BUTTON_SELECTOR = 'button[data-mana-component="button"]';

export default class NitroStreams {
  constructor(meta = {}, timers = null) {
    this.api = new BdApi(meta.name ?? PLUGIN_NAME);
    this.timers = timers ?? {
      setInterval: globalThis.setInterval.bind(globalThis),
      clearInterval: globalThis.clearInterval.bind(globalThis),
    };
    this.active = false;
    this.patch = null;
    this.diagnostics = { status: "stopped", calls: 0, overrides: 0 };
    this.intervalId = null;
    this.hasReportedError = false;
    this.meta = { ...meta, version: meta.version ?? version };
    this.updateIntervalId = null;
    this.generation = 0;
    this.autoUpdate = this.api.Data?.load("autoUpdate") !== false;
    this.showCredit = this.api.Data?.load("showCredit") !== false;
    this.updater = null;
    this.refreshSettings = null;
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.generation++;
    this.diagnostics = { status: "searching", calls: 0, overrides: 0 };
    this.api.DOM?.addStyle(CREDIT_CSS);
    this.applyNitro();
    this.injectCredit();
    this.intervalId = this.timers.setInterval(
      () => { if (this.applyNitro()) this.injectCredit(); this.refreshSettings?.(); },
      REFRESH_INTERVAL_MS,
    );
    this.startUpdater();
  }

  stop() {
    this.active = false;
    this.generation++;
    if (this.updateIntervalId !== null) {
      this.timers.clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
    if (this.intervalId !== null) {
      this.timers.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.restorePermissionCheck();
    this.removeCredit();
    this.api.DOM?.removeStyle();
    this.diagnostics.status = "stopped";
    this.hasReportedError = false;
    this.refreshSettings?.();
    this.refreshSettings = null;
  }

  observer(mutation) {
    if (!this.active) return;
    if (!mutation?.addedNodes) {
      this.injectCredit();
      return;
    }

    const modals = new Set();
    const target = mutation.target?.nodeType === 1 ? mutation.target : mutation.target?.parentElement;
    const targetModal = target?.closest?.(MODAL_SELECTOR);
    if (targetModal) modals.add(targetModal);
    for (const node of mutation.addedNodes) {
      if (!node || typeof node.querySelector !== "function") continue;

      const modal = node.matches?.(MODAL_SELECTOR)
        ? node
        : (node.closest?.(MODAL_SELECTOR) ?? node.querySelector(MODAL_SELECTOR));
      if (modal) modals.add(modal);
    }

    for (const modal of modals) this.injectCredit(modal);
  }

  applyNitro() {
    if (!this.active) return false;
    if (this.patch) return true;
    try {
      const sourceFilter = this.api.Webpack.Filters.bySource(
        "canStreamQuality",
      );
      const modules = this.api.Webpack.getModule(
        (_exports, module) => {
          try {
            const declarations = module?.declarations;
            return sourceFilter(_exports, module) &&
              typeof declarations?.e_ === "function" &&
              FEATURE_KEYS.every((key) => declarations[key] != null);
          } catch {
            return false;
          }
        },
        { raw: true, first: false, searchExports: false, searchDefault: false },
      );
      if (!Array.isArray(modules) || modules.length !== 1) {
        throw new Error(`Expected one permission module, found ${modules?.length ?? 0}`);
      }
      const rawModule = modules[0];
      const declarations = rawModule?.declarations;
      if (!declarations) {
        this.reportError("Permission module not found. Check BetterDiscord and Discord updates.");
        return false;
      }
      const original = declarations.e_;
      const features = new Set(FEATURE_KEYS.map((key) => declarations[key]));
      if (features.size !== 3 || [...features].some((feature) =>
        !["object", "function"].includes(typeof feature))) {
        throw new Error("Feature identities q/X/G are ambiguous");
      }
      const plugin = this;
      const wrapper = function (...args) {
        plugin.diagnostics.calls++;
        if (plugin.active && features.has(args[0])) {
          plugin.diagnostics.overrides++;
          plugin.diagnostics.status = "observed-overrides";
          plugin.refreshSettings?.();
          return true;
        }
        return Reflect.apply(original, this, args);
      };
      declarations.e_ = wrapper;
      if (declarations.e_ !== wrapper) {
        throw new Error("BetterDiscord declarations.e_ is not writable");
      }
      this.patch = { declarations, original, wrapper, moduleId: rawModule.id };
      this.diagnostics.status = "installed-unverified";
      this.diagnostics.moduleId = rawModule.id;
      this.api.Data?.save("diagnostics", this.getDiagnostics());
      this.hasReportedError = false;
      this.api.Logger.info("Feature permission patch installed.", { moduleId: rawModule.id, features: FEATURE_KEYS });
      return true;
    } catch (error) {
      this.diagnostics.status = "incompatible";
      this.diagnostics.reason = error.message;
      this.api.Data?.save("diagnostics", this.getDiagnostics());
      this.reportError("Could not patch Discord feature permissions.", error);
      return false;
    }
  }

  getDiagnostics() {
    return { ...this.diagnostics, update: this.updater?.status };
  }

  startUpdater() {
    if (!this.active || !this.api.Net?.fetch) return;
    const generation = this.generation;
    const updater = new ReleaseUpdater(this.api, this.meta,
      () => this.active && this.generation === generation);
    this.updater = updater;
    if (this.autoUpdate) {
      void updater.check().finally(() => this.refreshSettings?.());
      this.updateIntervalId = this.timers.setInterval(
        () => void updater.check().finally(() => this.refreshSettings?.()), 6 * 60 * 60 * 1_000);
    }
  }

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.className = "nitrostreams-settings";
    const style = document.createElement("style");
    style.textContent = SETTINGS_CSS;
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    const updateStatus = document.createElement("p");
    updateStatus.setAttribute("role", "status");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "ns-toggle";
    checkbox.setAttribute("role", "switch");
    checkbox.checked = this.autoUpdate;
    checkbox.addEventListener("change", () => {
      this.autoUpdate = checkbox.checked;
      this.api.Data.save("autoUpdate", this.autoUpdate);
      if (this.updateIntervalId !== null) this.timers.clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
      this.generation++;
      this.startUpdater();
      this.refreshSettings?.();
    });
    const details = document.createElement("p");
    details.textContent = "Checks at startup and every 6 hours. A backup is saved before each update.";
    const creditCheckbox = document.createElement("input");
    creditCheckbox.type = "checkbox";
    creditCheckbox.className = "ns-toggle";
    creditCheckbox.setAttribute("role", "switch");
    creditCheckbox.checked = this.showCredit;
    creditCheckbox.addEventListener("change", () => {
      this.showCredit = creditCheckbox.checked;
      this.api.Data.save("showCredit", this.showCredit);
      if (this.showCredit) this.injectCredit();
      else this.removeCredit();
    });
    const creditDetails = document.createElement("p");
    creditDetails.textContent = "Show the author and repository link next to stream quality.";
    const actions = document.createElement("div");
    actions.className = "ns-buttons";
    const check = document.createElement("button");
    check.textContent = "Check for updates";
    check.className = "ns-primary";
    const notes = document.createElement("button");
    notes.textContent = "What's new";
    const install = document.createElement("button");
    install.textContent = "Install update";
    install.className = "ns-primary";
    const runCheck = async (options) => {
      const updater = this.updater;
      if (!updater || updater.pending) return;
      const pending = updater.check(options);
      this.refreshSettings?.();
      await pending;
      this.refreshSettings?.();
    };
    check.addEventListener("click", () => void runCheck({ manual: true, install: false }));
    notes.addEventListener("click", () => this.updater?.showReleaseNotes());
    install.addEventListener("click", () => void runCheck({ install: true }));
    this.refreshSettings = () => {
      const statuses = {
        stopped: "Stopped", searching: "Looking for Discord's stream permissions…",
        incompatible: "Could not apply the patch. Check Discord and BetterDiscord compatibility.",
        "installed-unverified": "Active — permission patch installed; no stream quality check observed yet.",
        "observed-overrides": "Active — stream feature checks have been overridden.",
      };
      status.textContent = statuses[this.diagnostics.status] ?? this.diagnostics.status;
      const state = this.updater?.status;
      const updates = { idle: "Not checked yet", checking: "Checking…", downloading: "Downloading…",
        "up-to-date": "Up to date", available: `Update available: ${state?.version}`,
        installed: `Installed: ${state?.version}`, failed: "Check or installation failed. Try again later." };
      updateStatus.textContent = `Version: ${this.meta.version} · Updates: ${updates[state?.state] ?? "Unavailable"}`;
      check.disabled = !this.active || !this.updater || this.updater.pending;
      notes.disabled = !this.active || !this.updater?.release;
      install.hidden = state?.state !== "available";
      install.disabled = check.disabled;
    };
    actions.append(check, notes, install);
    const updatesRow = settingsRow("Updates", updateStatus, actions);
    updatesRow.classList.add("ns-section");
    const donate = document.createElement("a");
    donate.className = "ns-donate";
    donate.textContent = "Donate on Boosty";
    donate.href = donateUrl;
    donate.target = "_blank";
    donate.rel = "noopener noreferrer";
    const supportDetails = document.createElement("p");
    supportDetails.textContent = "Support NitroStreams development.";
    const supportRow = settingsRow("Support the author", supportDetails, donate);
    supportRow.classList.add("ns-section");
    panel.append(style, settingsRow("Plugin status", status),
      settingsRow("Automatic updates", details, checkbox),
      settingsRow("Show author credit", creditDetails, creditCheckbox), updatesRow, supportRow);
    this.refreshSettings();
    return panel;
  }

  restorePermissionCheck() {
    const patch = this.patch;
    this.patch = null;
    if (!patch) return;
    try {
      if (patch.declarations.e_ === patch.wrapper) {
        patch.declarations.e_ = patch.original;
        if (patch.declarations.e_ !== patch.original) throw new Error("Restoration failed");
      }
    } catch (error) {
      this.reportError("Could not restore the original permission check.", error);
    }
  }

  injectCredit(root = typeof document === "undefined" ? null : document) {
    if (!this.active || !this.showCredit || !this.patch || !root) return;

    const modals = root.matches?.(MODAL_SELECTOR)
      ? [root]
      : [...(root.querySelectorAll?.(MODAL_SELECTOR) ?? [])];
    const placements = modals
      .map((modal) => {
        if (modal.querySelector(`[${CREDIT_ATTRIBUTE}]`)) return null;

        const qualityDetails = [
          ...modal.querySelectorAll(QUALITY_DETAILS_SELECTOR),
        ].find((candidate) => {
          const text = candidate.textContent ?? "";
          const directSpans = candidate.querySelectorAll(":scope > span");
          return (
            directSpans.length >= 3 &&
            /\b\d{2,3}\s*fps\b/i.test(text)
          );
        });
        const summaryRoot = qualityDetails?.parentElement?.parentElement;
        const footer =
          qualityDetails?.closest?.(FOOTER_SELECTOR) ??
          summaryRoot?.parentElement;
        if (!footer) return null;

        const settingsContainer = [...footer.children].find(
          (child) =>
            child !== summaryRoot &&
            child.querySelector(BUTTON_SELECTOR),
        );
        if (!settingsContainer) return null;

        return { footer, qualityDetails, settingsContainer };
      })
      .filter(Boolean);
    for (const placement of placements) {
      const divider = [...placement.qualityDetails.children].find((child) =>
        child.textContent?.trim() === "•" && !child.hasAttribute(CREDIT_ATTRIBUTE));
      const credit = createCredit(document, divider);
      placement.qualityDetails.append(credit);
    }
  }

  removeCredit() {
    if (typeof document === "undefined") return;

    for (const credit of document.querySelectorAll(`[${CREDIT_ATTRIBUTE}]`)) {
      credit.remove();
    }
  }

  reportError(message, error) {
    if (this.hasReportedError) return;

    this.hasReportedError = true;
    this.api.Logger.error(message, error);
    this.api.UI.showToast(`${PLUGIN_NAME}: ${message}`, { type: "error" });
  }
}
