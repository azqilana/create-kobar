# 🔥 Kobar

**Kobar** adalah Starter-Kit JavaScript ringan dengan arsitektur **Component-Observer**. Kobar menyediakan sistem routing, component loading, dan manipulasi DOM berbasis Proxy ES6 — tanpa framework berat.

---

## 🚀 Quick Start

Buat project baru dengan CLI:

```bash
npx create-kobar nama-project
```

Atau dengan package manager lain:

```bash
pnpm create kobar nama-project
yarn create kobar nama-project
npm create kobar@latest nama-project
```

---

## 📁 Struktur Project

```
nama-project/
├── components/       # File komponen HTML
├── config/
│   └── route.json    # Konfigurasi routing
├── logic/            # Logic per halaman (.js)
├── page/             # File halaman HTML
├── style/            # File CSS per halaman
├── system/           # Core Kobar
├── _redirects        # Redirect untuk Netlify/Cloudflare
├── index.html        # Entry point HTML
└── index.js          # Entry point JS & Helper
```

---

## 📦 Entry Point — `index.js`

```js
import Helper from "../index.js";
```

`index.js` adalah **satu-satunya pintu masuk** ke semua fitur Kobar:

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

Ambil satu atau banyak element sekaligus menggunakan CSS selector. Mengembalikan instance dengan method berantai.

```js
const judul = Helper.getElement("#judul");
const [input, tombol] = Helper.getElement("#input", "#tombol");
```

### `Helper.getElementByIdNama()` · `Helper.getElementByClassNama()` · dst.

Alternatif pengambilan element dengan gaya penamaan dinamis — tanpa perlu menulis selector string. Hasilnya sama dengan `getElement`, yaitu instance dengan method berantai.

| Method | Setara dengan |
|--------|---------------|
| `Helper.getElementByIdNama()` | `document.getElementById("nama")` |
| `Helper.getElementClassNama()` | `document.getElementsByClassName("nama")` |
| `Helper.getElementTagDiv()` | `document.getElementsByTagName("div")` |
| `Helper.getElementNameEmail()` | `document.getElementsByName("email")` |
| `Helper.getElementAllNama()` | `document.querySelectorAll("nama")` |
| `Helper.getElementNama()` | `document.querySelector("nama")` |

```js
// Ambil by ID
const judul = Helper.getElementByIdJudul();

// Ambil by class
const kartu = Helper.getElementClassKartu();

// Ambil by tag
const divs = Helper.getElementTagDiv();

// Ambil by name
const email = Helper.getElementNameEmail();

// Ambil semua (querySelectorAll)
const items = Helper.getElementAllItem();

// Fallback querySelector biasa
const el = Helper.getElementMainContent();
```

> `getElement(selector)` dan `getElementBy*` saling melengkapi — gunakan mana yang lebih nyaman sesuai konteks.

### `Helper.useComponentFromNamaFile()`

Load komponen dari folder `components/`. Nama file ditulis dalam PascalCase setelah `useComponentFrom`.

```js
const { kartuProfil } = await Helper.useComponentFromKartu();
```

### Layout Helpers

`useNav()`, `useHeader()`, `useAside()`, `useFooter()` digunakan untuk memasukkan konten ke dalam tag layout di `index.html`. Masing-masing mengakses `#nav-go`, `#header-go`, `#aside-go`, dan `#footer-go`.

```js
const nav = Helper.useNav();
nav.onTheHtml("<a href='/'>Beranda</a>");

const header = Helper.useHeader();
header.onTheHtml("<h1>Kobar App</h1>");
```

---

## 🎯 Element Method

Semua method menggunakan format **camelCase**. Semua method bisa dirantai (**chaining**) dan otomatis menunggu element muncul di DOM.

### Sistem Penamaan

Method dibangun dari **prefix** (kata kerja) + **suffix** (target operasi), dengan pemisah khusus:

| Pemisah | Kegunaan | Berlaku untuk |
|---------|----------|---------------|
| `Its` | Memisahkan nama dan nilai | `style`, `attr`, `data`, `html` |
| `To` | Nilai lama → nilai baru | `changeThe` + `style`, `attr`, `data`, `class` |
| `With` | Nilai A ↔ nilai B | `toggleThe` + semua |

