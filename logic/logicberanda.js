import Helper from "../helper.js";

Helper.register("beranda", () => {
  const [judul, subjudul, input, tombol, tombolToggle, status] =
    Helper.getElement(
      "#judul",
      "#subjudul",
      "#input",
      "#tombol",
      "#tombolToggle",
      "#status",
    );

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
