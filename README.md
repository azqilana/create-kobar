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
└── index.js          # Entry point JS & Kobar
```

---

## 📦 Entry Point — `index.js`

```js
import Kobar from "../index.js";
```

`index.js` adalah **satu-satunya pintu masuk** ke semua fitur Kobar:

- **Auto-start app** — routing otomatis aktif begitu file di-load, tidak perlu setup manual
- **Kobar siap pakai** — `getElement`, `register`, `useNav`, `useHeader`, dll sudah tersedia
- **Component proxy** — akses komponen dari file manapun secara dinamis via `useComponentFromNamaFile`
- **Satu import, semua tersedia** — tidak perlu import tiap file `system/` satu per satu

---

## 🧩 Kobar API

   ### Berikut API/Methods Yang dapat di gunakan dalam menggunakan Stater-Kit ini:

### `Kobar.register(nama, fn)`

Daftarkan logic untuk halaman tertentu.

```js
Kobar.register("beranda", async () => {
  // logic halaman beranda
});
```

### `Kobar.getElement(...selector)`

Ambil satu atau banyak element sekaligus menggunakan CSS selector. Mengembalikan instance dengan method berantai.

```js
const judul = Kobar.getElement("#judul");
const [input, tombol] = Kobar.getElement("#input", "#tombol");
```

### `Kobar.getElementByIdNama()` · `Kobar.getElementClassNama()` · dst.

Alternatif pengambilan element dengan gaya penamaan dinamis — tanpa perlu menulis selector string. Hasilnya sama dengan `getElement`, yaitu instance dengan method berantai.

| Method | Setara dengan |
|--------|---------------|
| `Kobar.getElementByIdNama()` | `document.getElementById("nama")` |
| `Kobar.getElementClassNama()` | `document.getElementsByClassName("nama")` |
| `Kobar.getElementTagDiv()` | `document.getElementsByTagName("div")` |
| `Kobar.getElementNameEmail()` | `document.getElementsByName("email")` |
| `Kobar.getElementAllNama()` | `document.querySelectorAll("nama")` |
| `Kobar.getElementNama()` | `document.querySelector("nama")` |

```js
// Ambil by ID
const judul = Kobar.getElementByIdJudul();

// Ambil by class
const kartu = Kobar.getElementClassKartu();

// Ambil by tag
const divs = Kobar.getElementTagDiv();

// Ambil by name
const email = Kobar.getElementNameEmail();

// Ambil semua (querySelectorAll)
const items = Kobar.getElementAllItem();

// Fallback querySelector biasa
const el = Kobar.getElementMainContent();
```

> `getElement(selector)` dan `getElement*` saling melengkapi — gunakan mana yang lebih nyaman sesuai konteks.

### `Kobar.useComponentFromNamaFile()`

Load komponen dari folder `components/`. Nama file ditulis dalam PascalCase setelah `useComponentFrom`.

```js
const { kartuProfil } = await Kobar.useComponentFromKartu();
```

### Layout Kobars

`useNav()`, `useHeader()`, `useAside()`, `useFooter()` digunakan untuk memasukkan konten ke dalam tag layout di `index.html`. Masing-masing mengakses `#nav-go`, `#header-go`, `#aside-go`, dan `#footer-go`.

```js
const nav = Kobar.useNav();
nav.onTheHtml("<a href='/'>Beranda</a>");

const header = Kobar.useHeader();
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

> **Aturan penulisan nama class & attr:**
> Nama **class** dan **attr** di element **harus huruf kecil semua** atau **kebab-case**.
> Sistem secara otomatis mengkonversi camelCase → kebab-case, sehingga nama yang pakai camelCase di CSS/HTML tidak akan cocok.
>
> | Penulisan di method | Hasil |
> |---------------------|-------|
> | `onTheClassIsVisible` | `is-visible` ✅ |
> | `onTheClassBtnPrimary` | `btn-primary` ✅ |
> | `onTheDataType` | `data-type` ✅ |
> | `onTheAttrAriaLabel` | `aria-label` ✅ |

---

### `onThe` — Tambah / Set

```js
// Event
Kobar.getElement("#btn").onTheClick(fn)                  // addEventListener("click", fn)
Kobar.getElement("#input").onTheFocus(fn)                // addEventListener("focus", fn)

// Class — hanya nama, tanpa Its
Kobar.getElement("#btn").onTheClassActive()              // classList.add("active")
Kobar.getElement("#btn").onTheClassIsVisible()           // classList.add("is-visible")

