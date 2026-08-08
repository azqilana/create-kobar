class elementHandler {
  constructor(selector) {
    this.selector = selector;
    this.selectors = null;
    this.type = null;
    this.element = null;
    if (this.selector.includes(":")) {
      this.selectors = this.selectorSplit();
      this.type = this.selectors[0].toLowerCase();
      if (this.type) {
        this.cekType();
      }
    } else {
      this.getElement();
    }
  }
  selectorSplit() {
    const selectors = this.selector.split(":");
    return selectors;
  }
  cekType() {
    const aType = ["all", "class", "id", "name", "tag"];
    if (aType.includes(this.type)) {
      this.selectType();
    } else {
      throw new Error(
        `Prefix "${this.type}" tidak dikenal. Gunakan salah satu: ${aType.join(", ")}`,
      );
    }
  }
  selectType() {
    if (this.type === "all") this.byAll();
    else if (this.type === "id") this.byId();
    else if (this.type === "class") this.byClass();
    else if (this.type === "tag") this.byTag();
    else if (this.type === "name") this.byName();
  }
  byAll() {
    return (this.element = document.querySelectorAll(this.selectors[1]));
  }
  byId() {
    return (this.element = document.getElementById(this.selectors[1]));
  }
  byClass() {
    return (this.element = document.getElementsByClassName(this.selectors[1]));
  }
  byTag() {
    return (this.element = document.getElementsByTagName(this.selectors[1]));
  }
  byName() {
    return (this.element = document.getElementsByName(this.selectors[1]));
  }
  getElement() {
    return (this.element = document.querySelector(this.selector));
  }
}

export function theElement(selector) {
  return new elementHandler(selector).element;
}
