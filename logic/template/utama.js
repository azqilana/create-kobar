import Helper from "../../helper.js";

Helper.register("layout:utama", () => {
  const [nav, aside] = Helper.getElement("#nav-go", "#aside-go");

  // Contoh interaksi layout: toggle aside lewat klik nav
  nav.onTheClick(() => {
    aside.toggleTheClassTampil();
  });
});
