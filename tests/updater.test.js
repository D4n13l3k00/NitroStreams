import { expect, test } from "bun:test";
import { createHash } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import ReleaseUpdater, { newerVersion, validateAsset } from "../src/updater.js";

const text = "/**\n * @name NitroStreams\n * @version 1.3.2\n */\nmodule.exports = class {};\n";
function release() {
  return { tag_name: "v1.3.2", draft: false, prerelease: false, assets: [{
    name: "NitroStreams.plugin.js", size: text.length,
    digest: `sha256:${createHash("sha256").update(text).digest("hex")}`,
    browser_download_url: "https://github.com/D4n13l3k00/NitroStreams/releases/download/v1.3.2/NitroStreams.plugin.js",
  }] };
}

function setup({ current = "1.3.1", failRename = false, modify = () => {} } = {}) {
  const candidate = release();
  modify(candidate);
  let active = true;
  let requests = 0;
  const files = new Map();
  const writes = [];
  const notices = [];
  const api = {
    React: { createElement: (type, props, children) => ({ type, props, children }) },
    Net: { async fetch(_url, options) {
      expect(options.headers["User-Agent"]).toBe(`NitroStreams/${current}`);
      requests++;
      return { ok: true, async json() { return candidate; }, async text() { return text; } };
    } },
    Plugins: { folder: "/plugins" },
    Logger: { info() {}, warn() {} },
    UI: { showToast: (message, options) => notices.push({ message, ...options }) },
  };
  const fs = {
    readFileSync: () => "original plugin",
    writeFileSync(filename, contents) { writes.push(filename); files.set(filename, contents); },
    renameSync(from, to) {
      if (failRename) throw new Error("rename failed");
      files.set(to, files.get(from)); files.delete(from);
    },
    existsSync: (filename) => files.has(filename),
    unlinkSync: (filename) => files.delete(filename),
  };
  const updater = new ReleaseUpdater(api, { version: current }, () => active, fs);
  return { updater, api, files, writes, notices, stop: () => { active = false; }, requests: () => requests };
}

test("version comparison refuses downgrades, same versions and prereleases", () => {
  expect(newerVersion("v1.10.0", "1.9.9")).toBe(true);
  for (const value of ["v1.3.1", "v1.3.0", "v1.4.0-beta", "invalid"]) {
    expect(newerVersion(value, "1.3.1")).toBe(false);
  }
});

test("digest and metadata must both match the GitHub release", async () => {
  expect(await validateAsset(release(), text)).toBe("1.3.2");
  const damaged = text.replace("class", "clAss");
  await expect(validateAsset(release(), damaged)).rejects.toThrow("SHA-256");
  await expect(validateAsset(release(), text.replace("NitroStreams", "OtherStreams"))).rejects.toThrow("metadata");
});

test("new stable release sends notifications and installs with backup and atomic rename", async () => {
  const { updater, files, writes, notices, requests } = setup();
  await updater.check();
  expect(updater.status.state).toBe("installed");
  expect(requests()).toBe(2);
  expect(writes[0].endsWith(".bak")).toBe(true);
  expect([...files.entries()].find(([key]) => key.endsWith(".bak"))?.[1]).toBe("original plugin");
  expect([...files.entries()].find(([key]) => key.endsWith(".plugin.js"))?.[1]).toBe(text);
  expect([...files.keys()].some((key) => key.endsWith(".tmp"))).toBe(false);
  expect(notices.map((notice) => notice.type)).toEqual(["info", "success"]);
});

test("older release never downloads or writes a plugin", async () => {
  const { updater, writes, requests } = setup({ current: "1.4.0" });
  await updater.check();
  expect(updater.status.state).toBe("up-to-date");
  expect(requests()).toBe(1);
  expect(writes).toEqual([]);
});

test("manual check shows release notes without installing until requested", async () => {
  const { updater, api, writes, requests } = setup({ modify: (candidate) => {
    candidate.body = "- Fixed stream quality.\n- Added update notifications.";
  } });
  const modals = [];
  api.UI.showConfirmationModal = (...args) => modals.push(args);
  await updater.check({ manual: true, install: false });
  expect(updater.status.state).toBe("available");
  expect(requests()).toBe(1);
  expect(writes).toEqual([]);
  expect(modals[0][1].children).toBe("- Fixed stream quality.\n- Added update notifications.");
  expect(modals[0][1].props.style.whiteSpace).toBe("pre-wrap");
  await updater.check();
  expect(updater.status.state).toBe("installed");
});

test("manual check gives feedback when already current or network fails", async () => {
  const current = setup({ current: "1.3.2" });
  await current.updater.check({ manual: true, install: false });
  expect(current.notices[0].message).toContain("up to date");
  const failed = setup();
  failed.api.Net.fetch = async () => { throw new Error("offline"); };
  await failed.updater.check({ manual: true, install: false });
  expect(failed.updater.status.state).toBe("failed");
  expect(failed.notices[0].type).toBe("warning");
});

test("stop during download prevents all filesystem writes", async () => {
  const { updater, api, writes, notices, stop } = setup();
  api.Net.fetch = async () => ({ ok: true, json: async () => release(), text: async () => { stop(); return text; } });
  await updater.check();
  expect(writes).toEqual([]);
  expect(notices.some((notice) => notice.type === "success")).toBe(false);
});

test("failed rename leaves original untouched and removes temporary file", async () => {
  const { updater, files } = setup({ failRename: true });
  await updater.check();
  expect(updater.status.state).toBe("failed");
  expect([...files.keys()].every((key) => key.endsWith(".bak"))).toBe(true);
});

test("unexpected release download URL is refused", async () => {
  const { updater, writes, requests } = setup({ modify: (value) => {
    value.assets[0].browser_download_url = "https://example.com/plugin.js";
  } });
  await updater.check();
  expect(updater.status.state).toBe("failed");
  expect(requests()).toBe(1);
  expect(writes).toEqual([]);
});

test("concurrent update checks share a single download", async () => {
  const { updater, requests } = setup();
  await Promise.all([updater.check(), updater.check()]);
  expect(requests()).toBe(2);
});

test("atomic update replaces an existing file on the host filesystem", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nitrostreams-update-test-"));
  const destination = path.join(directory, "NitroStreams.plugin.js");
  fs.writeFileSync(destination, "original plugin", "utf8");
  const { api } = setup();
  api.Plugins.folder = directory;
  const updater = new ReleaseUpdater(api, { version: "1.3.1" }, () => true);
  try {
    await updater.check();
    expect(updater.status.state).toBe("installed");
    expect(fs.readFileSync(destination, "utf8")).toBe(text);
    expect(fs.readFileSync(`${destination}.bak`, "utf8")).toBe("original plugin");
    expect(fs.existsSync(`${destination}.update.tmp`)).toBe(false);
  } finally {
    for (const filename of [destination, `${destination}.bak`, `${destination}.update.tmp`]) {
      if (fs.existsSync(filename)) fs.unlinkSync(filename);
    }
    fs.rmdirSync(directory);
  }
});