> **Mengapa `class` tidak pakai `Its`?**
> Karena class hanya punya **nama**, tidak punya pasangan nama-nilai seperti style, attr, dan data.
> Contoh: `onTheClassActive` cukup, tidak perlu `onTheClassItsActive`.

---

### `onThe` — Tambah / Set

```js
// Event
el.onTheClick(fn)                       // addEventListener("click", fn)
el.onTheFocus(fn)                       // addEventListener("focus", fn)

// Class — hanya nama, tanpa Its
el.onTheClassActive()                   // classList.add("active")
el.onTheClassIsVisible()                // classList.add("is-visible")

// Style — pakai Its untuk nilai
el.onTheStyleColorItsRed()              // style.color = "red"
el.onTheStyleFontSizeIts16px()          // style.fontSize = "16px"
el.onTheStyleWidthIts50pct()            // style.width = "50%"  (pct → %)

// Attr — tanpa Its: tambah attr kosong, dengan Its: set nilai
el.onTheAttrDisabled()                  // setAttribute("disabled", "")
el.onTheAttrTitleItsHello()             // setAttribute("title", "hello")
el.onTheAttr("title", value)            // setAttribute("title", value)

// Data — pakai Its untuk nilai
el.onTheDataIdIts123()                  // setAttribute("data-id", "123")

// Text
el.onTheTextHelloWorld()                // textContent = "Hello World"
el.onTheText(value)                     // textContent = value

// Html
el.onTheHtml(value)                     // innerHTML = value

// Loop (NodeList / HTMLCollection)
el.onTheEach((el, i) => {})             // iterasi semua element
```

---

### `offThe` — Hapus

```js
// Event
el.offTheClick(fn)                      // removeEventListener("click", fn)

// Class — hanya nama, tanpa Its
el.offTheClassActive()                  // classList.remove("active")

// Style
el.offTheStyleColor()                   // style.removeProperty("color")

// Attr
el.offTheAttrDisabled()                 // removeAttribute("disabled")

// Data
el.offTheDataId()                       // removeAttribute("data-id")

// Text
el.offTheText()                         // textContent = ""
```

---

### `changeThe` — Ubah ke Nilai Baru

Untuk `class` pakai `To` saja. Untuk `style`, `attr`, `data` — `Its` boleh disertakan untuk memperjelas nilai lama, tapi diabaikan; yang dipakai hanya nilai setelah `To`.

```js
// Class — oldClass To newClass
el.changeTheClassActiveToDisabled()     // replaceClass("active", "disabled")

// Style — Its diabaikan, nilai diambil dari To
el.changeTheStyleColorItsRedToBlue()    // style.color = "blue"

// Attr — Its diabaikan, nilai diambil dari To
el.changeTheAttrTitleItsHelloToWorld()  // setAttribute("title", "world")

// Data — Its diabaikan, nilai diambil dari To
el.changeTheDataIdIts1To2()             // setAttribute("data-id", "2")

// Text
el.changeTheTextHelloWorld()            // textContent = "Hello World"
el.changeTheText(value)                 // textContent = value

// Html
el.changeTheHtml(value)                 // innerHTML = value
```

---

### `toggleThe` — Bolak-balik

Gunakan `With` untuk toggle antara dua nilai. Tanpa `With`, beberapa fitur toggle keberadaan (add/remove).

```js
// Class — tanpa With: toggle biasa, dengan With: swap dua class
el.toggleTheClassActive()               // classList.toggle("active")
el.toggleTheClassOpenWithClose()        // swap antara "open" dan "close"

// Style — wajib pakai Its + With
el.toggleTheStyleColorItsBlueWithRed()  // swap color antara "blue" dan "red"

// Attr — tanpa With: toggle keberadaan, dengan With: swap nilai
el.toggleTheAttrDisabled()              // add/remove attr "disabled"
el.toggleTheAttrTitleItsHiWithBye()     // swap nilai title antara "hi" dan "bye"

// Data — pakai Its + With
el.toggleTheDataIdItsAWithB()           // swap data-id antara "a" dan "b"

// Text — pakai With
el.toggleTheTextOnWithOff()             // swap text antara "On" dan "Off"
```

