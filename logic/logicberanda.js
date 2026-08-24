import Kobar from "../index.js";

Kobar.register("beranda", async () => {
  // ============================================================
  // SELEKSI ELEMEN — multiple sekaligus
  // ============================================================
  const [
    judul,
    subjudul,
    input,
    tombol,
    tombolToggle,
    status,
    cardini,
    daftar,
    kotakAnimasi,
    tombolFade,
    kotakScroll,
    tombolScrollBawah,
    tombolScrollAtas,
    formKontak,
    tombolSerialize,
    hasilSerialize,
    areaClone,
    kartuTemplate,
    tombolClone,
    tombolHapusTerakhir,
    tombolInfo,
    hasilInfo,
    areaKartu,
  ] = Kobar.getElement(
    "#judul",
    "#subjudul",
    "#input",
    "#tombol",
    "#tombolToggle",
    "#status",
    ".cardini",
    "#daftar",
    "#kotak-animasi",
    "#tombol-fade",
    "#kotak-scroll",
    "#tombol-scroll-bawah",
    "#tombol-scroll-atas",
    "#form-kontak",
    "#tombol-serialize",
    "#hasil-serialize",
    "#area-clone",
    "#kartu-template",
    "#tombol-clone",
    "#tombol-hapus-terakhir",
    "#tombol-info",
    "#hasil-info",
    "#area-kartu",
  );

  // ============================================================
  // LOAD KOMPONEN
  // ============================================================
  const { kartuProfil } = await Kobar.useComponentFromKartu();

  // ============================================================
  // STYLE AWAL — onThe, chain
  // ============================================================
  tombol
    .onTheStyleBackgroundColorItsBlue()
    .onTheStyleColorItsWhite()
    .onTheStyleWidthIts100Pct()
    .onTheClassActive();

  judul
    .onTheStyleBackgroundColorItsBlack()
    .onTheStyleColorItsWhite()
    .onTheStylePaddingIts10px()
    .onTheStyleBorderRadiusIts10px();

  subjudul.onTheStyleTextAlignItsCenter();

  // ============================================================
  // BUILD ELEMEN — buat img lalu sisipkan sebelum judul
  // ============================================================
  const img = Kobar.build({
    tag: "img",
    class: "gambar",
    attr: { src: "./assets/logo.png" },
  }).done();

  // putBefore — sisipkan node sebelum judul
  judul.putBefore(img.node);

  Kobar.getElement(".gambar").onTheStyleWidthIts100px();

  // ============================================================
  // TRAVERSAL — navigasi DOM
  // ============================================================

  // goToChildren tanpa index — berlaku ke semua anak
  daftar
    .goToChildren()
    .onTheStyleBackgroundColorItsCornflowerblue()
    .onTheStylePaddingIts8px()
    .onTheStyleMarginIts4px()
    .onTheStyleBorderRadiusIts6px()
    .onTheStyleColorItsWhite();

  // goToChildren dengan index — ambil satu elemen spesifik
  daftar
    .goToChildren(0)
    .onTheStyleBackgroundColorItsGold()
    .onTheStyleColorItsBlack();

  // goToSiblings — dari anak pertama, style semua saudaranya
  daftar.goToChildren(0).goToSiblings().onTheStyleFontWeightItsBold();

  // goToParent — dari daftar naik ke kontainer, lalu style
  daftar
    .goToParent()
    .onTheStyleBorderIts2pxSolidNavy()
    .onTheStylePaddingIts10px()
    .onTheStyleBorderRadiusIts10px()
    .onTheStyleMarginIts10px();

  // goToNext / goToPrev — dari item ke-1 ke item ke-2
  daftar.goToChildren(1).goToNext().onTheStyleTextDecorationItsUnderline();

  // ============================================================
  // ANIMASI & VISIBILITY — fadeIn, fadeOut, show, hide
  // ============================================================
  tombolFade.onTheClick(() => {
    if (kotakAnimasi.checkIfVisible()) {
      kotakAnimasi.fadeOut(400);
    } else {
      kotakAnimasi.fadeIn(400);
    }
  });

  // ============================================================
  // SCROLL
  // ============================================================
  tombolScrollBawah.onTheClick(() => {
    kotakScroll.scrollDown();
  });

  tombolScrollAtas.onTheClick(() => {
    kotakScroll.scrollUp();
  });

  // ============================================================
  // FORM SERIALIZE
  // ============================================================
  tombolSerialize.onTheClick(() => {
    const data = formKontak.serializeIt();
    hasilSerialize.setText(JSON.stringify(data, null, 2));
  });

  // ============================================================
  // CLONE & INSERTION
  // ============================================================
  let klonKe = 1;

  tombolClone.onTheClick(() => {
    klonKe++;
    const klon = kartuTemplate.cloneIt();
    klon
      .setText(`Kartu Klon ke-${klonKe}`)
      .onTheStyleBackgroundColorItsOrchid();
    areaClone.putInside(klon.getRaw());
  });

  tombolHapusTerakhir.onTheClick(() => {
    const anak = areaClone.goToChildren();
    const jumlah = areaClone.getRaw()?.children.length ?? 0;
    if (jumlah > 1) {
      areaClone.goToChildren(jumlah - 1).takeOut();
      klonKe--;
    }
  });

  // ============================================================
  // UKURAN & POSISI
  // ============================================================
  tombolInfo.onTheClick(() => {
    const ukuran = judul.getSize();
    const posisi = judul.getPosition();
    const tag = judul.getTag();
    const info = {
      tag,
      ukuran,
      posisi: {
        top: Math.round(posisi.top),
        left: Math.round(posisi.left),
      },
    };
    hasilInfo.setText(JSON.stringify(info, null, 2));
  });

  // ============================================================
  // INPUT FOCUS / BLUR / EMPTY CHECK
  // ============================================================
  input.onTheFocus(() => {
    input.offTheClassError();
    status.setText(" ");
  });

  // ============================================================
  // TOMBOL KIRIM — aksi utama
  // ============================================================
  tombol.onTheClick(async () => {
    // checkIfEmpty — cek kosong
    if (input.checkIfEmpty()) {
      input.onTheClassError();
      status.onTheTextIsiDuluNamaMu();
      input.focusIt();
      return;
    }

    // getValue — ambil nilai input
    const nilai = input.getValue();

    // clearValue — kosongkan input
    input.clearValue();

    // Render kartu profil baru dari komponen
    const itemBaru = {
      nama: nilai,
      pesan: "Terima Kasih Atas Kehadiran Nya",
      url: "https://azqilana.my.id",
    };

    const kartu = await kartuProfil.data(itemBaru);
    cardini.onTheHtml(kartu);

    cardini
      .toggleTheStyleBackgroundColorItsGreenWithBlue()
      .toggleTheStyleColorItsBlueWithDarkgreen();

    // Tambah kartu ke area kartu via putInside
    const warna = ["#1a1aff", "#e8000d", "#ff8c00", "#1fbb00", "#9b00d4"];
    const warnaAcak = warna[Math.floor(Math.random() * warna.length)];
    areaKartu.putInside(`
      <div style="
        padding: 14px 20px;
        background: ${warnaAcak};
        border: 3px solid #000;
        border-radius: 12px;
        box-shadow: 4px 4px 0px #000;
        color: #fff;
        font-weight: 800;
        font-size: 1rem;
        font-family: Nunito, sans-serif;
        min-width: 140px;
        text-align: center;
      ">${nilai}</div>
    `);

    // changeTheText — ubah teks judul
    judul.changeTheText(`Hai, ${nilai}!`);
    subjudul.onTheTextSelamatDatang();

    // scrollTo — scroll ke area kartu
    areaKartu.scrollTo();

    status
      .onTheTextBerhasil()
      .onTheClassAktif()
      .onTheStyleColorItsGreenyellow()
      .onTheStyleBackgroundColorItsBlack()
      .onTheStylePaddingIts20px();
  });

  // ============================================================
  // TOGGLE TEMA — toggleThe, checkIfVisible
  // ============================================================
  tombolToggle.onTheClick(() => {
    tombolToggle.toggleTheClassOnWithOff();
    judul
      .toggleTheStyleColorItsWhiteWithBlack()
      .toggleTheStyleBackgroundColorItsBlackWithWhite();
  });

  // ============================================================
  // DOM DIRECT — domInsertAdjacentHTML (escape hatch)
  // ============================================================
  // Contoh pakai dom prefix langsung ke DOM native
  Kobar.getElement("#kontainer-daftar").domInsertAdjacentHTML(
    "beforeend",
    "<p style='font-size:0.8em;color:#555;'>← via domInsertAdjacentHTML</p>",
  );
});
