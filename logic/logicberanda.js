import Helper from "../index.js";

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
  cardini.onTheStyleBackgroundColorItsBlack();
  cardini.onTheStylePaddingIts10px();
  cardini.onTheStyleMarginIts10px();
  cardini.onTheStyleTextAlignItsCenter();
  cardini.onTheStyleBorderRadiusIts10px();
  // Klik tombol kirim
  tombol.onTheClick(() => {
    const nilai = input.el.value; // akses .el untuk nilai asli

    if (!nilai) {
      input.onTheClassError();
      status.onTheTextIsiDuluNamaMu();
      return;
    }

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
