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
  const comp = await Helper.useComponentFromKartu();
  console.log(comp);
  // Kalau tidak punya slot data
  const html = badge._html;
  let data = [];
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
    const nilai = input.htmlValue(); // akses .el untuk nilai asli

    if (!nilai) {
      input.onTheClassError();
      status.onTheTextIsiDuluNamaMu();
      return;
    }
    cardini.onTheStyleBackgroundColorItsBlack();
    cardini.onTheStylePaddingIts10px();
    cardini.onTheStyleMarginIts10px();
    cardini.onTheStyleTextAlignItsCenter();
    cardini.onTheStyleBorderRadiusIts10px();
    const itemBaru = { nama: nilai, pesan: "Selamat Datang" };
    data.push(itemBaru);
    const kartu = kartuProfil.render(itemBaru);
    cardini.htmlAppend(kartu.element);
    judul.changeTheText(`Halo, ${nilai}!`);
    subjudul.onTheTextSelamatDatang();
    status.onTheTextBerhasil().onTheClassAktif();
  });

  // Toggle warna judul
  tombolToggle.onTheClick(() => {
    tombolToggle.toggleTheClassOnWithOff();
    judul.toggleTheStyleColorItsBlueWithAqua();
  });
});
