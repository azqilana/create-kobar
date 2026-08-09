import { theElement } from "./element.js";
import { createProxy } from "./proxy.js";

// ubah constructor
class getEl {
  constructor(selector) {
    this.selector = selector;
    this.el = theElement(this.selector);
    this.action = [];
    this.awaitElement();
    return createProxy(this);
  }

  awaitElement() {
    if (this.el) return;

    const Obs = new MutationObserver(() => {
      this.el = theElement(this.selector);
      if (this.el) {
        Obs.disconnect(); // ✅ Fix: hapus clearTimeout(timeout) yang tidak terdefinisi
        this.action.forEach((fn) => fn());
        this.action = [];
      }
    });

    Obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
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
      this.el.style.setProperty(property, value.toLowerCase()); // ✅ Fix: typo toLowecase → toLowerCase()
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
}

export default {
  el(selector) {
    return new getEl(selector);
  },
};
