# 🔥 create-kobar

CLI scaffold untuk membuat project berbasis **Kobar** — framework JavaScript ringan dengan arsitektur Component-Observer.

## 🚀 Cara Pakai

```bash
npx create-kobar nama-project
```

Atau dengan package manager lain:

```bash
pnpm create kobar nama-project
yarn create kobar nama-project
npm create kobar@latest nama-project
```

## 📁 Struktur Project

```
nama-project/
├── components/       # File komponen HTML
├── config/
│   └── route.json    # Konfigurasi routing
├── logic/            # Logic per halaman (.js)
├── page/             # File halaman HTML
├── style/            # File CSS per halaman
├── system/
│   └── kobar.min.js  # Core Kobar (bundle & minify)
├── _redirects        # Redirect untuk Netlify/Cloudflare
├── index.html        # Entry point HTML
└── index.js          # Entry point JS & Helper
```

---

## 📦 Kenapa Import dari `index.js`?

```js
import Helper from "../index.js";
```

Karena `index.js` adalah **satu-satunya pintu masuk** ke semua fitur Kobar:

- **Auto-start app** — routing otomatis aktif begitu file di-load, tidak perlu setup manual
- **Helper siap pakai** — `getElement`, `register`, `useNav`, `useHeader`, dll sudah tersedia
- **Component proxy** — akses komponen dari file manapun secara dinamis via `useComponentFromNamaFile`
- **Satu import, semua tersedia** — tidak perlu import tiap file `system/` satu per satu

---

## 🧩 Helper API

### `Helper.register(nama, fn)`
Daftarkan logic untuk halaman tertentu.

```js
Helper.register("beranda", async () => {
  // logic halaman beranda
});
```

### `Helper.getElement(...selector)`
Ambil satu atau banyak element sekaligus. Mengembalikan instance dengan method berantai.

```js
const judul = Helper.getElement("#judul");
const [input, tombol] = Helper.getElement("#input", "#tombol");
```

### `Helper.useComponentFromNamaFile()`
Load komponen dari folder `components/`. Nama file ditulis dalam PascalCase setelah `useComponentFrom`.

```js
const { kartuProfil } = await Helper.useComponentFromKartu();
```

### Layout Helpers

`useNav()`, `useHeader()`, `useAside()`, `useFooter()` digunakan untuk **memasukkan element ke dalam tag layout** yang ada di `index.html`. Masing-masing mengakses `#nav-go`, `#header-go`, `#aside-go`, dan `#footer-go`.

```js
// Sisipkan konten ke dalam nav
const nav = Helper.useNav();
nav.onTheHtml("<a href='/'>Beranda</a>");

// Sisipkan konten ke dalam header
const header = Helper.useHeader();
header.onTheHtml("<h1>Kobar App</h1>");
```

---

## 🎯 Element Method

Semua method menggunakan format **camelCase** (huruf pertama kecil). Semua method bisa dirantai (chaining) dan otomatis menunggu element muncul di DOM.

### `onThe` — Tambah / Set

| Method | Keterangan | Contoh |
|---|---|---|
| `onTheClick(fn)` | Tambah event listener | `.onTheClick(() => {})` |
| `onTheFocus(fn)` | Event focus | `.onTheFocus(() => {})` |
| `onTheClassName()` | Tambah class | `.onTheClassAktif()` |
| `onTheStylePropertyItsValue()` | Set style | `.onTheStyleColorItsRed()` |
| `onTheStyleWidthIts100Pct()` | Set style dengan % | `.onTheStyleWidthIts100Pct()` |
| `onTheAttrNama(value)` | Set attribute dengan argumen | `.onTheAttrPlaceholder("Nama")` |
| `onTheAttrNamaItsValue()` | Set attribute dengan nilai tetap | `.onTheAttrDisabledIts()` |
| `onTheDataNamaItsValue()` | Set data attribute | `.onTheDataIdItsAbc()` |
| `onTheTextNilai()` | Set teks inline | `.onTheTextSelamatDatang()` |
| `onTheText(value)` | Set teks via argumen | `.onTheText("Halo!")` |
| `onTheHtml(value)` | Set innerHTML via argumen | `.onTheHtml("<b>Halo</b>")` |
| `onTheEach((el, i) => {})` | Loop semua element (NodeList/HTMLCollection) | `.onTheEach((e, i) => {})` |

### `offThe` — Hapus

| Method | Keterangan | Contoh |
|---|---|---|
| `offTheClick(fn)` | Hapus event listener | `.offTheClick(fn)` |
| `offTheClassName()` | Hapus class | `.offTheClassAktif()` |
| `offTheStyleProperty()` | Hapus style | `.offTheStyleColor()` |
| `offTheAttrNama()` | Hapus attribute | `.offTheAttrDisabled()` |
| `offTheDataNama()` | Hapus data attribute | `.offTheDataId()` |

