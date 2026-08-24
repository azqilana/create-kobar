import {
  getelemen,
  registerPage,
  component,
  domProxy,
  el,
  load,
} from "./system/bundle.js";

class Helper {
  getElement(...selector) {
    if (selector.length !== 1) {
      return selector.map((item) => getelemen.el(item));
    }
    return getelemen.el(selector[0]);
  }
  register(name, intFunc) {
    return registerPage(name, intFunc);
  }
  async useData(data) {
    return await load(data);
  }
  useNav() {
    return this.getElement("#nav-go");
  }
  useHeader() {
    return this.getElement("#header-go");
  }
  useAside() {
    return this.getElement("#aside-go");
  }
  useFooter() {
    return this.getElement("#footer-go");
  }
  useBody() {
    return this.getElement("body");
  }
  useRoot() {
    return this.getElement("html");
  }
}

const kobar = new Helper();

export default new Proxy(kobar, {
  get(target, key) {
    if (key in target) return target[key];
    if (typeof key === "string" && key.startsWith("useComponentFrom")) {
      return component[key];
    }
    if (typeof key === "string" && key.startsWith("getElement")) {
      return domProxy[key];
    }
    if (typeof key === "string" && key.startsWith("build")) {
      return el[key];
    }
  },
});
