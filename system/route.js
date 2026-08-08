export async function load(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) {
      throw new Error(`Gagal memuat "${file}": HTTP ${res.status}`); // ✅ Fix: throw error, bukan hanya log
    }
    if (file.includes("json")) {
      return await res.json();
    } else {
      return await res.text();
    }
  } catch (error) {
    console.error(`[load] Error saat memuat "${file}":`, error);
    throw error; // ✅ Fix: re-throw agar pemanggil bisa handle
  }
}

let route = null;

export async function checkPath(url) {
  if (!route) {
    route = await load(`/config/route.json`);
  }
  if (url === "/index.html") {
    return route["/"];
  } else {
    return route[url] ?? route["/404"]; // ✅ Fix: lebih ringkas dengan nullish coalescing
  }
}
