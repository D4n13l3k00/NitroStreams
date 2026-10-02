import { afterEach, expect, test } from "bun:test";
import NitroStreams from "../src/NitroStreams.js";

afterEach(() => { delete globalThis.BdApi; });

function setup(declarations = null) {
  let current = declarations;
  const callbacks = new Map();
  const errors = [];
  const api = {
    React: { createElement: (type, props, children) => ({ type, props, children }) },
    Webpack: {
      Filters: { bySource: (...needles) => {
        expect(needles).toEqual(["canStreamQuality"]);
        return () => true;
      } },
      getModule(filter, options) {
        expect(options.raw).toBe(true);
        expect(options.first).toBe(false);
        const module = { id: 42, declarations: current };
        return filter({}, module) ? [module] : [];
      },
      getStore: () => ({ getCurrentUser: () => ({ id: "test", premiumType: 0 }) }),
    },
    Logger: { info() {}, error: (...args) => errors.push(args) },
    UI: { showToast() {} },
  };
  globalThis.BdApi = class { constructor() { return api; } };
  const plugin = new NitroStreams({}, {
    setInterval(callback) { callbacks.set(1, callback); return 1; },
    clearInterval(id) { callbacks.delete(id); },
  });
  return { plugin, api, callbacks, errors, load(value) { current = value; } };
}

function permissions(original = () => false) {
  return { e_: original, q: {}, X: {}, G: {} };
}

test("manual updater remains available with automatic updates disabled", async () => {
  const { plugin, api, callbacks } = setup(permissions());
  let requests = 0;
  api.Net = { fetch: async () => {
    requests++;
    return { ok: true, json: async () => ({ tag_name: "v1.4.0", body: "Current release" }) };
  } };
  plugin.autoUpdate = false;
  plugin.start();
  expect(requests).toBe(0);
  expect(callbacks.size).toBe(1);
  await plugin.updater.check({ manual: true, install: false });
  expect(requests).toBe(1);
  expect(plugin.updater.status.state).toBe("up-to-date");
  plugin.stop();
  expect(plugin.updater.isActive()).toBe(false);
});

test("disabled author credit is persisted and never inspects the source picker", () => {
  const { api } = setup(permissions());
  api.Data = { load: (key) => key === "showCredit" ? false : undefined };
  const plugin = new NitroStreams();
  expect(plugin.showCredit).toBe(false);
  plugin.active = true;
  plugin.patch = {};
  plugin.injectCredit({ querySelectorAll() { throw new Error("Must not inject disabled credit"); } });
});

test("only q/X/G bypass the check; other calls preserve context and all arguments", () => {
  const context = {};
  const other = {};
  const user = { premiumType: 0 };
  const original = function (...args) { return { context: this, args }; };
  const declarations = permissions(original);
  const { plugin } = setup(declarations);
  plugin.start();
  for (const key of ["q", "X", "G"]) expect(declarations.e_(declarations[key], user)).toBe(true);
  expect(declarations.e_.call(context, other, user, 3, 4)).toEqual({ context, args: [other, user, 3, 4] });
  expect(user.premiumType).toBe(0);
  plugin.stop();
  expect(declarations.e_).toBe(original);
});

test("start/stop are idempotent and retained callbacks cannot patch after stop", () => {
  const declarations = permissions();
  const original = declarations.e_;
  const { plugin, callbacks } = setup(declarations);
  plugin.start();
  const wrapper = declarations.e_;
  const tick = callbacks.get(1);
  plugin.start();
  expect(declarations.e_).toBe(wrapper);
  expect(callbacks.size).toBe(1);
  plugin.stop();
  plugin.stop();
  tick();
  expect(declarations.e_).toBe(original);
  expect(callbacks.size).toBe(0);
  plugin.start();
  expect(declarations.e_(declarations.q)).toBe(true);
  plugin.stop();
});

test("late module discovery retries and errors are reported once", () => {
  const { plugin, callbacks, errors, load } = setup();
  plugin.start();
  callbacks.get(1)();
  expect(errors.length).toBe(1);
  const declarations = permissions();
  load(declarations);
  callbacks.get(1)();
  expect(declarations.e_(declarations.q)).toBe(true);
  plugin.stop();
});

test("stop preserves a later plugin wrapper and disables its retained bypass", () => {
  const declarations = permissions();
  const { plugin } = setup(declarations);
  plugin.start();
  const ours = declarations.e_;
  const later = (...args) => ours(...args);
  declarations.e_ = later;
  plugin.stop();
  expect(declarations.e_).toBe(later);
  expect(declarations.e_(declarations.q)).toBe(false);
});

test("read-only declarations fail with diagnostics and leave no patch", () => {
  const declarations = Object.freeze(permissions());
  const { plugin, errors } = setup(declarations);
  plugin.start();
  expect(plugin.patch).toBeNull();
  expect(errors.length).toBe(1);
  plugin.stop();
});

test("incomplete feature sets are refused", () => {
  const declarations = permissions();
  delete declarations.G;
  const { plugin, errors } = setup(declarations);
  plugin.start();
  expect(plugin.patch).toBeNull();
  expect(errors.length).toBe(1);
  plugin.stop();
});

test("BetterDiscord getter/setter declarations are patched and restored", () => {
  const original = () => false;
  const declarations = permissions();
  let binding = original;
  Object.defineProperty(declarations, "e_", { get: () => binding, set: (value) => { binding = value; } });
  const { plugin } = setup(declarations);
  plugin.start();
  expect(binding(declarations.q)).toBe(true);
  plugin.stop();
  expect(binding).toBe(original);
});

test("ambiguous feature identities are refused", () => {
  const declarations = permissions();
  declarations.G = declarations.q;
  const { plugin } = setup(declarations);
  plugin.start();
  expect(plugin.patch).toBeNull();
  expect(plugin.getDiagnostics().reason).toContain("ambiguous");
  plugin.stop();
});
