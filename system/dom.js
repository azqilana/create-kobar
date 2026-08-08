// — dom.js —
// Proxy yang memforward semua method DOM asli via prefix "html"
// Contoh: htmlAppendChild(node) → el.appendChild(node)
//         htmlScrollIntoView()  → el.scrollIntoView()
//         htmlRemove()          → el.remove()

export const createDomProxy = (inner) => {
  const proxy = new Proxy(inner, {
    get(target, key) {
      if (typeof key !== "string") return undefined;

      // Kalau sudah ditangani proxy sebelumnya (createProxy), teruskan
      const fromInner = target[key];
      if (fromInner !== undefined) return fromInner;

      // Tangkap prefix "html"
      if (key.startsWith("html")) {
        const raw = key.slice("html".length);

        // Wajib ada nama method setelah "html"
        if (!raw) throw new Error(`[dom] Nama method tidak boleh kosong`);

        // huruf pertama jadi kecil: AppendChild → appendChild
        const domMethod = raw.charAt(0).toLowerCase() + raw.slice(1);

        return (...args) => {
          const el = target.el;

          if (!el) throw new Error(`[dom] Element belum tersedia`);
          if (typeof el[domMethod] !== "function")
            throw new Error(`[dom] "${domMethod}" bukan method DOM yang valid`);

          const result = el[domMethod](...args);

          // Kalau return void/undefined → kembalikan proxy agar bisa chain
          return result ?? proxy;
        };
      }

      return undefined;
    },
  });

  return proxy;
};
