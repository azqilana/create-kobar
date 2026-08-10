import getelemen from "./observer.js";

const prefixes = ["ById", "Class", "Tag", "Name", "All"];

const prefixMap = {
  ById: "id",
  Class: "class",
  Tag: "tag",
  Name: "name",
  All: "all",
};

const parseSelector = (key) => {
  for (const prefix of prefixes) {
    if (key.startsWith(`getElement${prefix}`)) {
      const raw = key.slice(`getElement${prefix}`.length);
      const name = raw.charAt(0).toLowerCase() + raw.slice(1);
      return `${prefixMap[prefix]}:${name}`;
    }
  }

  // Fallback: querySelector biasa
  if (key.startsWith("getElement")) {
    const raw = key.slice("getElement".length);
    return raw.charAt(0).toLowerCase() + raw.slice(1);
  }

  return null;
};

export const domProxy = new Proxy(
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
