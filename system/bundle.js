// ============================================================
// route.js
// ============================================================

async function load(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Gagal memuat "${file}": HTTP ${res.status}`);
    return file.includes("json") ? await res.json() : await res.text();
  } catch (error) {
    console.error(`[load] Error saat memuat "${file}":`, error);
    throw error;
  }
}

let _route = null;

async function checkPath(url) {
  if (!_route) _route = await load(`/config/route.json`);
  const key = url === "/index.html" ? "/" : url;
  return _route[key] ?? _route["/404"];
}

// ============================================================
// inject.js
// ============================================================

function injectData(htmlString, data) {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");

  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith("this-data-")) {
        const attrName = attr.name.slice("this-data-".length);
        const key = attr.value;
        if (key in data) el.setAttribute(attrName, data[key]);
        el.removeAttribute(attr.name);
      }
    }
  });

  doc.querySelectorAll("[this-data]").forEach((el) => {
    const key = el.getAttribute("this-data");
    if (!(key in data)) return;
    if (el.tagName.toLowerCase() === "meta") {
      const temp = document.createElement("template");
      temp.innerHTML = data[key];
      el.replaceWith(temp.content.cloneNode(true));
    } else {
      el.removeAttribute("this-data");
      el.setAttribute(`data-${key}`, data[key]);
    }
  });

  return doc.body.innerHTML;
}

// ============================================================
// element.js
// ============================================================

const _typeMap = {
  all: (s) => document.querySelectorAll(s),
  id: (s) => document.getElementById(s),
  class: (s) => document.getElementsByClassName(s),
  tag: (s) => document.getElementsByTagName(s),
  name: (s) => document.getElementsByName(s),
};

function theElement(selector) {
  if (!selector.includes(":")) return document.querySelector(selector);
  const [type, ...rest] = selector.split(":");
  const sel = rest.join(":");
  const fn = _typeMap[type.toLowerCase()];
  if (!fn)
    throw new Error(
      `Prefix "${type}" tidak dikenal. Gunakan: ${Object.keys(_typeMap).join(", ")}`,
    );
  return fn(sel);
}

// ============================================================
// registry.js
// ============================================================

const _registry = {};

function registerPage(name, initFn) {
  _registry[name] = initFn;
}

function runPageInit(name) {
  if (_registry[name]) {
    _registry[name]();
  } else {
    console.warn(`Tidak ada init terdaftar untuk halaman: ${name}`);
  }
}

// ============================================================
// proxy.js
// ============================================================

const isCamelCase = (str) => /^[a-zA-Z0-9]+$/.test(str) && !/[-_\s]/.test(str);

const requireCamelCase = (key) => {
  if (!isCamelCase(key))
    throw new Error(`[getEl] "${key}" harus ditulis dalam format camelCase.`);
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
  return { name: str.slice(0, idx), value: str.slice(idx + marker.length) };
};

const convertValue = (value) => {
  if (!value) return value;
  if (/pct$/i.test(value)) return value.replace(/pct$/i, "%");
  return value.charAt(0).toLowerCase() + value.slice(1);
};

const requireArg = (value, key, allowEmpty = false) => {
  if (value === undefined || value === null || (!allowEmpty && value === ""))
    throw new Error(`[getEl] Argumen wajib tidak dikirim pada "${key}"`);
};

const unknownMethod = (key) => {
  throw new Error(`[getEl] Method "${key}" tidak dikenali`);
};

const parseText = (rawValue) =>
  rawValue
    .split(/(?=[A-Z])/)
    .join(" ")
    .trim();

function createProxy(target) {
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
          !["class", "attr", "style", "data", "text", "html"].some((p) =>
            raw.startsWith(p),
          )
        )
          return (fn) => {
            requireArg(fn, key);
            return target.onTheEvents(raw, fn);
          };
        if (raw.startsWith("class"))
          return chain(() => target.onClass(toKebab(parseKey("class", raw))));
        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          const m = rest.match(/its/i);
          if (m) {
            const { name, value } = splitByMarker(rest, m[0]);
            return chain(() => target.onAttr(name, value ?? ""));
          }
          return (value) => {
            requireArg(value, key);
            return target.onAttr(rest, value);
          };
        }
        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          const m = rest.match(/its/i);
          if (m) {
            const { name, value } = splitByMarker(rest, m[0]);
            return chain(() =>
              target.onStyle(toKebab(name), convertValue(value)),
            );
          }
          unknownMethod(key);
        }
        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          const m = rest.match(/its/i);
          if (m) {
            const { name, value } = splitByMarker(rest, m[0]);
            return chain(() => target.setData(toKebab(name), value));
          }
          unknownMethod(key);
        }
        if (raw.startsWith("text")) {
          const rawValue = raw.slice("text".length);
          if (rawValue) return chain(() => target.setText(parseText(rawValue)));
          return (value) => {
            requireArg(value, key);
            return target.setText(value);
          };
        }
        if (raw === "html")
          return (value) => {
            requireArg(value, key);
            return target.setHtml(value);
          };
        unknownMethod(key);
      }

      // — offThe —
      if (key.startsWith("offThe")) {
        const raw = parseKey("offThe", key);
        if (raw.startsWith("class"))
          return chain(() => target.offClass(toKebab(parseKey("class", raw))));
        if (raw.startsWith("attr"))
          return chain(() => target.offAttr(parseKey("attr", raw)));
        if (raw.startsWith("style"))
          return chain(() => target.offStyle(toKebab(parseKey("style", raw))));
        if (raw.startsWith("data"))
          return chain(() => target.removeData(toKebab(parseKey("data", raw))));
        if (raw.startsWith("text")) return chain(() => target.setText(""));
        return (fn) => {
          requireArg(fn, key);
          return target.offTheEvents(raw, fn);
        };
      }

      // — toggleThe —
      if (key.startsWith("toggleThe")) {
        const raw = parseKey("toggleThe", key);
        if (raw.startsWith("class")) {
          const rest = parseKey("class", raw);
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
          return chain(() => target.toggleClass(toKebab(rest)));
        }
        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          const m = rest.match(/Its([A-Z][a-zA-Z]*)With([A-Z][a-zA-Z]*)/);
          if (m) {
            const prop = toKebab(rest.slice(0, rest.search(/Its/i)));
            const valA = convertValue(m[1]),
              valB = convertValue(m[2]);
            return chain(() =>
              target.onStyle(
                prop,
                target.getStyle(prop) === valA ? valB : valA,
              ),
            );
          }
          unknownMethod(key);
        }
        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          const m = rest.match(/Its([A-Z][a-zA-Z]*)With([A-Z][a-zA-Z]*)/);
          if (m) {
            const name = rest.slice(0, rest.search(/Its/i));
            const valA = m[1].charAt(0).toLowerCase() + m[1].slice(1);
            const valB = m[2].charAt(0).toLowerCase() + m[2].slice(1);
            return chain(() =>
              target.onAttr(name, target.getAttr(name) === valA ? valB : valA),
            );
          }
          unknownMethod(key);
        }
        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          const m = rest.match(/Its([A-Z][a-zA-Z]*)With([A-Z][a-zA-Z]*)/);
          if (m) {
            const name = toKebab(rest.slice(0, rest.search(/Its/i)));
            const valA = m[1].charAt(0).toLowerCase() + m[1].slice(1);
            const valB = m[2].charAt(0).toLowerCase() + m[2].slice(1);
            return chain(() =>
              target.setData(name, target.getData(name) === valA ? valB : valA),
            );
          }
          unknownMethod(key);
        }
        if (raw.startsWith("text")) {
          const rest = raw.slice("text".length);
          const m = rest.match(/^([A-Z][a-zA-Z]*)With([A-Z][a-zA-Z]*)$/);
          if (m) {
            const textA = parseText(m[1]),
              textB = parseText(m[2]);
            return chain(() =>
              target.setText(target.getText() === textA ? textB : textA),
            );
          }
          unknownMethod(key);
        }
        unknownMethod(key);
      }

      // — changeThe —
      if (key.startsWith("changeThe")) {
        const raw = parseKey("changeThe", key);
        if (raw.startsWith("text")) {
          const rawValue = raw.slice("text".length);
          if (rawValue) return chain(() => target.setText(parseText(rawValue)));
          return (value) => {
            requireArg(value, key);
            return target.setText(value);
          };
        }
        if (raw.startsWith("html"))
          return (value) => {
            requireArg(value, key);
            return target.setHtml(value);
          };
        if (raw.startsWith("class")) {
          const rest = parseKey("class", raw);
          const m = rest.match(/To([A-Z][a-zA-Z]*)$/);
          if (m)
            return chain(() =>
              target.replaceClass(
                toKebab(rest.slice(0, rest.lastIndexOf("To"))),
                toKebab(m[1]),
              ),
            );
          unknownMethod(key);
        }
        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          const m = rest.match(/To([A-Z][a-zA-Z]*)$/);
          if (m)
            return chain(() =>
              target.onStyle(
                toKebab(rest.slice(0, rest.lastIndexOf("To"))),
                convertValue(m[1]),
              ),
            );
          unknownMethod(key);
        }
        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          const m = rest.match(/To([A-Z][a-zA-Z]*)$/);
          if (m)
            return chain(() =>
              target.onAttr(
                rest.slice(0, rest.lastIndexOf("To")),
                m[1].charAt(0).toLowerCase() + m[1].slice(1),
              ),
            );
          unknownMethod(key);
        }
        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          const m = rest.match(/To([A-Z][a-zA-Z]*)$/);
          if (m)
            return chain(() =>
              target.setData(
                toKebab(rest.slice(0, rest.lastIndexOf("To"))),
                m[1].charAt(0).toLowerCase() + m[1].slice(1),
              ),
            );
          unknownMethod(key);
        }
        unknownMethod(key);
      }

      // — checkThe —
      if (key.startsWith("checkThe")) {
        const raw = parseKey("checkThe", key);
        if (raw.startsWith("class"))
          return () => target.checkClass(toKebab(parseKey("class", raw)));
        if (raw.startsWith("attr")) {
          const rest = parseKey("attr", raw);
          const m = rest.match(/its/i);
          if (m) {
            const { name, value } = splitByMarker(rest, m[0]);
            return () => target.getAttr(name) === value;
          }
          return () => target.checkAttr(rest);
        }
        if (raw.startsWith("style")) {
          const rest = parseKey("style", raw);
          const m = rest.match(/its/i);
          if (m) {
            const { name, value } = splitByMarker(rest, m[0]);
            return () => target.getStyle(toKebab(name)) === convertValue(value);
          }
          return () => !!target.getStyle(toKebab(rest));
        }
        if (raw.startsWith("data")) {
          const rest = parseKey("data", raw);
          const m = rest.match(/its/i);
          if (m) {
            const { name, value } = splitByMarker(rest, m[0]);
            return () => target.getData(toKebab(name)) === value;
          }
          return () => !!target.getData(toKebab(rest));
        }
        if (raw.startsWith("text")) {
          const rawValue = raw.slice("text".length);
          if (rawValue) return () => target.getText() === parseText(rawValue);
          return (value) => {
            requireArg(value, key);
            return target.getText() === value;
          };
        }
        if (raw === "html")
          return (value) => {
            requireArg(value, key);
            return target.getHtml() === value;
          };
        unknownMethod(key);
      }

      // — dom (DOM direct access) —
      if (key.startsWith("dom")) {
        const domRaw = key.slice(3);
        const itsIndex = domRaw.search(/Its[A-Z]/);
        if (itsIndex !== -1) {
          const prop =
            domRaw.slice(0, itsIndex).charAt(0).toLowerCase() +
            domRaw.slice(0, itsIndex).slice(1);
          const value =
            domRaw
              .slice(itsIndex + 3)
              .charAt(0)
              .toLowerCase() + domRaw.slice(itsIndex + 3).slice(1);
          return () => {
            if (!target.el) throw new Error(`[dom] Element belum tersedia`);
            if (prop in target.el) {
              target.el[prop] = value;
              return proxy;
            }
            throw new Error(`[dom] "${prop}" bukan properti DOM yang valid`);
          };
        }
        const methodOrProp = domRaw.charAt(0).toLowerCase() + domRaw.slice(1);
        return (...args) => {
          if (!target.el) throw new Error(`[dom] Element belum tersedia`);
          if (typeof target.el[methodOrProp] === "function") {
            const result = target.el[methodOrProp](...args);
            return result ?? proxy;
          }
          if (methodOrProp in target.el) {
            if (args.length > 0) {
              target.el[methodOrProp] = args[0];
              return proxy;
            }
            return target.el[methodOrProp];
          }
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
}

// ============================================================
// observer.js
// ============================================================

const _obsConfig = { childList: true, subtree: true };

class getEl {
  constructor(el, selector) {
    this.el = el;
    this.selector = selector;
    this.action = [];
    this._waitForEl();
    return createProxy(this);
  }

  // Helper internal — jalankan fn untuk setiap elemen
  // Otomatis handle kasus this.el adalah array (dari goToChildren/goToSiblings)
  _each(fn) {
    if (!this.el) return;
    if (Array.isArray(this.el)) this.el.forEach(el => fn(el));
    else fn(this.el);
  }

  _waitForEl() {
    if (this.el) return;
    // FIX: Observer di-disconnect setelah elemen ditemukan
    const obs = new MutationObserver(() => {
      this.el = theElement(this.selector);
      if (this.el) {
        obs.disconnect();
        this.action.forEach((fn) => fn());
        this.action = [];
      }
    });
    obs.observe(document.body, _obsConfig);
  }

  awaitElement(items, callback, persistent = false) {
    const createObs = (fn) => {
      const obs = new MutationObserver(fn);
      obs.observe(document.body, _obsConfig);
      return obs;
    };

    if (items !== undefined) {
      // persistent=true: pantau elemen baru yg terus ditambahkan (misal list dinamis)
      // FIX: WeakSet hanya dibuat saat persistent=true
      const seen = persistent ? new WeakSet() : null;

      const check = (collection) => {
        const arr = Array.isArray(collection) ? collection : [collection];
        arr.forEach((item, index) => {
          if (seen?.has(item)) return;
          seen?.add(item);
          if (document.contains(item)) {
            callback?.(item, index);
          } else if (!persistent) {
            // FIX: Observer sudah disconnect setelah elemen masuk DOM (ini sudah benar)
            const obs = createObs(() => {
              if (document.contains(item)) {
                obs.disconnect();
                callback?.(item, index);
              }
            });
          }
        });
      };

      check(items);

      if (persistent) {
        // persistent=true sengaja tidak di-disconnect karena harus pantau elemen baru terus
        createObs(() => {
          const fresh = theElement(this.selector);
          if (fresh instanceof NodeList || fresh instanceof HTMLCollection) {
            check(Array.from(fresh));
          }
        });
      }
    }
  }

  // — Events —
  onTheEvents(event, action) {
    if (this.el) this.el.addEventListener(event, action);
    else this.action.push(() => this.el.addEventListener(event, action));
    return this;
  }
  offTheEvents(event, action) {
    this.el?.removeEventListener(event, action);
    return this;
  }

  // — Class —
  onClass(nama) {
    if (this.el) this._each(el => el.classList.add(nama));
    else this.action.push(() => this._each(el => el.classList.add(nama)));
    return this;
  }
  offClass(nama) {
    if (this.el) this._each(el => el.classList.remove(nama));
    else this.action.push(() => this._each(el => el.classList.remove(nama)));
    return this;
  }
  toggleClass(nama) {
    if (this.el) this._each(el => el.classList.toggle(nama));
    else this.action.push(() => this._each(el => el.classList.toggle(nama)));
    return this;
  }
  replaceClass(oldNama, newNama) {
    if (this.el) this._each(el => el.classList.replace(oldNama, newNama));
    else this.action.push(() => this._each(el => el.classList.replace(oldNama, newNama)));
    return this;
  }
  checkClass(nama) {
    return this.el ? this.el.classList.contains(nama) : false;
  }

  // — Style —
  onStyle(property, value) {
    if (this.el) this._each(el => el.style.setProperty(property, value.toLowerCase()));
    else this.action.push(() => this._each(el => el.style.setProperty(property, value.toLowerCase())));
    return this;
  }
  offStyle(property) {
    if (this.el) this._each(el => el.style.removeProperty(property));
    else this.action.push(() => this._each(el => el.style.removeProperty(property)));
    return this;
  }
  getStyle(property) {
    return this.el ? this.el.style.getPropertyValue(property) : null;
  }

  // — Content —
  setText(value) {
    if (this.el) this._each(el => (el.textContent = value));
    else this.action.push(() => this._each(el => (el.textContent = value)));
    return this;
  }
  getText() {
    return this.el && !Array.isArray(this.el) ? this.el.textContent : null;
  }
  setHtml(value) {
    if (this.el) this._each(el => (el.innerHTML = value));
    else this.action.push(() => this._each(el => (el.innerHTML = value)));
    return this;
  }
  getHtml() {
    return this.el ? this.el.innerHTML : null;
  }

  // — Attr —
  onAttr(nama, value) {
    if (this.el) this._each(el => el.setAttribute(nama, value));
    else this.action.push(() => this._each(el => el.setAttribute(nama, value)));
    return this;
  }
  offAttr(nama) {
    if (this.el) this._each(el => el.removeAttribute(nama));
    else this.action.push(() => this._each(el => el.removeAttribute(nama)));
    return this;
  }
  getAttr(nama) {
    return this.el ? this.el.getAttribute(nama) : null;
  }
  checkAttr(nama) {
    return this.el ? this.el.hasAttribute(nama) : false;
  }

  // — Data —
  setData(key, value) {
    if (this.el) this._each(el => el.setAttribute(`data-${key}`, value));
    else this.action.push(() => this._each(el => el.setAttribute(`data-${key}`, value)));
    return this;
  }
  getData(key) {
    return this.el && !Array.isArray(this.el) ? this.el.getAttribute(`data-${key}`) : null;
  }
  removeData(key) {
    if (this.el) this._each(el => el.removeAttribute(`data-${key}`));
    else this.action.push(() => this._each(el => el.removeAttribute(`data-${key}`)));
    return this;
  }

  // — Each —
  onTheEach(callback) {
    const run = () => {
      const isElement = this.el instanceof Element;
      const items = isElement ? [this.el] : Array.from(this.el);
      this.awaitElement(
        items,
        (el, index) => callback(new getEl(el, null), index),
        !isElement,
      );
    };
    if (this.el) run();
    else this.action.push(() => run());
    return this;
  }

  // ============================================================
  // EKSTENSI: Traversal
  // ============================================================
  goToParent() {
    return this.el ? new getEl(this.el.parentElement, null) : this;
  }
  goToNext() {
    return this.el ? new getEl(this.el.nextElementSibling, null) : this;
  }
  goToPrev() {
    return this.el ? new getEl(this.el.previousElementSibling, null) : this;
  }
  goToFirstChild() {
    return this.el ? new getEl(this.el.firstElementChild, null) : this;
  }
  goToLastChild() {
    return this.el ? new getEl(this.el.lastElementChild, null) : this;
  }
  goToClosest(selector) {
    return this.el ? new getEl(this.el.closest(selector), null) : this;
  }
  goToChildren(index) {
    if (!this.el) return new getEl(index !== undefined ? null : [], null);
    const col = Array.from(this.el.children);
    if (index !== undefined) return new getEl(col[index] ?? null, null);
    return new getEl(col, null);
  }
  goToSiblings(index) {
    if (!this.el || !this.el.parentElement) return new getEl(index !== undefined ? null : [], null);
    const col = Array.from(this.el.parentElement.children)
      .filter(child => child !== this.el);
    if (index !== undefined) return new getEl(col[index] ?? null, null);
    return new getEl(col, null);
  }

  // ============================================================
  // EKSTENSI: DOM Insertion
  // ============================================================
  putInside(nodeOrString) {
    const run = () => {
      if (!this.el) return;
      if (typeof nodeOrString === 'string') this.el.insertAdjacentHTML('beforeend', nodeOrString);
      else this.el.appendChild(nodeOrString);
    };
    this.el ? run() : this.action.push(run);
    return this;
  }
  putInsideFirst(nodeOrString) {
    const run = () => {
      if (!this.el) return;
      if (typeof nodeOrString === 'string') this.el.insertAdjacentHTML('afterbegin', nodeOrString);
      else this.el.prepend(nodeOrString);
    };
    this.el ? run() : this.action.push(run);
    return this;
  }
  putBefore(nodeOrString) {
    const run = () => {
      if (!this.el) return;
      if (typeof nodeOrString === 'string') this.el.insertAdjacentHTML('beforebegin', nodeOrString);
      else this.el.before(nodeOrString);
    };
    this.el ? run() : this.action.push(run);
    return this;
  }
  putAfter(nodeOrString) {
    const run = () => {
      if (!this.el) return;
      if (typeof nodeOrString === 'string') this.el.insertAdjacentHTML('afterend', nodeOrString);
      else this.el.after(nodeOrString);
    };
    this.el ? run() : this.action.push(run);
    return this;
  }
  takeOut() {
    const run = () => this.el?.remove();
    this.el ? run() : this.action.push(run);
    return this;
  }
  swapWith(nodeOrString) {
    const run = () => {
      if (!this.el) return;
      if (typeof nodeOrString === 'string') this.el.outerHTML = nodeOrString;
      else this.el.replaceWith(nodeOrString);
    };
    this.el ? run() : this.action.push(run);
    return this;
  }

  // ============================================================
  // EKSTENSI: Form & Input
  // ============================================================
  getValue() {
    return this.el ? this.el.value : null;
  }
  setValue(val) {
    const run = () => { if (this.el) this.el.value = val; };
    this.el ? run() : this.action.push(run);
    return this;
  }
  clearValue() {
    return this.setValue('');
  }
  focusIt() {
    const run = () => this.el?.focus();
    this.el ? run() : this.action.push(run);
    return this;
  }
  blurIt() {
    const run = () => this.el?.blur();
    this.el ? run() : this.action.push(run);
    return this;
  }
  checkIfEmpty() {
    if (!this.el) return true;
    if ('value' in this.el) return this.el.value.trim() === '';
    return this.el.textContent.trim() === '';
  }
  serializeIt() {
    if (!this.el) return {};
    const result = {};
    this.el.querySelectorAll('[name]').forEach(input => {
      const { name, type, value, checked } = input;
      if (!name) return;
      if (type === 'checkbox') result[name] = checked;
      else if (type === 'radio') { if (checked) result[name] = value; }
      else result[name] = value;
    });
    return result;
  }

  // ============================================================
  // EKSTENSI: Scroll
  // ============================================================
  scrollTo(options = { behavior: 'smooth', block: 'start' }) {
    const run = () => this.el?.scrollIntoView(options);
    this.el ? run() : this.action.push(run);
    return this;
  }
  scrollUp() {
    const run = () => { if (this.el) this.el.scrollTop = 0; };
    this.el ? run() : this.action.push(run);
    return this;
  }
  scrollDown() {
    const run = () => { if (this.el) this.el.scrollTop = this.el.scrollHeight; };
    this.el ? run() : this.action.push(run);
    return this;
  }
  getScrollTop() {
    return this.el ? this.el.scrollTop : 0;
  }

  // ============================================================
  // EKSTENSI: Animasi & Visibility
  // ============================================================
  showIt(display = '') {
    const run = () => { if (this.el) this.el.style.display = display; };
    this.el ? run() : this.action.push(run);
    return this;
  }
  hideIt() {
    const run = () => { if (this.el) this.el.style.display = 'none'; };
    this.el ? run() : this.action.push(run);
    return this;
  }
  fadeIn(duration = 300) {
    const run = () => {
      if (!this.el) return;
      this.el.style.opacity = '0';
      this.el.style.display = '';
      this.el.style.transition = `opacity ${duration}ms`;
      requestAnimationFrame(() => { this.el.style.opacity = '1'; });
    };
    this.el ? run() : this.action.push(run);
    return this;
  }
  fadeOut(duration = 300) {
    const run = () => {
      if (!this.el) return;
      this.el.style.transition = `opacity ${duration}ms`;
      this.el.style.opacity = '0';
      setTimeout(() => { if (this.el) this.el.style.display = 'none'; }, duration);
    };
    this.el ? run() : this.action.push(run);
    return this;
  }
  checkIfVisible() {
    if (!this.el) return false;
    const style = getComputedStyle(this.el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  // ============================================================
  // EKSTENSI: Ukuran & Posisi
  // ============================================================
  getSize() {
    if (!this.el) return { width: 0, height: 0 };
    const { width, height } = this.el.getBoundingClientRect();
    return { width, height };
  }
  getPosition() {
    if (!this.el) return { top: 0, left: 0, right: 0, bottom: 0 };
    const { top, left, right, bottom } = this.el.getBoundingClientRect();
    return { top, left, right, bottom };
  }
  getRect() {
    return this.el?.getBoundingClientRect() ?? null;
  }

  // ============================================================
  // EKSTENSI: Clone & Clipboard
  // ============================================================
  cloneIt(deep = true) {
    return this.el ? new getEl(this.el.cloneNode(deep), null) : this;
  }
  copyTextToClipboard() {
    if (!this.el) return this;
    const text = 'value' in this.el ? this.el.value : this.el.textContent;
    navigator.clipboard?.writeText(text).catch(console.error);
    return this;
  }

  // ============================================================
  // EKSTENSI: Utilitas
  // ============================================================
  getTag() {
    return this.el ? this.el.tagName.toLowerCase() : null;
  }
  matches(selector) {
    return this.el ? this.el.matches(selector) : false;
  }
  getRaw() {
    return this.el;
  }
  checkIfExists() {
    return !!this.el;
  }
}

const getelemen = {
  el(selector) {
    return new getEl(theElement(selector), selector);
  },
};

// ============================================================
// dom-proxy.js
// ============================================================

const _prefixMap = {
  ById: "id",
  Class: "class",
  Tag: "tag",
  Name: "name",
  All: "all",
};
const _prefixKeys = Object.keys(_prefixMap);

function parseSelector(key) {
  for (const prefix of _prefixKeys) {
    if (key.startsWith(`getElement${prefix}`)) {
      const raw = key.slice(`getElement${prefix}`.length);
      const name = raw.charAt(0).toLowerCase() + raw.slice(1);
      return `${_prefixMap[prefix]}:${name}`;
    }
  }
  if (key.startsWith("getElement")) {
    const raw = key.slice("getElement".length);
    return raw.charAt(0).toLowerCase() + raw.slice(1);
  }
  return null;
}

const domProxy = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      const selector = parseSelector(key);
      if (!selector) return undefined;
      return () => getelemen.el(selector);
    },
  },
);

// ============================================================
// component.js
// ============================================================

const _toCamelCase = (str) =>
  str
    .split("-")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");

const _toFileName = (str) => str.charAt(0).toLowerCase() + str.slice(1);

function parseComponents(htmlString, fileName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const compTags = Array.from(doc.body.children).filter((el) =>
    el.tagName.toLowerCase().startsWith("comp-"),
  );
  if (compTags.length === 0)
    return { [_toCamelCase(fileName)]: doc.body.innerHTML.trim() };
  return Object.fromEntries(
    compTags.map((el) => {
      const rawName = el.tagName.toLowerCase().slice("comp-".length);
      return [_toCamelCase(rawName), el.innerHTML.trim()];
    }),
  );
}

function hasDataSlot(htmlString) {
  return (
    new DOMParser()
      .parseFromString(htmlString, "text/html")
      .querySelector("[this-data]") !== null
  );
}

function renderComponent(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content.cloneNode(true);
}

const _componentRegistry = {};

async function loadComponent(fileName) {
  if (_componentRegistry[fileName]) return _componentRegistry[fileName];
  const html = await load(`/components/${fileName}.html`);
  const parsed = parseComponents(html, fileName);
  const result = {};
  for (const [name, htmlString] of Object.entries(parsed)) {
    const withData = hasDataSlot(htmlString);
    result[name] = {
      _html: htmlString,
      _withData: withData,
      data(obj = {}) {
        if (!withData) {
          console.warn(
            `[component] Komponen "${name}" tidak memiliki slot data.`,
          );
          return htmlString;
        }
        if (Array.isArray(obj))
          return obj.map((item) => injectData(htmlString, item)).join("");
        return injectData(htmlString, obj);
      },
      render(obj = {}) {
        const process = (item) => {
          const html = withData ? injectData(htmlString, item) : htmlString;
          // FIX: tidak spread DocumentFragment, langsung kembalikan node
          return renderComponent(html);
        };
        if (Array.isArray(obj)) return obj.map(process);
        return process(obj);
      },
    };
  }
  _componentRegistry[fileName] = result;
  return result;
}

const component = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== "string" || !key.startsWith("useComponentFrom"))
        return undefined;
      const fileName = _toFileName(key.slice("useComponentFrom".length));
      return async () => loadComponent(fileName);
    },
  },
);

// ============================================================
// builder.js
// ============================================================

const _selfClosing = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

class El {
  constructor(input) {
    this._input = input;
    this._data = {};
  }

  data(obj) {
    this._data = obj;
    return this;
  }

  _buildEl(obj) {
    const { tag = "div", class: cls, attr = {}, children } = obj;
    let attrString = cls ? ` class="${cls}"` : "";
    for (const [key, val] of Object.entries(attr))
      attrString += ` ${key}="${val}"`;

    if (_selfClosing.has(tag)) return `<${tag}${attrString} />`;

    let inner = "";
    if (Array.isArray(children))
      inner = children.map((c) => this._buildEl(c)).join("");
    else if (children !== undefined) inner = children;

    const html = `<${tag}${attrString}>${inner}</${tag}>`;
    return Object.keys(this._data).length > 0
      ? injectData(html, this._data)
      : html;
  }

  _toHtmlString() {
    return Array.isArray(this._input)
      ? this._input.map((obj) => this._buildEl(obj)).join("")
      : this._buildEl(this._input);
  }

  done() {
    const string = this._toHtmlString();
    const template = document.createElement("template");
    template.innerHTML = string;
    // FIX: hapus variabel node redundant
    return { string, node: template.content.cloneNode(true) };
  }
}

function parseMethodName(key) {
  const parts = key.slice("build".length).split("With");
  const tag = parts[0].toLowerCase() || "div";
  let cls;
  const attr = {};
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("Class") && part.slice(5).startsWith("This"))
      cls = part.slice(9).toLowerCase();
    else if (part.startsWith("Attr") && part.slice(4).startsWith("This")) {
      const afterThis = part.slice(8);
      const itsIndex = afterThis.indexOf("Its");
      if (itsIndex !== -1)
        attr[afterThis.slice(0, itsIndex).toLowerCase()] = afterThis
          .slice(itsIndex + 3)
          .toLowerCase();
    }
  }
  return { tag, class: cls, attr };
}

const el = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      if (key === "build") return (options = {}) => new El(options);
      if (key.startsWith("build"))
        return (options = {}) =>
          new El({ ...parseMethodName(key), ...options });
      return undefined;
    },
  },
);

// ============================================================
// build.js
// ============================================================

const _page = document.querySelector("main");
const _style = document.querySelector("style");
const _cache = {};

// FIX: cache hasil resolveComponents juga, bukan hanya raw HTML
const _resolvedCache = {};

async function resolveComponents(htmlString, cacheKey) {
  if (_resolvedCache[cacheKey]) return _resolvedCache[cacheKey];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const bases = doc.querySelectorAll("base[comp]");

  if (bases.length === 0) {
    _resolvedCache[cacheKey] = htmlString;
    return htmlString;
  }

  for (const el of bases) {
    const fileName = el.getAttribute("file");
    const compName = el.getAttribute("comp");
    if (!fileName) {
      console.warn(
        `[resolveComponents] Attribute "file" wajib diisi pada <base comp="${compName}">`,
      );
      continue;
    }

    const data = {};
    for (const attr of el.attributes) {
      if (attr.name.startsWith("data-")) data[attr.name.slice(5)] = attr.value;
    }

    // FIX: cache file komponen supaya tidak fetch ulang
    if (!_cache[`comp:${fileName}`])
      _cache[`comp:${fileName}`] = await load(`/components/${fileName}.html`);
    const compDoc = parser.parseFromString(
      _cache[`comp:${fileName}`],
      "text/html",
    );
    const compEl = compDoc.querySelector(`comp-${compName}`);
    if (!compEl) continue;

    let compHtml = injectData(compEl.innerHTML.trim(), data);
    const template = doc.createElement("template");
    template.innerHTML = compHtml;
    el.replaceWith(template.content.cloneNode(true));
  }

  const result = doc.body.innerHTML;
  _resolvedCache[cacheKey] = result;
  return result;
}

async function buildPage(data) {
  document.title = data.title;

  if (!_cache[`page:${data.page}`])
    _cache[`page:${data.page}`] = await load(`/page/${data.page}.html`);
  const resolvedHtml = await resolveComponents(
    _cache[`page:${data.page}`],
    `page:${data.page}`,
  );
  _page.innerHTML = resolvedHtml;

  if (!_cache[`style:${data.style}`])
    _cache[`style:${data.style}`] = await load(`/style/${data.style}.css`);
  _style.textContent = _cache[`style:${data.style}`];

  // FIX: tambah try/catch untuk import logic
  if (data.logic) {
    try {
      await import(`/logic/${data.logic}.js`);
    } catch (err) {
      console.warn(`[buildPage] Gagal memuat logic "${data.logic}":`, err);
    }
  }

  requestAnimationFrame(() => runPageInit(data.page));
}

// ============================================================
// app.js
// ============================================================

window.onerror = (msg, src, line, col) => {
  document.body.innerHTML = `<p style="color:red;padding:1rem">${msg}<br>${src}:${line}:${col}</p>`;
};

async function runWeb() {
  try {
    const path = window.location.pathname;
    const data = await checkPath(path);
    if (!data) throw new Error("Route tidak ditemukan");
    await buildPage(data);
  } catch (err) {
    console.error("runWeb gagal:", err);
    const main = document.querySelector("#main-go");
    if (main) main.innerHTML = "<p>Terjadi kesalahan saat memuat halaman.</p>";
  }
}

runWeb();
window.addEventListener("popstate", () => runWeb());

document.addEventListener("click", (e) => {
  const anchor = e.target.closest("[href]");
  if (!anchor) return;
  const url = anchor.getAttribute("href");
  if (!url) return;

  // FIX: cek URL eksternal dengan cara yg benar, bukan string matching
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return;
    if (url.startsWith("#")) return;
  } catch {
    return;
  }

  e.preventDefault();
  history.pushState({}, "", url);
  runWeb();
});

// ============================================================
// Exports (gunakan sesuai kebutuhan module system kamu)
// ============================================================

export {
  load,
  checkPath,
  injectData,
  theElement,
  registerPage,
  runPageInit,
  createProxy,
  getelemen,
  domProxy,
  parseComponents,
  component,
  el,
  buildPage,
};