// Style — pakai Its untuk nilai
Kobar.getElement("#box").onTheStyleColorItsRed()         // style.color = "red"
Kobar.getElement("#box").onTheStyleFontSizeIts16px()     // style.fontSize = "16px"
Kobar.getElement("#box").onTheStyleWidthIts50pct()       // style.width = "50%"  (pct → %)

// Attr — tanpa Its: tambah attr kosong, dengan Its: set nilai
Kobar.getElement("#btn").onTheAttrDisabled()             // setAttribute("disabled", "")
Kobar.getElement("#btn").onTheAttrTitleItsHello()        // setAttribute("title", "hello")
Kobar.getElement("#btn").onTheAttr("title", value)       // setAttribute("title", value)

// Data — pakai Its untuk nilai
Kobar.getElement("#el").onTheDataIdIts123()              // setAttribute("data-id", "123")

// Text
Kobar.getElement("#judul").onTheTextHelloWorld()         // textContent = "Hello World"
Kobar.getElement("#judul").onTheText(value)              // textContent = value

// Html
Kobar.getElement("#wrap").onTheHtml(value)               // innerHTML = value

// Loop (NodeList / HTMLCollection)
Kobar.getElement(".kartu").onTheEach((item, i) => {})   // iterasi semua element
```

---

### `offThe` — Hapus

```js
// Event
Kobar.getElement("#btn").offTheClick(fn)                     // removeEventListener("click", fn)

// Class — hanya nama, tanpa Its
Kobar.getElement("#btn").offTheClassActive()                 // classList.remove("active")

// Style
Kobar.getElement("#box").offTheStyleColor()                  // style.removeProperty("color")

// Attr
Kobar.getElement("#btn").offTheAttrDisabled()                // removeAttribute("disabled")

// Data
Kobar.getElement("#el").offTheDataId()                       // removeAttribute("data-id")

// Text
Kobar.getElement("#p").offTheText()                          // textContent = ""
```

---

### `changeThe` — Ubah ke Nilai Baru

Untuk `class` pakai `To` saja. Untuk `style`, `attr`, `data` — `Its` boleh disertakan untuk memperjelas nilai lama, tapi diabaikan; yang dipakai hanya nilai setelah `To`.

```js
// Class — oldClass To newClass
Kobar.getElement("#btn").changeTheClassActiveToDisabled()    // replaceClass("active", "disabled")

// Style — Its diabaikan, nilai diambil dari To
Kobar.getElement("#box").changeTheStyleColorItsRedToBlue()  // style.color = "blue"

// Attr — Its diabaikan, nilai diambil dari To
Kobar.getElement("a").changeTheAttrTitleItsHelloToWorld()   // setAttribute("title", "world")

// Data — Its diabaikan, nilai diambil dari To
Kobar.getElement("#el").changeTheDataIdIts1To2()            // setAttribute("data-id", "2")

// Text
Kobar.getElement("#h1").changeTheTextHelloWorld()           // textContent = "Hello World"
Kobar.getElement("#h1").changeTheText(value)                // textContent = value

// Html
Kobar.getElement("#div").changeTheHtml(value)               // innerHTML = value
```

---

### `toggleThe` — Bolak-balik

Gunakan `With` untuk toggle antara dua nilai. Tanpa `With`, beberapa fitur toggle keberadaan (add/remove).

```js
// Class — tanpa With: toggle biasa, dengan With: swap dua class
Kobar.getElement("#btn").toggleTheClassActive()                  // classList.toggle("active")
Kobar.getElement("#nav").toggleTheClassOpenWithClose()           // swap antara "open" dan "close"

// Style — wajib pakai Its + With
Kobar.getElement("#box").toggleTheStyleColorItsBlueWithRed()    // swap color antara "blue" dan "red"

// Attr — tanpa With: toggle keberadaan, dengan With: swap nilai
Kobar.getElement("#btn").toggleTheAttrDisabled()                 // add/remove attr "disabled"
Kobar.getElement("#el").toggleTheAttrTitleItsHiWithBye()        // swap nilai title antara "hi" dan "bye"

// Data — pakai Its + With
Kobar.getElement("#el").toggleTheDataIdItsAWithB()              // swap data-id antara "a" dan "b"

// Text — pakai With
Kobar.getElement("#btn").toggleTheTextOnWithOff()               // swap text antara "On" dan "Off"
```

---

### `checkThe` — Cek (mengembalikan `boolean`)

```js
// Class
Kobar.getElement("#btn").checkTheClassActive()               // classList.contains("active") → boolean

