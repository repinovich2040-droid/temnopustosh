// Все внешние ссылки сайта в одном месте. Поменял здесь — поменялось на всех страницах.
window.SITE = {
  register: "https://darkshire.ru/user/register",
  login: "https://darkshire.ru/user/login",
  profile: "https://darkshire.ru/profile",
  rules: "https://darkshire.ru/rules",
  launcherWin: "https://launcher.darkshire.ru/DarkshireRP.exe",
  launcherJar: "https://launcher.darkshire.ru/DarkshireRP.jar",
  // Пока общий сервер Даркшира: приглашения на сервер Темнопустоши в проекте нет.
  discord: "https://discord.gg/6ThChKv6kP",
  updated: "27 октября 2026"
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = window.SITE[a.getAttribute("data-link")];
    if (url) a.href = url;
  });
  document.querySelectorAll("[data-site]").forEach(function (el) {
    el.textContent = window.SITE[el.getAttribute("data-site")] || "";
  });
});
