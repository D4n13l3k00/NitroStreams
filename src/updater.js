import fs from "fs";
import path from "path";

const RELEASE_API = "https://api.github.com/repos/D4n13l3k00/NitroStreams/releases/latest";
const ASSET_NAME = "NitroStreams.plugin.js";
const MAX_SIZE = 1_048_576;

export function newerVersion(candidate, current) {
  const parse = (value) => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value)?.slice(1).map(Number);
  const next = parse(candidate);
  const old = parse(current);
  if (!next || !old) return false;
  for (let i = 0; i < 3; i++) {
    if (next[i] !== old[i]) return next[i] > old[i];
  }
  return false;
}

export async function validateAsset(release, text) {
  const asset = release.assets?.find((entry) => entry.name === ASSET_NAME);
  const version = /^v?(\d+\.\d+\.\d+)$/.exec(release.tag_name)?.[1];
  if (!asset || !version || release.draft || release.prerelease) throw new Error("Invalid stable release");
  const bytes = new globalThis.TextEncoder().encode(text);
  if (asset.size > MAX_SIZE || bytes.length > MAX_SIZE || bytes.length !== asset.size) {
    throw new Error("Plugin size does not match the release asset");
  }
  const header = /^\/\*\*[\s\S]*?\*\//.exec(text)?.[0] ?? "";
  if (!/^\s*\*\s*@name\s+NitroStreams\s*$/m.test(header) ||
      !new RegExp(`^\\s*\\*\\s*@version\\s+${version.replaceAll(".", "\\.")}\\s*$`, "m").test(header) ||
      !text.includes("module.exports")) throw new Error("Plugin metadata does not match the release");
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const digest = `sha256:${[...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  if (!asset.digest || asset.digest !== digest) throw new Error("GitHub asset SHA-256 mismatch");
  return version;
}

export default class ReleaseUpdater {
  constructor(api, meta, isActive, fileSystem = fs) {
    this.api = api;
    this.meta = meta;
    this.isActive = isActive;
    this.fs = fileSystem;
    this.pending = false;
    this.status = { state: "idle" };
  }

  async check() {
    if (this.pending || !this.isActive() || !this.api.Net?.fetch) return;
    this.pending = true;
    this.status = { state: "checking" };
    let installing = false;
    try {
      const response = await this.api.Net.fetch(RELEASE_API, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": `NitroStreams/${this.meta.version}` }, timeout: 15_000,
      });
      if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
      const release = await response.json();
      if (!this.isActive()) return;
      if (!newerVersion(release.tag_name, this.meta.version) || release.draft || release.prerelease) {
        this.status = { state: "up-to-date" };
        return;
      }
      const asset = release.assets?.find((entry) => entry.name === ASSET_NAME);
      const expectedUrl = `https://github.com/D4n13l3k00/NitroStreams/releases/download/${release.tag_name}/${ASSET_NAME}`;
      if (!asset || asset.browser_download_url !== expectedUrl || asset.size > MAX_SIZE) {
        throw new Error("Unexpected release asset or download URL");
      }
      installing = true;
      this.status = { state: "downloading", version: release.tag_name };
      this.api.UI.showToast(`NitroStreams ${release.tag_name} is available. Downloading update…`, { type: "info" });
      const download = await this.api.Net.fetch(expectedUrl, {
        headers: { "User-Agent": `NitroStreams/${this.meta.version}` }, timeout: 15_000,
      });
      if (!download.ok) throw new Error(`Asset HTTP ${download.status}`);
      const text = await download.text();
      const version = await validateAsset(release, text);
      if (!this.isActive()) return;
      const filename = this.meta.filename ?? ASSET_NAME;
      if (path.basename(filename) !== filename || !filename.endsWith(".plugin.js")) {
        throw new Error("Invalid installed plugin filename");
      }
      const destination = path.join(this.api.Plugins.folder, filename);
      const temporary = `${destination}.update.tmp`;
      const backup = `${destination}.bak`;
      const original = this.fs.readFileSync(destination, "utf8");
      this.fs.writeFileSync(backup, original, "utf8");
      try {
        this.fs.writeFileSync(temporary, text, "utf8");
        this.fs.renameSync(temporary, destination);
      } catch (error) {
        if (this.fs.existsSync(temporary)) this.fs.unlinkSync(temporary);
        throw error;
      }
      this.status = { state: "installed", version };
      this.api.Logger.info(`Update installed: ${version}. Backup saved to ${backup}`);
      this.api.UI.showToast(`NitroStreams updated to ${version}.`, { type: "success" });
    } catch (error) {
      this.status = { state: "failed", reason: error.message };
      this.api.Logger.warn("Could not check or install the update.", error);
      if (installing && this.isActive()) {
        this.api.UI.showToast("NitroStreams update failed. Your current plugin has been kept.", { type: "warning" });
      }
    } finally {
      this.pending = false;
      if (this.isActive()) this.api.Data?.save("updateDiagnostics", this.status);
    }
  }
}
