import { expect, test } from "bun:test";
import { patchStreamQuality } from "../src/streamQuality.js";

function setup({ snapshot = true, objectBinding = true } = {}) {
  let originalCalls = 0;
  const original = function (...args) {
    originalCalls++;
    return { context: this, args };
  };
  const symbol = Symbol("other-property");
  const originalApi = Object.freeze({ canStreamQuality: original, [symbol]: 42 });
  let binding = original;
  let apiBinding = originalApi;
  const declarations = {};
  Object.defineProperty(declarations, "renamedFunction", {
    enumerable: true, get: () => binding, set: value => { binding = value; },
  });
  if (objectBinding) Object.defineProperty(declarations, "renamedApi", {
    enumerable: true, get: () => apiBinding, set: value => { apiBinding = value; },
  });
  const exported = snapshot ? originalApi : Object.defineProperty({}, "canStreamQuality", {
    get: () => binding,
  });
  const diagnostics = { calls: 0, overrides: 0 };
  let active = true;
  const api = { Webpack: { getModule(filter, options) {
    if (options.raw) {
      filter(exported, { id: "678022", declarations });
      return;
    }
    return filter(exported) ? exported : undefined;
  } } };
  return {
    api, diagnostics, original, originalApi, declarations, symbol,
    install: () => patchStreamQuality(api, diagnostics, () => active),
    current: () => binding, currentApi: () => apiBinding,
    originalCalls: () => originalCalls, deactivate: () => { active = false; },
  };
}

test("frozen snapshots replace API bindings and preserve other descriptors and symbols", () => {
  const fixture = setup();
  const patch = fixture.install();
  const { diagnostics } = fixture;
  expect(diagnostics.calls).toBe(0);
  expect(fixture.originalCalls()).toBe(0);
  expect(diagnostics.status).toBe("installed-unverified");
  expect(diagnostics.exportReachesWrapper).toBe(false);
  expect(diagnostics.routing).toBe("object-bindings-replaced-awaiting-calls");
  expect(Object.isFrozen(fixture.currentApi())).toBe(true);
  expect(fixture.currentApi()[fixture.symbol]).toBe(42);
  expect(fixture.currentApi().canStreamQuality("high")).toBe(true);
  expect(fixture.currentApi().canStreamQuality("mid")).toBe(true);
  expect(diagnostics.high).toBe(1);
  expect(diagnostics.mid).toBe(1);
  expect(diagnostics.streamResult).toBe("not-verified");
  patch.restore();
  expect(fixture.current()).toBe(fixture.original);
  expect(fixture.currentApi()).toBe(fixture.originalApi);
});

test("live getter exports reach the wrapper without a synthetic quality check", () => {
  const fixture = setup({ snapshot: false });
  const patch = fixture.install();
  expect(fixture.diagnostics.exportReachesWrapper).toBe(true);
  expect(fixture.diagnostics.overrides).toBe(0);
  patch.restore();
});

test("declaration-only installation waits for real calls", () => {
  const fixture = setup({ objectBinding: false });
  const patch = fixture.install();
  expect(fixture.diagnostics.routing).toBe("declaration-only-awaiting-calls");
  expect(fixture.diagnostics.status).toBe("installed-unverified");
  expect(fixture.current()("high")).toBe(true);
  patch.restore();
});

test("other qualities preserve all arguments and receiver; stop disables retained wrappers", () => {
  const fixture = setup();
  const patch = fixture.install();
  const wrapper = fixture.current();
  const receiver = {};
  const user = { premiumType: 0 };
  expect(wrapper.call(receiver, "other", user, 4)).toEqual({ context: receiver, args: ["other", user, 4] });
  fixture.deactivate();
  expect(wrapper.call(receiver, "high", user)).toEqual({ context: receiver, args: ["high", user] });
  expect(user.premiumType).toBe(0);
  patch.restore();
  expect(wrapper.call(receiver, "mid", user)).toEqual({ context: receiver, args: ["mid", user] });
});

test("later plugin wrappers survive restoration with retained bypass disabled", () => {
  const fixture = setup();
  const patch = fixture.install();
  const ours = fixture.current();
  const later = (...args) => ours(...args);
  fixture.declarations.renamedFunction = later;
  patch.restore();
  expect(fixture.current()).toBe(later);
  expect(later("high").args).toEqual(["high"]);
});

test("partial installs roll back when an API binding setter rejects a replacement", () => {
  const fixture = setup();
  Object.defineProperty(fixture.declarations, "rejectingApi", {
    enumerable: true, get: () => fixture.originalApi,
    set: () => { throw new Error("setter rejected"); },
  });
  expect(fixture.install).toThrow("setter rejected");
  expect(fixture.current()).toBe(fixture.original);
  expect(fixture.currentApi()).toBe(fixture.originalApi);
  expect(fixture.diagnostics.rolledBack).toBe(true);
});

test("missing stream exports allow the legacy feature patch", () => {
  const api = { Webpack: { getModule() {} } };
  expect(patchStreamQuality(api, {}, () => true)).toBeNull();
});

test("read-only bindings are reported as incompatible without claiming observed calls", () => {
  const original = () => false;
  const exported = Object.freeze({ canStreamQuality: original });
  const diagnostics = { calls: 0, overrides: 0 };
  const api = { Webpack: { getModule(filter, options) {
    if (options.raw) return filter(exported, { declarations: Object.freeze({ x: original }) });
    return exported;
  } } };
  expect(() => patchStreamQuality(api, diagnostics, () => true)).toThrow("No writable");
  expect(diagnostics.calls).toBe(0);
});
