import { load } from "./route.js";
import { runPageInit } from "./registry.js";

const page = document.querySelector("main");
const style = document.querySelector("style");
const nav = document.querySelector("#nav-go");
const header = document.querySelector("#header-go");
const aside = document.querySelector("#aside-go");
const footer = document.querySelector("#footer-go");
let theCache = {}; // ✅ Fix: typo theChace → theCache

async function resolveComponents(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const bases = doc.querySelectorAll("base[comp]");

  if (bases.length === 0) return htmlString;

  for (const el of bases) {
    const fileName = el.getAttribute("file");
    const compName = el.getAttribute("comp");

    if (!fileName) {
      console.warn(
        `[resolveComponents] Attribute "file" wajib diisi pada <base comp="${compName}">`,
      );
      continue;
    }

    // Ambil data-* attribute
    const data = {};
    for (const attr of el.attributes) {
      if (attr.name.startsWith("data-")) {
        data[attr.name.slice(5)] = attr.value;
      }
    }

    // Load file component
    const fileHtml = await load(`/components/${fileName}.html`);

    // Parse ambil component yang sesuai
    const compDoc = parser.parseFromString(fileHtml, "text/html");
    const compEl = compDoc.querySelector(`comp-${compName}`);
    if (!compEl) continue;
    let compHtml = compEl.innerHTML.trim();

    // Inject data ke slot <meta this-data="...">
    const slotDoc = parser.parseFromString(compHtml, "text/html");
    slotDoc.querySelectorAll("[this-data]").forEach((slot) => {
      const key = slot.getAttribute("this-data");
      if (!(key in data)) return;
      if (slot.tagName.toLowerCase() === "meta") {
        slot.replaceWith(data[key]);
      } else {
        slot.removeAttribute("this-data");
        slot.setAttribute(`data-${key}`, data[key]);
      }
    });
    compHtml = slotDoc.body.innerHTML;

    // Replace tag <base> dengan hasil
    const template = doc.createElement("template");
    template.innerHTML = compHtml;
    el.replaceWith(template.content.cloneNode(true));
  }

  return doc.body.innerHTML;
}

export async function buildPage(data) {
  document.title = data.title;
  let thePage = theCache[`page:${data.page}`];
  if (!thePage) {
    thePage = await load(`/page/${data.page}.html`);
    theCache[`page:${data.page}`] = thePage;
  }
  thePage = await resolveComponents(thePage);
  page.innerHTML = thePage;
  let theStyle = theCache[`style:${data.style}`];
  if (!theStyle) {
    theStyle = await load(`/style/${data.style}.css`);
    theCache[`style:${data.style}`] = theStyle;
  }
  style.textContent = theStyle;
  await import(`/logic/${data.logic}.js`);
  requestAnimationFrame(() => {
    runPageInit(data.page);
  });
}
