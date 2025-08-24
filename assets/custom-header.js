document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".custom-header__menu-icon");
  const closeToggle = document.querySelector(".custom-header__close-icon");
  const drawer = document.querySelector(".custom-header__drawer");

  if (!menuToggle || !closeToggle || !drawer) return;

  function openCustomheaderDrawer() {
    drawer.style.height = drawer.scrollHeight + "px";
    drawer.classList.add("is-open");
    menuToggle.classList.add("hidden");
    closeToggle.classList.remove("hidden");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeCustomheaderDrawer() {
    drawer.style.height = "0";
    drawer.classList.remove("is-open");
    closeToggle.classList.add("hidden");
    menuToggle.classList.remove("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", openCustomheaderDrawer);
  closeToggle.addEventListener("click", closeCustomheaderDrawer);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) {
      closeCustomheaderDrawer();
    }
  });
});