// Attr — tanpa Its: cek keberadaan, dengan Its: cek nilai
Kobar.getElement("#btn").checkTheAttrDisabled()              // hasAttribute("disabled") → boolean
Kobar.getElement("#el").checkTheAttrTitleItsHello()          // getAttribute("title") === "hello" → boolean

// Style — tanpa Its: cek ada/tidak, dengan Its: cek nilai spesifik
Kobar.getElement("#box").checkTheStyleColor()                // !!getPropertyValue("color") → boolean
Kobar.getElement("#box").checkTheStyleColorItsRed()          // getPropertyValue("color") === "red" → boolean

// Data — tanpa Its: cek ada/tidak, dengan Its: cek nilai spesifik
Kobar.getElement("#el").checkTheDataId()                     // !!getAttribute("data-id") → boolean
Kobar.getElement("#el").checkTheDataIdItsAbc()               // getAttribute("data-id") === "abc" → boolean

// Text
Kobar.getElement("#p").checkTheTextHello()                   // textContent === "Hello" → boolean
Kobar.getElement("#p").checkTheText(value)                   // textContent === value → boolean

// Html
Kobar.getElement("#div").checkTheHtml(value)                 // innerHTML === value → boolean
```

---

### `dom` — Akses DOM Native Langsung

Gunakan prefix `dom` sebagai **escape hatch** untuk mengakses semua properti dan method DOM native yang tidak tersedia lewat prefix di atas.

Properti DOM punya tiga mode:
- **Tanpa argumen** → getter, return nilai
- **Dengan argumen** → setter via argumen
- **Dengan `Its` inline** → setter via nama method, tanpa argumen

```js
// Method DOM (tidak punya getter/setter)
Kobar.getElement("#input").domFocus()                        // el.focus()
Kobar.getElement("#input").domBlur()                         // el.blur()
Kobar.getElement("#btn").domClick()                          // el.click()
Kobar.getElement("#section").domScrollIntoView()             // el.scrollIntoView()
Kobar.getElement("#wrap").domAppend(node)                    // el.append(node)

// Properti DOM — tiga mode
Kobar.getElement("#input").domValue()                        // el.value (getter)
Kobar.getElement("#input").domValue("abc")                   // el.value = "abc" (setter via argumen)
Kobar.getElement("#input").domValueItsAbc()                  // el.value = "abc" (setter via Its)

Kobar.getElement("#checkbox").domChecked()                   // el.checked (getter)
Kobar.getElement("#checkbox").domChecked(true)               // el.checked = true (setter via argumen)
Kobar.getElement("#checkbox").domCheckedItsTrue()            // el.checked = "true" (setter via Its)

Kobar.getElement("#el").domId()                              // el.id (getter)
Kobar.getElement("#el").domIdItsMyBtn()                      // el.id = "my-btn" (setter via Its)

Kobar.getElement("#el").domOffsetHeight()                    // el.offsetHeight (getter)
```

---

### Chaining

Semua method yang bersifat setter mendukung chaining:

```js
Kobar.getElement("#btn")
  .onTheClassActive()
  .onTheStyleColorItsBlue()
  .onTheAttrTitleItsHello()
  .onTheClick(fn);
```

---

### Traversal — Berpindah Antar Elemen

Semua method traversal mengembalikan instance baru — bisa langsung di-chain dengan semua method proxy.

```js
// Navigasi tunggal — chain langsung
Kobar.getElement("#item")
  .goToParent()
  .onTheClassHighlight()

Kobar.getElement("#item-1")
  .goToNext()
  .onTheClassActive()

Kobar.getElement("#btn")
  .goToClosest(".modal")
  .onTheClassIsOpen()

Kobar.getElement("#list").goToFirstChild().onTheStyleColorItsRed()
Kobar.getElement("#list").goToLastChild().onTheClassLast()
```

`goToChildren` dan `goToSiblings` punya dua mode:

**Tanpa index** — return koleksi, semua proxy otomatis berlaku ke seluruh elemen:

```js
// Berlaku ke semua anak
Kobar.getElement("#list").goToChildren().onTheClassActive()

// Berlaku ke semua sibling
Kobar.getElement("#item").goToSiblings().offTheClassActive()
```

**Dengan index** — return satu elemen, bisa di-chain proxy normal:

```js
// Anak ke-0 (pertama)
Kobar.getElement("#list").goToChildren(0).onTheClassFirst()

// Anak ke-2 (ketiga)
Kobar.getElement("#list").goToChildren(2).toggleTheClassOpen()

// Sibling pertama
Kobar.getElement("#item").goToSiblings(0).onTheStyleColorItsBlue()
```

---

### Insertion — Memasukkan & Memindahkan Elemen

Semua method insertion bisa di-chain.

```js
// Tambah ke dalam elemen (append)
Kobar.getElement("#list").putInside("<li>Item baru</li>")

