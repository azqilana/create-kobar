import { injectData } from "./inject.js";

const selfClosing = [
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
];

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

    let attrString = "";
    if (cls) attrString += ` class="${cls}"`;
    for (const [key, val] of Object.entries(attr)) {
      attrString += ` ${key}="${val}"`;
    }

    if (selfClosing.includes(tag)) {
      return `<${tag}${attrString} />`;
    }

    let inner = "";
    if (Array.isArray(children)) {
      inner = children.map((c) => this._buildEl(c)).join("");
    } else if (children !== undefined) {
      inner = children;
    }

    const html = `<${tag}${attrString}>${inner}</${tag}>`;

    if (Object.keys(this._data).length > 0) {
      return injectData(html, this._data);
    }

    return html;
  }

  _toHtmlString() {
    if (Array.isArray(this._input)) {
      return this._input.map((obj) => this._buildEl(obj)).join("");
    }
    return this._buildEl(this._input);
  }

  done() {
    const string = this._toHtmlString();
    const template = document.createElement("template");
    template.innerHTML = string;
    const rawNode = template.content.cloneNode(true);
    const node = rawNode;
    return { string, node };
  }
}

function parseMethodName(key) {
  const withoutBuild = key.slice("build".length);
  const parts = withoutBuild.split("With");
  const tag = parts[0].toLowerCase() || "div";

  let cls = undefined;
  const attr = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith("Class")) {
      const afterClass = part.slice("Class".length);
      if (afterClass.startsWith("This")) {
        cls = afterClass.slice("This".length).toLowerCase();
      }
    } else if (part.startsWith("Attr")) {
      const afterAttr = part.slice("Attr".length);
      if (afterAttr.startsWith("This")) {
        const afterThis = afterAttr.slice("This".length);
        const itsIndex = afterThis.indexOf("Its");
        if (itsIndex !== -1) {
          const attrName = afterThis.slice(0, itsIndex).toLowerCase();
          const attrVal = afterThis
            .slice(itsIndex + "Its".length)
            .toLowerCase();
          attr[attrName] = attrVal;
        }
      }
    }
  }

  return { tag, class: cls, attr };
}

export const el = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== "string") return undefined;

      if (key === "build") {
        return (options = {}) => new El(options);
      }

      if (key.startsWith("build")) {
        return (options = {}) => {
          const parsed = parseMethodName(key);
          return new El({ ...parsed, ...options });
        };
      }

      return undefined;
    },
  },
);
