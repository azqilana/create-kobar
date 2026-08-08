import Helper from "../helper.js";

Helper.register("beranda", async () => {
  const [judul, subjudul, input, tombol, tombolToggle, status, card, cardini] =
    Helper.getElement(
      "#judul",
      "#subjudul",
      "#input",
      "#tombol",
      "#tombolToggle",
      "#status",
      ".card",
      ".cardini",
    );
  const { kartuProfil, badge } = await Helper.useComponentFromKartu();
  // Kalau tidak punya slot data
  const html = badge._html;
  // Set style awal tombol
  tombol
    .onTheStyleBackgroundColorItsBlue()
    .onTheStyleColorItsWhite()
    .onTheStyleWidthIts100Pct()
    .onTheClassActive();

  // Hapus error saat input difokus
  input.onTheFocus(() => {
    input.offTheClassError();
    status.onTheText(" ");
  });

  // Klik tombol kirim
  tombol.onTheClick(() => {
    const nilai = input.el.value; // akses .el untuk nilai asli

    if (!nilai) {
      input.onTheClassError();
      status.onTheTextIsiDuluNamaMu();
      return;
    }
    const html = kartuProfil.data({ nama: nilai, pesan: "Selamat Hari Raya!" });
    cardini.onTheStyleBackgroundColorItsBlack();
    cardini.onTheStylePaddingIts10px();
    cardini.onTheStyleMarginIts10px();
    cardini.onTheStyleTextAlignItsCenter();
    cardini.onTheStyleBorderRadiusIts10px();
    cardini.onTheHtml(html);
    judul.changeTheText(`Halo, ${nilai}!`);
    subjudul.onTheTextSelamatDatang();
    tombol.changeTheClassActiveToDisabled().onTheStyleBackgroundColorItsGray();
    status.onTheTextBerhasil().onTheClassAktif();
    input.onTheAttrDisabledItsTrue();
  });

  // Toggle warna judul
  tombolToggle.onTheClick(() => {
    tombolToggle.toggleTheClassOnWithOff();
    judul.toggleTheStyleColorItsBlueWithAqua();
  });
});