// Tambah ke awal elemen (prepend)
Kobar.getElement("#list").putInsideFirst("<li>Item pertama</li>")

// Sisipkan sebelum / sesudah elemen
Kobar.getElement("#item-2").putBefore("<li>Sebelum item 2</li>")
Kobar.getElement("#item-2").putAfter("<li>Setelah item 2</li>")

// Hapus dari DOM
Kobar.getElement("#modal").takeOut()

// Ganti dengan elemen lain
Kobar.getElement("#tombol-lama").swapWith("<button id='tombol-baru'>Baru</button>")
```

---

### Form & Input

`getValue`, `checkIfEmpty`, `serializeIt` tidak bisa di-chain karena return nilai. Sisanya bisa di-chain.

```js
// Tidak chainable — return nilai
const nama = Kobar.getElement("#nama").getValue()
const kosong = Kobar.getElement("#nama").checkIfEmpty()
const data = Kobar.getElement("#form-login").serializeIt()
// → { email: "...", password: "..." }

// Chainable
Kobar.getElement("#nama").setValue("John Doe")
Kobar.getElement("#nama").clearValue()
Kobar.getElement("#nama").focusIt()
Kobar.getElement("#nama").blurIt()

// Contoh kombinasi
if (Kobar.getElement("#nama").checkIfEmpty()) {
  Kobar.getElement("#nama")
    .focusIt()
    .onTheClassIsError()
}
```

---

### Animasi & Visibility

`checkIfVisible` tidak bisa di-chain karena return boolean. Sisanya bisa di-chain.

```js
// Tidak chainable — return boolean
const tampil = Kobar.getElement("#menu").checkIfVisible()

// Chainable
Kobar.getElement("#modal").showIt()
Kobar.getElement("#modal").showIt("flex")
Kobar.getElement("#modal").hideIt()
Kobar.getElement("#toast").fadeIn()
Kobar.getElement("#toast").fadeIn(500)
Kobar.getElement("#toast").fadeOut()
Kobar.getElement("#toast").fadeOut(500)

// Contoh kombinasi
if (Kobar.getElement("#menu").checkIfVisible()) {
  Kobar.getElement("#menu").fadeOut()
} else {
  Kobar.getElement("#menu").fadeIn()
}
```

---

### Scroll

`getScrollTop` tidak bisa di-chain karena return number. Sisanya bisa di-chain.

```js
// Tidak chainable — return number
const posisi = Kobar.getElement("#box").getScrollTop()

// Chainable
Kobar.getElement("#section-2").scrollTo()
Kobar.getElement("#section-2").scrollTo({ behavior: "instant" })
Kobar.getElement("#chat").scrollDown()
Kobar.getElement("#chat").scrollUp()
```

---

### Ukuran & Posisi

Semua return nilai — tidak bisa di-chain.

```js
const { width, height } = Kobar.getElement("#box").getSize()
const { top, left } = Kobar.getElement("#box").getPosition()
const rect = Kobar.getElement("#box").getRect()
```

---

### Utilitas

`getTag`, `matches`, `getRaw`, `checkIfExists` tidak bisa di-chain karena return nilai. `cloneIt` dan `copyTextToClipboard` bisa di-chain.

```js
// Tidak chainable — return nilai
const tag = Kobar.getElement("#el").getTag()
// → "div", "span", "button", ...

const cocok = Kobar.getElement("#btn").matches(".is-active")
const elAsli = Kobar.getElement("#btn").getRaw()
const ada = Kobar.getElement("#modal").checkIfExists()

// Chainable
Kobar.getElement("#kode").copyTextToClipboard()

const klon = Kobar.getElement("#kartu").cloneIt()
Kobar.getElement("#list").putInside(klon.getRaw())
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
const { kartuProfil } = await Kobar.useComponentFromKartu();

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

### Slot Data — 3 Cara Menangkap Data

Kobar mendukung tiga cara injeksi data ke dalam komponen:

#### 1. `<meta this-data="key">` — Replace jadi teks

Tag `<meta>` akan diganti langsung dengan nilai dari data.

```html
<comp-kartu>
  <div class="kartu">
    <p><meta this-data="pesan"></p>
    <h2><meta this-data="nama"></h2>
  </div>
</comp-kartu>
```

```js
kartu.render({ nama: "Azqilana", pesan: "Halo!" });
// → <div class="kartu"><p>Halo!</p><h2>Azqilana</h2></div>
```

