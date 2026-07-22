const PLUGIN_NAME = "NitroStreams";
const NITRO_PREMIUM_TYPE = 2;
const REFRESH_INTERVAL_MS = 5_000;
const CREDIT_ATTRIBUTE = "data-nitrostreams-credit";
const MODAL_SELECTOR = '[data-mana-component="modal"]';
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
    this.userStore = null;
    this.intervalId = null;
    this.originalUser = null;
    this.hasReportedError = false;
  }

  start() {
    if (this.intervalId !== null) return;

    this.applyNitro();
    this.injectCredit();
    this.intervalId = this.timers.setInterval(
      () => this.applyNitro(),
      REFRESH_INTERVAL_MS,
    );
  }

  stop() {
    if (this.intervalId !== null) {
      this.timers.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.restoreOriginalUser();
    this.removeCredit();
    this.userStore = null;
    this.hasReportedError = false;
  }

  observer(mutation) {
    if (!mutation?.addedNodes) {
      this.injectCredit();
      return;
    }

    const modals = new Set();
    for (const node of mutation.addedNodes) {
      if (!node || typeof node.querySelector !== "function") continue;

      const modal = node.matches?.(MODAL_SELECTOR)
        ? node
        : (node.closest?.(MODAL_SELECTOR) ?? node.querySelector(MODAL_SELECTOR));
      if (modal) modals.add(modal);
    }

    for (const modal of modals) this.injectCredit(modal);
  }

  getCurrentUser() {
    this.userStore ??= this.api.Webpack.getStore("UserStore");
    return this.userStore?.getCurrentUser?.() ?? null;
  }

  applyNitro() {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (this.originalUser?.id !== user.id) {
      this.restoreOriginalUser();
      this.originalUser = {
        id: user.id,
        premiumType: user.premiumType,
        reference: user,
      };
    }

    try {
      user.premiumType = NITRO_PREMIUM_TYPE;
      this.hasReportedError = false;
      return user.premiumType === NITRO_PREMIUM_TYPE;
    } catch (error) {
      this.reportError("Не удалось применить Nitro-статус.", error);
      return false;
    }
  }

  restoreOriginalUser() {
    const snapshot = this.originalUser;
    this.originalUser = null;
    if (!snapshot) return;

    const user = this.userStore?.getUser?.(snapshot.id) ?? snapshot.reference;
    if (!user || user.premiumType !== NITRO_PREMIUM_TYPE) return;

    try {
      user.premiumType = snapshot.premiumType;
    } catch (error) {
      this.reportError("Не удалось восстановить исходный Nitro-статус.", error);
    }
  }

  injectCredit(root = typeof document === "undefined" ? null : document) {
    if (!root) return;

    const modals = root.matches?.(MODAL_SELECTOR)
      ? [root]
      : [...(root.querySelectorAll?.(MODAL_SELECTOR) ?? [])];
    const placement = modals
      .map((modal) => {
        if (modal.querySelector(`[${CREDIT_ATTRIBUTE}]`)) return null;

        const qualityDetails = [
          ...modal.querySelectorAll(QUALITY_DETAILS_SELECTOR),
        ].find((candidate) => {
          const text = candidate.textContent ?? "";
          const directSpans = candidate.querySelectorAll(":scope > span");
          return (
            directSpans.length >= 3 &&
            /\b\d{3,4}p\b/i.test(text) &&
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
      .find(Boolean);
    if (!placement) return;
    const qualityStyle =
      typeof globalThis.getComputedStyle === "function"
        ? globalThis.getComputedStyle(placement.qualityDetails)
        : null;
    const credit = document.createElement("div");
    credit.setAttribute(CREDIT_ATTRIBUTE, "true");
    credit.textContent = "Made with ❤️ by D4n13l3k00";
    Object.assign(credit.style, {
      alignSelf: "flex-end",
      color: "var(--text-muted)",
      fontSize: qualityStyle?.fontSize ?? "12px",
      lineHeight: qualityStyle?.lineHeight ?? "16px",
      marginBlockEnd: "2px",
      marginInlineEnd: "16px",
      marginInlineStart: "auto",
      userSelect: "none",
      whiteSpace: "nowrap",
    });

    placement.footer.insertBefore(credit, placement.settingsContainer);
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
