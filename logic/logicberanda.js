import Helper from "../index.js";

Helper.register("beranda", async () => {
  const [
    judul,
    subjudul,
    input,
    tombol,
    tombolToggle,
    status,
    card,
    cardini,
    kartuPesan,
  ] = Helper.getElement(
    "#judul",
    "#subjudul",
    "#input",
    "#tombol",
    "#tombolToggle",
    "#status",
    ".card",
    ".cardini",
    "all:.kartu-profil",
  );

  const { kartuProfil, badge } = await Helper.useComponentFromKartu();
  console.log(kartuProfil);
  console.log(badge);
  const comp = await Helper.useComponentFromKartu();
  console.log(comp);
  // Kalau tidak punya slot data
  // const html = badge._html;
  let data;
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
  kartuPesan.onTheEach((e) => {
    e.onTheStyleBackgroundColorItsBlue();
    e.onTheStylePaddingIts10px();
    e.onTheStyleMarginIts10px();
    e.onTheStyleBorderRadiusIts10px();
  });
  cardini.onTheStylePaddingIts10px();
  cardini.onTheStyleMarginIts10px();
  cardini.onTheStyleTextAlignItsCenter();
  cardini.onTheStyleBorderRadiusIts10px();
  // Klik tombol kirim
  tombol.onTheClick(() => {
    const nilai = input.htmlValue(); // akses .el untuk nilai asli
    console.log(nilai);
    if (!nilai) {
      input.onTheClassError();
      status.onTheTextIsiDuluNamaMu();
      return;
    }
    kartuPesan.onTheEach((e) => {
      e.toggleTheStyleBackgroundColorItsYellowWithCyan();
    });

    input.htmlValue("");
    console.log(nilai);
    const itemBaru = { nama: nilai, pesan: "Terima Kasih Atas Kehadiran Nya" };
    data = itemBaru;
    const kartu = kartuProfil.data(itemBaru);
    cardini.onTheHtml(kartu);
    cardini.toggleTheStyleBackgroundColorItsGreenWithBlue();
    cardini.toggleTheStyleColorItsBlueWithDarkgreen();
    judul.changeTheText(`Hai, ${nilai}!`);
    judul.onTheStyleBackgroundColorItsBlack();
    judul.onTheStyleColorItsBlue();
    judul.onTheStylePaddingIts10px();
    judul.onTheStyleBorderRadiusIts10px();
    subjudul.onTheTextSelamatDatang();
    status
      .onTheTextBerhasil()
      .onTheClassAktif()
      .onTheStyleColorItsGreenyellow()
      .onTheStyleBackgroundColorItsBlack()
      .onTheStylePaddingIts20px();
  });

  // Toggle warna judul
  tombolToggle.onTheClick(() => {
    tombolToggle.toggleTheClassOnWithOff();
    judul.toggleTheStyleColorItsBlueWithAqua();
  });
});
