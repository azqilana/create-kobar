// — Helper —

const isCamelCase = (str) => /^[a-zA-Z0-9]+$/.test(str) && !/[-_\s]/.test(str);

const requireCamelCase = (key) => {
  if (!isCamelCase(key)) {
    throw new Error(`[getEl] "${key}" harus ditulis dalam format camelCase.`);
  }
};

const toKebab = (str) =>
  str
    .split(/(?=[A-Z])/)
    .map((w) => w.toLowerCase())
    .join("-");

const parseKey = (prefix, key) => {
  const raw = key.slice(prefix.length);
  return raw.charAt(0).toLowerCase() + raw.slice(1);
};

const splitByMarker = (str, marker) => {
  const idx = str.indexOf(marker);
  if (idx === -1) return { name: str, value: null };
  const name = str.slice(0, idx);
  const value = str.slice(idx + marker.length);
  return { name, value };
};

const convertValue = (value) => {
  if (!value) return value;
  if (/pct$/i.test(value)) {
    return value.replace(/pct$/i, "%");
  }
  return value.charAt(0).toLowerCase() + value.slice(1);
};

const requireArg = (value, key, allowEmpty = false) => {
  if (value === undefined || value === null || (!allowEmpty && value === ""))
    throw new Error(`[getEl] Argumen wajib tidak dikirim pada "${key}"`);
};

const unknownMethod = (key) => {
  throw new Error(`[getEl] Method "${key}" tidak dikenali`);
};

// ✅ Fix: parseText - trim spasi di depan agar teks tidak diawali spasi
const parseText = (rawValue) => {
  return rawValue
    .split(/(?=[A-Z])/)
    .join(" ")
    .trim();
};

