import getelemen from "./system/observer.js";
import { registerPage } from "./system/registry.js";

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
}

const helper = new Helper();
export default helper;
