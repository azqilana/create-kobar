import getelemen from "./observer.js";
import { load } from "./route.js";

// — Helper —

const toCamelCase = (str) =>
  str
    .split("-")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");

const toFileName = (str) => str.charAt(0).toLowerCase() + str.slice(1);

// — Parse komponen dari HTML string —

export function parseComponents(htmlString, fileName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const body = doc.body;

  const compTags = Array.from(body.children).filter((el) =>
    el.tagName.toLowerCase().startsWith("comp-"),
  );

  const result = {};

  if (compTags.length === 0) {
    const name = toCamelCase(fileName);
    result[name] = body.innerHTML.trim();
  } else {
    compTags.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const rawName = tagName.slice("comp-".length);
      const name = toCamelCase(rawName);
      result[name] = el.innerHTML.trim();
    });
  }

  return result;
}

// — Cek apakah komponen punya slot data (this-*) —
function hasDataSlot(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  return doc.querySelector("meta[this-data]") !== null;
}

// — Inject data ke slot this-* —

export function injectData(htmlString, data) {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  doc.querySelectorAll("meta[this-data]").forEach((el) => {
    const key = el.getAttribute("this-data");
    if (key in data) {
      el.replaceWith(data[key]);
    }
  });
  return doc.body.innerHTML;
}
// — Render HTML string ke DOM dan auto-collect elements —

function renderComponent(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  const fragment = template.content.cloneNode(true);

  const elements = {};

  // Collect elements dengan ID
  fragment.querySelectorAll("[id]").forEach((el) => {
    elements[el.id] = el;
  });

  // Collect elements dengan data-ref (auto convert kebab-case ke camelCase)
  fragment.querySelectorAll("[data-ref]").forEach((el) => {
    const refName = el.getAttribute("data-ref");
    const camelName = refName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    elements[camelName] = el;
  });

  return {
    element: fragment,
    elements,
    querySelector(selector) {
      return fragment.querySelector(selector);
    },
    querySelectorAll(selector) {
      return Array.from(fragment.querySelectorAll(selector));
    },
  };
}

// — Registry internal —

const componentRegistry = {};

// — Load dan parse file komponen —

async function loadComponent(fileName) {
  if (componentRegistry[fileName]) return componentRegistry[fileName];

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
        return injectData(htmlString, obj);
      },
      render(obj = {}) {
        const html = withData ? injectData(htmlString, obj) : htmlString;
        return renderComponent(html);
      },
    };
  }

  componentRegistry[fileName] = result;
  return result;
}

// — Proxy utama —
// Menangkap: useComponentFromNamaFile()

export const component = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      if (!key.startsWith("useComponentFrom")) return undefined;

      const rawName = key.slice("useComponentFrom".length);
      const fileName = toFileName(rawName);

      return async () => {
        const components = await loadComponent(fileName);
        return components;
      };
    },
  },
);