// — Proxy Handler —
export const createProxy = (target) => {
  const handler = {
    get(target, key) {
      if (typeof key !== "string") return undefined;

      if (key in target)
        return typeof target[key] === "function"
          ? (...args) => {
              const result = target[key].bind(target)(...args);
              return result === target ? proxy : result;
            }
          : target[key];

      requireCamelCase(key);

      const chain =
        (fn) =>
        (...args) => {
          fn(...args);
          return proxy;
        };

      // — onThe —
      if (key.startsWith("onThe")) {
        const raw = parseKey("onThe", key);

        if (
          !raw.startsWith("class") &&
          !raw.startsWith("attr") &&
          !raw.startsWith("style") &&
          !raw.startsWith("data") &&
          !raw.startsWith("text") &&
          !raw.startsWith("html")
        ) {
          return (fn) => {
            requireArg(fn, key);
            return target.onTheEvents(raw, fn);
          };
        }

        if (raw.startsWith("class")) {
          const nama = toKebab(parseKey("class", raw));
          return chain(() => target.onClass(nama));
        }

        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          const markerMatch = rest.match(/its/i);
          if (markerMatch) {
            const { name, value } = splitByMarker(rest, markerMatch[0]);
            return chain(() => target.onAttr(name, value ?? ""));
          }
          return (value) => {
            requireArg(value, key);
            return target.onAttr(rest, value);
          };
        }

        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          const markerMatch = rest.match(/its/i);
          if (markerMatch) {
            const { name, value } = splitByMarker(rest, markerMatch[0]);
            return chain(() =>
              target.onStyle(toKebab(name), convertValue(value)),
            );
          }
          unknownMethod(key);
        }

        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          const markerMatch = rest.match(/its/i);
          if (markerMatch) {
            const { name, value } = splitByMarker(rest, markerMatch[0]);
            return chain(() => target.setData(toKebab(name), value));
          }
          unknownMethod(key);
        }

        if (raw.startsWith("text")) {
          const rawValue = raw.slice("text".length);
          if (rawValue) {
            const text = parseText(rawValue); // ✅ Fix: pakai parseText agar tidak ada spasi di depan
            return chain(() => target.setText(text));
          }
          return (value) => {
            requireArg(value, key);
            return target.setText(value);
          };
        }

        if (raw === "html") {
          return (value) => {
            requireArg(value, key);
            return target.setHtml(value);
          };
        }

        unknownMethod(key);
      }

      // ✅ Fix: tambah handler offThe
      if (key.startsWith("offThe")) {
        const raw = parseKey("offThe", key);

        if (raw.startsWith("class")) {
          const nama = toKebab(parseKey("class", raw));
          return chain(() => target.offClass(nama));
        }

        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          return chain(() => target.offAttr(rest));
        }

        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          return chain(() => target.offStyle(toKebab(rest)));
        }

        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          return chain(() => target.removeData(toKebab(rest)));
        }

        // event: offTheFocus, offTheClick, dll
        return (fn) => {
          requireArg(fn, key);
          return target.offTheEvents(raw, fn);
        };
      }

      // ✅ Fix: tambah handler toggleThe
      if (key.startsWith("toggleThe")) {
        const raw = parseKey("toggleThe", key);

        if (raw.startsWith("class")) {
          const rest = parseKey("class", raw);
          // Handle: toggleTheClassOnWithOff → toggle antara "on" dan "off"
          const withMatch = rest.match(/With([A-Z][a-zA-Z]*)/);
          if (withMatch) {
            const classA = toKebab(rest.slice(0, rest.indexOf("With")));
            const classB = toKebab(withMatch[1]);
            return chain(() => {
              if (target.checkClass(classA)) {
                target.offClass(classA);
                target.onClass(classB);
              } else {
                target.offClass(classB);
                target.onClass(classA);
              }
            });
          }
          const nama = toKebab(rest);
          return chain(() => target.toggleClass(nama));
        }

        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          // Handle: toggleTheStyleColorItsBlueWithAqua
          const withMatch = rest.match(
            /Its([A-Z][a-zA-Z]*)With([A-Z][a-zA-Z]*)/,
          );
          if (withMatch) {
            const propRaw = rest.slice(0, rest.search(/Its/i));
            const prop = toKebab(propRaw);
            const valA = convertValue(withMatch[1]);
            const valB = convertValue(withMatch[2]);
            return chain(() => {
              const current = target.getStyle(prop);
              target.onStyle(prop, current === valA ? valB : valA);
            });
          }
          unknownMethod(key);
        }

        unknownMethod(key);
      }

      // ✅ Fix: tambah handler changeThe
      if (key.startsWith("changeThe")) {
        const raw = parseKey("changeThe", key);

        if (raw.startsWith("text")) {
          const rawValue = raw.slice("text".length);
          if (rawValue) {
            const text = parseText(rawValue);
            return chain(() => target.setText(text));
          }
          return (value) => {
            requireArg(value, key);
            return target.setText(value);
          };
        }

        if (raw.startsWith("html")) {
          return (value) => {
            requireArg(value, key);
            return target.setHtml(value);
          };
        }

        // Handle: changeTheClassActiveToDisabled → replace class "active" dengan "disabled"
        if (raw.startsWith("class")) {
          const rest = parseKey("class", raw);
          const toMatch = rest.match(/To([A-Z][a-zA-Z]*)$/);
          if (toMatch) {
            const oldClass = toKebab(rest.slice(0, rest.lastIndexOf("To")));
            const newClass = toKebab(toMatch[1]);
            return chain(() => target.replaceClass(oldClass, newClass));
          }
          unknownMethod(key);
        }

        unknownMethod(key);
      }

      // ✅ Fix: tambah handler checkThe (class, attr, style, data, text, html)
      if (key.startsWith("checkThe")) {
        const raw = parseKey("checkThe", key);

        // — Class — checkTheClassActive() → boolean
        if (raw.startsWith("class")) {
          const nama = toKebab(parseKey("class", raw));
          return () => target.checkClass(nama);
        }

        // — Attr — checkTheAttrDisabled() cek eksistensi,
        // checkTheAttrTitleItsHello() cek nilai
        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          const markerMatch = rest.match(/its/i);
          if (markerMatch) {
            const { name, value } = splitByMarker(rest, markerMatch[0]);
            return () => target.getAttr(name) === value;
          }
          return () => target.checkAttr(rest);
        }

        // — Style — checkTheStyleColor() cek ada nilai,
        // checkTheStyleColorItsRed() cek nilai spesifik
        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          const markerMatch = rest.match(/its/i);
          if (markerMatch) {
            const { name, value } = splitByMarker(rest, markerMatch[0]);
            return () => target.getStyle(toKebab(name)) === convertValue(value);
          }
          return () => !!target.getStyle(toKebab(rest));
        }

        // — Data — checkTheDataId() cek ada nilai,
        // checkTheDataIdItsAbc() cek nilai spesifik
        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          const markerMatch = rest.match(/its/i);
          if (markerMatch) {
            const { name, value } = splitByMarker(rest, markerMatch[0]);
            return () => target.getData(toKebab(name)) === value;
          }
          return () => !!target.getData(toKebab(rest));
        }

        // — Text — checkTheTextHello() cek literal embedded,
        // checkTheText(value) cek via argumen
        if (raw.startsWith("text")) {
          const rawValue = raw.slice("text".length);
          if (rawValue) {
            const text = parseText(rawValue);
            return () => target.getText() === text;
          }
          return (value) => {
            requireArg(value, key);
            return target.getText() === value;
          };
        }

        // — Html — checkTheHtml(value) cek via argumen
        if (raw === "html") {
          return (value) => {
            requireArg(value, key);
            return target.getHtml() === value;
          };
        }

        unknownMethod(key);
      }
      if (key.startsWith("html")) {
        const domMethod = key.slice(4);
        const methodOrProp =
          domMethod.charAt(0).toLowerCase() + domMethod.slice(1);

        return (...args) => {
          if (!target.el) throw new Error(`[dom] Element belum tersedia`);

          // 1. Jika itu adalah fungsi/method DOM (contoh: focus(), blur())
          if (typeof target.el[methodOrProp] === "function") {
            const result = target.el[methodOrProp](...args);
            return result ?? proxy;
          }

          // 2. Jika itu adalah properti DOM (contoh: value, checked, id)
          if (methodOrProp in target.el) {
            if (args.length > 0) {
              // Mode SETTER: Jika ada argumen yang dikirim
              target.el[methodOrProp] = args[0];
              return proxy; // Kembalikan proxy untuk mendukung chaining
            } else {
              // Mode GETTER: Jika tidak ada argumen, kembalikan nilainya
              return target.el[methodOrProp];
            }
          }

          // 3. Jika tidak dikenali sama sekali
          throw new Error(
            `[dom] "${methodOrProp}" bukan method atau properti DOM yang valid`,
          );
        };
      }

      if (/^(selector|el|action|awaitElement)$/.test(key)) return undefined;

      unknownMethod(key);
    },
  };

  const proxy = new Proxy(target, handler);
  return proxy;
};
