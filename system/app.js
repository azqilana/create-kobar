import { checkPath } from "./route.js";
import { buildPage } from "./build.js";

window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<p style="color:red;padding:1rem">${msg}<br>${src}:${line}:${col}</p>`;
};

async function runWeb() {
  try {
    const path = window.location.pathname;
    const data = await checkPath(path);
    if (!data) throw new Error("Route tidak ditemukan");
    await buildPage(data);
  } catch (err) {
    console.error("runWeb gagal:", err);
    document.querySelector("#main-go").innerHTML =
      "<p>Terjadi kesalahan saat memuat halaman.</p>";
  }
}

runWeb();
window.addEventListener("popstate", () => runWeb());

document.addEventListener("click", (e) => {
  const anchor = e.target.closest("[href]");
  if (!anchor) return;
  const url = anchor.getAttribute("href");
  if (url) {
    const isExcluded = ["http://", "https://", "mailto:", "tel:", "#"].some(
      (ex) => url.includes(ex),
    );
    if (!isExcluded) {
      e.preventDefault();
      history.pushState({}, "", url);
      runWeb();
    }
  }
});