#### 2. `this-data="key"` — Jadi atribut `data-*`

Pada elemen selain `<meta>`, atribut `this-data` akan diubah menjadi `data-*`.

```html
<comp-kartu>
  <div this-data="id" class="kartu">...</div>
</comp-kartu>
```

```js
kartu.render({ id: "123" });
// → <div data-id="123" class="kartu">...</div>
```

#### 3. `this-data-{attr}="key"` — Inject langsung ke atribut HTML

Gunakan `this-data-{namaAtribut}` untuk mengisi atribut HTML secara langsung seperti `href`, `src`, `action`, dll. Atribut `this-data-*` akan dihapus dan diganti dengan atribut yang sesuai.

```html
<comp-kartu>
  <a this-data-href="url" this-data-src="gambar">Klik</a>
</comp-kartu>
```

```js
kartu.render({ url: "/profil", gambar: "/foto.jpg" });
// → <a href="/profil" src="/foto.jpg">Klik</a>
```

---

## 🏗️ Build — `Kobar.build*()`

Kobar menyediakan cara membuat HTML string secara programatik tanpa menyentuh DOM lewat **proxy dinamis**. Cocok dipakai di dalam logic halaman untuk membangun konten secara dinamis.

### 1. Tag — `build{Tag}`

Tulis nama tag setelah `build` dalam PascalCase. Jika tag tidak ditulis, default jadi `div`.

```js
Kobar.buildDiv({ children: "Konten" })
// → '<div>Konten</div>'

Kobar.buildP({ children: "Paragraf" })
// → '<p>Paragraf</p>'
```

### 2. Class — `WithClassThis{NamaClass}`

Gunakan `WithClass` diikuti `This` dan nama class.

```js
Kobar.buildDivWithClassThisCard({ children: "Isi" })
// → '<div class="card">Isi</div>'
```

### 3. Atribut — `WithAttrThis{NamaAttr}Its{NilaiAttr}`

Gunakan `WithAttr` diikuti `This` untuk nama atribut dan `Its` untuk nilainya.

```js
Kobar.buildAWithAttrThisHrefItsHome({ children: "Klik" })
// → '<a href="home">Klik</a>'
```

Bisa digabung semua sekaligus:

```js
Kobar.buildAWithClassThisBtnWithAttrThisHrefItsHome({ children: "Klik" })
// → '<a class="btn" href="home">Klik</a>'
```

### 4. Children — `{ children }`

`children` bisa berupa string atau array of object untuk elemen bertingkat.

```js
// String
Kobar.buildDiv({ children: "Halo" })
// → '<div>Halo</div>'

// Array (nested)
Kobar.buildDivWithClassThisCard({
  children: [
    { tag: "h1", children: "Judul" },
    { tag: "p", children: "Isi" }
  ]
})
// → '<div class="card"><h1>Judul</h1><p>Isi</p></div>'

// Array of object (banyak elemen sekaligus)
Kobar.build([
  { tag: "h1", children: "Judul" },
  { tag: "p", children: "Paragraf" }
])
// → '<h1>Judul</h1><p>Paragraf</p>'
```

### 5. Tag Self-Closing

Tag self-closing (`img`, `input`, `br`, `hr`, dll) otomatis tidak diberi closing tag.

```js
Kobar.buildImgWithAttrThisSrcItsPhoto({})
// → '<img src="photo" />'
```

### 6. Inject Data — 3 Cara

`build*()` mendukung chaining dengan method `.data()` untuk inject data secara dinamis, dengan cara yang sama seperti komponen.

#### 1. `<meta this-data="key">` — Replace jadi teks

```js
Kobar.buildDiv({ children: `<p><meta this-data="pesan"></p>` })
  .data({ pesan: "Halo!" })
// → '<div><p>Halo!</p></div>'
```

#### 2. `this-data="key"` — Jadi atribut `data-*`

```js
Kobar.buildDiv({ children: `<div this-data="id"></div>` })
  .data({ id: "123" })
// → '<div><div data-id="123"></div></div>'
```

#### 3. `this-data-{attr}="key"` — Inject langsung ke atribut HTML

```js
Kobar.buildDiv({ children: `<a this-data-href="url">Klik</a>` })
  .data({ url: "/profil" })
// → '<div><a href="/profil">Klik</a></div>'
```

---

## 🌐 Deploy

Kobar siap deploy ke **Netlify** atau **Cloudflare Pages** — sudah ada `_redirects` untuk SPA routing.

---

## 📄 Lisensi

GPL-V3 © [azqilana](https://github.com/azqilana)
