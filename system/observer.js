import { theElement } from "./element.js";
import { createProxy } from "./proxy.js";

class getEl {
  constructor(el, selector) {
    this.el = el;
    this.selector = selector;
    this.action = [];
    this.awaitElement();
    return createProxy(this);
  }

  awaitElement(items, callback, persistent = false) {
    const obsConfig = { childList: true, subtree: true, attributes: true };
    const createObs = (fn) => {
      const Obs = new MutationObserver(fn);
      Obs.observe(document.body, obsConfig);
      return Obs;
    };

    if (items !== undefined) {
      const seen = persistent ? new WeakSet() : null;

      const check = (collection) => {
        const arr = Array.isArray(collection) ? collection : [collection];
        arr.forEach((item, index) => {
          if (seen && seen.has(item)) return;
          if (seen) seen.add(item);
          if (document.contains(item)) {
            callback && callback(item, index);
          } else if (!persistent) {
            const Obs = createObs(() => {
              if (document.contains(item)) {
                Obs.disconnect();
                callback && callback(item, index);
              }
            });
          }
        });
      };

      check(items);

      if (persistent) {
        createObs(() => {
          const fresh = theElement(this.selector);
          if (fresh instanceof NodeList || fresh instanceof HTMLCollection) {
            check(Array.from(fresh));
          }
        });
      }

      return;
    }

    if (this.el) return;

    createObs(() => {
      this.el = theElement(this.selector);
      if (this.el) {
        this.action.forEach((fn) => fn());
        this.action = [];
      }
    });
  }

  // — Events —
  onTheEvents(event, action) {
    if (this.el) {
      this.el.addEventListener(event, action);
    } else {
      this.action.push(() => this.el.addEventListener(event, action));
    }
    return this;
  }
  offTheEvents(event, action) {
    if (this.el) {
      this.el.removeEventListener(event, action);
    }
    return this;
  }

  // — Class —
  onClass(nama) {
    if (this.el) {
      this.el.classList.add(nama);
    } else {
      this.action.push(() => this.el.classList.add(nama));
    }
    return this;
  }
  offClass(nama) {
    if (this.el) {
      this.el.classList.remove(nama);
    } else {
      this.action.push(() => this.el.classList.remove(nama));
    }
    return this;
  }
  toggleClass(nama) {
    if (this.el) {
      this.el.classList.toggle(nama);
    } else {
      this.action.push(() => this.el.classList.toggle(nama));
    }
    return this;
  }
  replaceClass(oldNama, newNama) {
    if (this.el) {
      this.el.classList.replace(oldNama, newNama);
    } else {
      this.action.push(() => this.el.classList.replace(oldNama, newNama));
    }
    return this;
  }
  checkClass(nama) {
    if (this.el) return this.el.classList.contains(nama);
    return false;
  }

  // — Style —
  onStyle(property, value) {
    if (this.el) {
      this.el.style.setProperty(property, value.toLowerCase());
    } else {
      this.action.push(() =>
        this.el.style.setProperty(property, value.toLowerCase()),
      );
    }
    return this;
  }
  offStyle(property) {
    if (this.el) {
      this.el.style.removeProperty(property);
    } else {
      this.action.push(() => this.el.style.removeProperty(property));
    }
    return this;
  }
  getStyle(property) {
    if (this.el) return this.el.style.getPropertyValue(property);
    return null;
  }

  // — Content —
  setText(value) {
    if (this.el) {
      this.el.textContent = value;
    } else {
      this.action.push(() => (this.el.textContent = value));
    }
    return this;
  }
  getText() {
    if (this.el) return this.el.textContent;
    return null;
  }
  setHtml(value) {
    if (this.el) {
      this.el.innerHTML = value;
    } else {
      this.action.push(() => (this.el.innerHTML = value));
    }
    return this;
  }
  getHtml() {
    if (this.el) return this.el.innerHTML;
    return null;
  }

  // — Attr —
  onAttr(nama, value) {
    if (this.el) {
      this.el.setAttribute(nama, value);
    } else {
      this.action.push(() => this.el.setAttribute(nama, value));
    }
    return this;
  }
  offAttr(nama) {
    if (this.el) {
      this.el.removeAttribute(nama);
    } else {
      this.action.push(() => this.el.removeAttribute(nama));
    }
    return this;
  }
  getAttr(nama) {
    if (this.el) return this.el.getAttribute(nama);
    return null;
  }
  checkAttr(nama) {
    if (this.el) return this.el.hasAttribute(nama);
    return false;
  }

  // — Data —
  setData(key, value) {
    if (this.el) {
      this.el.setAttribute(`data-${key}`, value);
    } else {
      this.action.push(() => this.el.setAttribute(`data-${key}`, value));
    }
    return this;
  }
  getData(key) {
    if (this.el) return this.el.getAttribute(`data-${key}`);
    return null;
  }
  removeData(key) {
    if (this.el) {
      this.el.removeAttribute(`data-${key}`);
    } else {
      this.action.push(() => this.el.removeAttribute(`data-${key}`));
    }
    return this;
  }

  // — Each —
  onTheEach(callback) {
    const run = () => {
      if (this.el instanceof NodeList || this.el instanceof HTMLCollection) {
        this.awaitElement(
          Array.from(this.el),
          (el, index) => callback(new getEl(el, null), index),
          true,
        );
      } else if (this.el instanceof Element) {
        this.awaitElement(this.el, (el) => callback(new getEl(el, null), 0));
      }
    };

    if (this.el) {
      run();
    } else {
      this.action.push(() => run());
    }

    return this;
  }
}

export default {
  el(selector) {
    return new getEl(theElement(selector), selector);
  },
};