---

### `checkThe` — Cek (mengembalikan `boolean`)

```js
// Class
el.checkTheClassActive()                // classList.contains("active") → boolean

// Attr — tanpa Its: cek keberadaan, dengan Its: cek nilai
el.checkTheAttrDisabled()               // hasAttribute("disabled") → boolean
el.checkTheAttrTitleItsHello()          // getAttribute("title") === "hello" → boolean

// Style — tanpa Its: cek ada/tidak, dengan Its: cek nilai spesifik
el.checkTheStyleColor()                 // !!getPropertyValue("color") → boolean
el.checkTheStyleColorItsRed()           // getPropertyValue("color") === "red" → boolean

// Data — tanpa Its: cek ada/tidak, dengan Its: cek nilai spesifik
el.checkTheDataId()                     // !!getAttribute("data-id") → boolean
el.checkTheDataIdItsAbc()              // getAttribute("data-id") === "abc" → boolean

// Text
el.checkTheTextHello()                  // textContent === "Hello" → boolean
el.checkTheText(value)                  // textContent === value → boolean

// Html
el.checkTheHtml(value)                  // innerHTML === value → boolean
```

---

### `html` — Akses DOM Native Langsung

Gunakan prefix `html` untuk mengakses **semua properti dan method DOM native** yang tidak tersedia lewat prefix di atas.

Properti DOM punya tiga mode:
- **Tanpa argumen** → getter, return nilai
- **Dengan argumen** → setter via argumen
- **Dengan `Its` inline** → setter via nama method, tanpa argumen

```js
// Method DOM (tidak punya getter/setter)
el.htmlFocus()                          // el.focus()
el.htmlBlur()                           // el.blur()
el.htmlClick()                          // el.click()
el.htmlScrollIntoView()                 // el.scrollIntoView()
el.htmlAppend(node)                     // el.append(node)

// Properti DOM — tiga mode
el.htmlValue()                          // el.value (getter)
el.htmlValue("abc")                     // el.value = "abc" (setter via argumen)
el.htmlValueItsAbc()                    // el.value = "abc" (setter via Its)

el.htmlChecked()                        // el.checked (getter)
el.htmlChecked(true)                    // el.checked = true (setter via argumen)
el.htmlCheckedItsTrue()                 // el.checked = "true" (setter via Its)

el.htmlId()                             // el.id (getter)
el.htmlIdItsMyBtn()                     // el.id = "my-btn" (setter via Its)

el.htmlOffsetHeight()                   // el.offsetHeight (getter)
```

---

### Chaining

Semua method yang bersifat setter mendukung chaining:

```js
Helper.getElement("#btn")
  .onTheClassActive()
  .onTheStyleColorItsBlue()
  .onTheAttrTitleItsHello()
  .onTheClick(fn);
```

---

### Konversi Otomatis

| Input | Output |
|-------|--------|
| `camelCase` | `kebab-case` (untuk class, style, attr, data) |
| `50pct` | `50%` (untuk nilai style) |
| `HelloWorld` (text inline) | `"Hello World"` (dipisah per huruf kapital) |

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

### Buat Komponen

Buat file di folder `components/` dengan tag `<comp-nama>`:

```html
<!-- components/kartu.html -->
<comp-kartu>
  <div class="kartu">
    <p><meta this-data="pesan"></p>
    <h2><meta this-data="nama"></h2>
  </div>
</comp-kartu>
```

### Load & Render via Logic

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

Sisipkan komponen langsung di halaman tanpa JavaScript:

```html
<base comp="kartu" file="kartu" data-nama="Azqilana" data-pesan="Halo!">
```

---

## 🌐 Deploy

Kobar siap deploy ke **Netlify** atau **Cloudflare Pages** — sudah ada `_redirects` untuk SPA routing.

---

## 📄 Lisensi

MIT © [azqilana](https://github.com/azqilana)
