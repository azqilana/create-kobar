import { load } from "./route.js";
import getelemen from "./observer.js";

// — Helper —

const toCamelCase = (str) =>
  str
    .split("-")
    .map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");

const toFileName = (str) =>
  str
    .split(/(?=[A-Z])/)
    .filter(Boolean) // [PERBAIKAN] Membuang string kosong di awal agar path file tidak salah
    .map((w) => w.toLowerCase())
    .join("-");

// — Parse komponen dari HTML string —

function parseComponents(htmlString, fileName) {
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
  // [PERBAIKAN] Regex disesuaikan karena DOMParser bisa mengubah format self-closing tag
  return /<this-[a-zA-Z0-9-]+[^>]*>/i.test(htmlString);
}

// — Inject data ke slot this-* —

function injectData(htmlString, data) {
  let result = htmlString;
  for (const [key, value] of Object.entries(data)) {
    // [PERBAIKAN] Regex menangkap self-closing tag dan tag yang ditutup otomatis
    const regex = new RegExp(`<this-${key}[^>]*>(?:<\\/this-${key}>)?`, "gi");
    result = result.replace(regex, value);
  }
  return result;
}

// — Buat proxy akses elemen —
// Cari by tag dulu, lalu .class, lalu #id

function elProxy() {
  return new Proxy(
    {},
    {
      get(_, elKey) {
        if (typeof elKey !== "string") return undefined;
        if (elKey === "then") return undefined;
        
        // [PERBAIKAN] Dibungkus try-catch untuk mencegah DOMException jika query tidak valid
        try {
          const byTag = document.querySelector(elKey);
          const byClass = document.querySelector(`.${elKey}`);
          const byId = document.querySelector(`#${elKey}`);
          const found = byTag || byClass || byId;
          
          if (!found) return getelemen.el(`#${elKey}`); // fallback ke observer (await DOM)
          
          return getelemen.el(
            byTag ? elKey : byClass ? `.${elKey}` : `#${elKey}`,
          );
        } catch (error) {
          // Fallback aman jika elKey mengandung karakter tidak valid untuk querySelector
          return getelemen.el(`#${elKey}`);
        }
      },
    },
  );
}

// — Registry internal —

const componentRegistry = {};

// — Load dan parse file komponen —

async function loadComponent(fileName) {
  if (componentRegistry[fileName]) return componentRegistry[fileName];

  const html = await load(`/page/template/${fileName}.html`);
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