### `toggleThe` — Toggle

| Method | Keterangan | Contoh |
|---|---|---|
| `toggleTheClassName()` | Toggle class | `.toggleTheClassAktif()` |
| `toggleTheClassaWithB()` | Toggle antara dua class | `.toggleTheClassOnWithOff()` |
| `toggleTheStylePropItsaWithB()` | Toggle antara dua nilai style | `.toggleTheStyleColorItsBlueWithRed()` |

### `changeThe` — Ganti

| Method | Keterangan | Contoh |
|---|---|---|
| `changeTheText(value)` | Ganti teks via argumen | `.changeTheText("Baru")` |
| `changeTheTextNilai()` | Ganti teks inline | `.changeTheTextHaloBaru()` |
| `changeTheHtml(value)` | Ganti innerHTML | `.changeTheHtml("<p>Baru</p>")` |
| `changeTheClassaToB()` | Ganti class | `.changeTheClassAktifToDisabled()` |

### `checkThe` — Cek (mengembalikan boolean)

| Method | Keterangan | Contoh |
|---|---|---|
| `checkTheClassName()` | Cek apakah class ada | `.checkTheClassAktif()` |
| `checkTheAttrNama()` | Cek apakah attribute ada | `.checkTheAttrDisabled()` |
| `checkTheAttrNamaItsValue()` | Cek nilai attribute | `.checkTheAttrTypeItsText()` |
| `checkTheStyleProp()` | Cek apakah style ada | `.checkTheStyleColor()` |
| `checkTheStylePropItsValue()` | Cek nilai style | `.checkTheStyleColorItsRed()` |
| `checkTheDataNama()` | Cek apakah data ada | `.checkTheDataId()` |
| `checkTheDataNamaItsValue()` | Cek nilai data | `.checkTheDataIdItsAbc()` |
| `checkTheText(value)` | Cek teks via argumen | `.checkTheText("Halo")` |
| `checkTheTextNilai()` | Cek teks inline | `.checkTheTextHalo()` |
| `checkTheHtml(value)` | Cek innerHTML | `.checkTheHtml("<p>Halo</p>")` |

### `html` — Akses DOM Langsung

Prefix `html` memberikan akses ke **semua properti dan method DOM native** yang belum didukung secara langsung oleh Kobar. Format penulisan: `html` + nama properti/method DOM dalam camelCase.

```js
// Getter — ambil nilai properti DOM
const nilai = input.htmlValue();
const tinggi = el.htmlOffsetHeight();

// Setter — set nilai properti DOM
input.htmlValue("Teks baru");
el.htmlId("nama-id");

// Method DOM
input.htmlFocus();
input.htmlBlur();
el.htmlClick();
el.htmlScrollIntoView();
el.htmlAppend(kartu);
```

> Gunakan prefix `html` untuk mengakses properti atau method DOM apapun yang belum tersedia sebagai method Kobar.

---

## 🗺️ Routing

Atur routing di `config/route.json`:

```json
{
  "/": { "page": "beranda", "style": "styleberanda", "logic": "logicberanda", "title": "Beranda" },
  "/tentang": { "page": "tentang", "style": "styletentang", "logic": "logictentang", "title": "Tentang" },
  "/404": { "page": "404", "style": "404style", "logic": "logic404", "title": "404" }
}
```

---

## 🧱 Component System

Buat komponen di folder `components/` dengan tag `<comp-nama>`:

```html
<!-- components/kartu.html -->
<comp-kartu>
  <div class="kartu">
    <p><meta this-data="pesan"></p>
    <h2><meta this-data="nama"></h2>
  </div>
</comp-kartu>
```

Load dan render via logic:

```js
const { kartuProfil } = await Helper.useComponentFromKartu();

// Render satu item
const kartu = kartuProfil.render({ nama: "Azqilana", pesan: "Halo!" });
document.querySelector("main").appendChild(kartu.element);

// Render banyak item
const items = kartuProfil.render([
  { nama: "Azqilana", pesan: "Halo!" },
  { nama: "Kobar", pesan: "Selamat Datang!" },
]);
```

### Inline Component di HTML

Sisipkan komponen langsung di halaman:

```html
<base comp="kartu" file="kartu" data-nama="Azqilana" data-pesan="Halo!">
```

---

## 🌐 Deploy

Siap deploy ke **Netlify** atau **Cloudflare Pages** — sudah ada `_redirects` untuk SPA routing.

---

## 📄 Lisensi

MIT © [azqilana](https://github.com/azqilana)
