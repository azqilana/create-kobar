import { load } from "./route.js";
import { runPageInit } from "./registry.js";

const page = document.querySelector("main");
const style = document.querySelector("style");
const nav = document.querySelector("#nav-go");
const header = document.querySelector("#header-go");
const aside = document.querySelector("#aside-go");
const footer = document.querySelector("#footer-go");
let theCache = {}; // ✅ Fix: typo theChace → theCache

async function buildLayout(layoutName) {
  const slots = { nav, header, aside, footer };

  if (!layoutName) {
    Object.values(slots).forEach((slot) => (slot.innerHTML = ""));
    return "";
  }

  let theLayoutHtml = theCache[`layout:${layoutName}`];
  if (!theLayoutHtml) {
    theLayoutHtml = await load(`./page/template/${layoutName}.html`);
    theCache[`layout:${layoutName}`] = theLayoutHtml;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(theLayoutHtml, "text/html");

  Object.entries(slots).forEach(([id, slot]) => {
    const bagian = doc.querySelector(`#${id}`);
    slot.innerHTML = bagian ? bagian.innerHTML : "";
  });
}

export async function buildPage(data) {
  document.title = data.title;
  let thePage = theCache[`page:${data.page}`];
  if (!thePage) {
    thePage = await load(`./page/${data.page}.html`);
    theCache[`page:${data.page}`] = thePage;
  }
  page.innerHTML = thePage;

  let theStyle = theCache[`style:${data.style}`];
  if (!theStyle) {
    theStyle = await load(`./style/${data.style}.css`);
    theCache[`style:${data.style}`] = theStyle;
  }
  style.textContent = theStyle;
  await buildLayout(data.layout);
  await import(`/logic/${data.logic}.js`);
  requestAnimationFrame(() => {
    runPageInit(data.page);
  });
}
