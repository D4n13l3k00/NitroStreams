// Compatibility fix by Collapxe-prime (https://github.com/Collapxe-prime).

function entries(object) {
  const result = [];
  for (const key of Object.keys(object ?? {})) {
    try { result.push([key, object[key]]); } catch { /* Unavailable lazy binding. */ }
  }
  return result;
}

function writable(target, key) {
  const property = Object.getOwnPropertyDescriptor(target, key);
  return Boolean(property?.writable || property?.set);
}

export function patchStreamQuality(api, diagnostics, isActive) {
  const exported = api.Webpack.getModule(
    value => typeof value?.canStreamQuality === "function",
    { searchExports: true },
  );
  const original = exported?.canStreamQuality;
  if (typeof original !== "function") return null;

  const slots = [];
  const add = (target, key, moduleId, kind, value) => {
    if (!slots.some(slot => slot.target === target && slot.key === key)) {
      slots.push({ target, key, moduleId, kind, original: value });
    }
  };
  api.Webpack.getModule((_exports, raw) => {
    for (const [key, value] of entries(raw?.declarations)) {
      if (value === original) add(raw.declarations, key, raw.id, "function", value);
      if (value && typeof value === "object" &&
          Object.getOwnPropertyDescriptor(value, "canStreamQuality")?.value === original) {
        add(raw.declarations, key, raw.id, "api-object", value);
      }
    }
    return false;
  }, { raw: true });
  if (writable(exported, "canStreamQuality")) {
    add(exported, "canStreamQuality", "export", "function", original);
  }

  const state = { enabled: true };
  const applied = [];
  const wrapper = function (...args) {
    if (state.enabled && isActive()) {
      diagnostics.calls++;
      const quality = args[0];
      if (quality === "high" || quality === "mid") {
        diagnostics[quality]++;
        diagnostics.overrides++;
        diagnostics.status = "observed-overrides";
        return true;
      }
    }
    return Reflect.apply(original, this, args);
  };
  const restore = () => {
    state.enabled = false;
    const errors = [];
    for (const slot of [...applied].reverse()) {
      try {
        if (slot.target[slot.key] === slot.replacement) {
          slot.target[slot.key] = slot.original;
          if (slot.target[slot.key] !== slot.original) throw new Error("Restoration failed");
        }
      } catch (error) { errors.push(error.message); }
    }
    if (errors.length) throw new Error(errors.join("; "));
  };

  diagnostics.stage = "replace-stream-bindings";
  diagnostics.high = 0;
  diagnostics.mid = 0;
  diagnostics.streamResult = "not-verified";
  diagnostics.targets = slots.map(slot => ({
    moduleId: String(slot.moduleId), key: slot.key, kind: slot.kind,
    writable: writable(slot.target, slot.key), applied: false,
  }));
  const replacements = new Map();
  try {
    for (const [index, slot] of slots.entries()) {
      if (!diagnostics.targets[index].writable) continue;
      let replacement = wrapper;
      if (slot.kind === "api-object") {
        replacement = replacements.get(slot.original);
        if (!replacement) {
          const descriptors = Object.getOwnPropertyDescriptors(slot.original);
          descriptors.canStreamQuality = { ...descriptors.canStreamQuality, value: wrapper };
          replacement = Object.create(Object.getPrototypeOf(slot.original), descriptors);
          if (!Object.isExtensible(slot.original)) Object.preventExtensions(replacement);
          replacements.set(slot.original, replacement);
        }
      }
      // Register before assignment so a throwing setter also gets rolled back.
      applied.push({ ...slot, replacement });
      slot.target[slot.key] = replacement;
      if (slot.target[slot.key] !== replacement) throw new Error("Stream binding replacement failed");
      diagnostics.targets[index].applied = true;
    }
    if (!applied.length) throw new Error("No writable canStreamQuality binding found");
  } catch (error) {
    try { restore(); } catch (restoreError) { diagnostics.restoreError = restoreError.message; }
    diagnostics.rolledBack = !diagnostics.restoreError;
    throw error;
  }

  // Discovery can return a frozen snapshot. Only actual Discord calls can
  // establish that its consumers use one of the replaced bindings.
  diagnostics.exportReachesWrapper = exported.canStreamQuality === wrapper;
  diagnostics.routing = diagnostics.exportReachesWrapper ? "export-reaches-wrapper"
    : applied.some(slot => slot.kind === "api-object")
      ? "object-bindings-replaced-awaiting-calls" : "declaration-only-awaiting-calls";
  diagnostics.status = "installed-unverified";
  diagnostics.stage = "waiting-for-discord-calls";
  return { restore };
}
