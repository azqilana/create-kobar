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
    "all:.kartu-pesan",
  );

  const { kartuProfil, badge } = await Helper.useComponentFromKartu();
  console.log(kartuProfil);
  console.log(badge);
  const comp = await Helper.useComponentFromKartu();
  console.log(comp);
  // Kalau tidak punya slot data
  // const html = badge._html;
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
  kartuPesan.onTheEach((e) => {
    e.onTheStyleBackgroundColorItsBlue();
  });
  cardini.onTheStyleBackgroundColorItsYellow();
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
    input.htmlValue("");
    console.log(nilai);
    const itemBaru = { nama: nilai, pesan: "Selamat Datang" };
    data.push(itemBaru);
    const kartu = kartuProfil.render(itemBaru).element;
    cardini.htmlAppend(kartu);
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
