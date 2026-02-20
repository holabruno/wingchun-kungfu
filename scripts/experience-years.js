(function () {
  function yearsSince(startDateStr) {
    if (!startDateStr) return null;

    const start = new Date(startDateStr);
    if (Number.isNaN(start.getTime())) return null;

    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();

    // Si l’anniversaire (mois/jour) n’est pas encore passé cette année, -1
    const hadAnniversaryThisYear =
      now.getMonth() > start.getMonth() ||
      (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());

    if (!hadAnniversaryThisYear) years -= 1;

    return Math.max(0, years);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === "number") el.textContent = String(value);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Le script tag qui charge CE fichier
    const script = document.currentScript || document.querySelector('script[src$="experience-years.js"]');
    if (!script) return;

    const wingchunStart = script.getAttribute("data-wingchun-start");
    const teachingStart = script.getAttribute("data-teaching-start");
    const martialStart = script.getAttribute("data-martial-start");

    setText("wingchunYears", yearsSince(wingchunStart));
    setText("teachingYears", yearsSince(teachingStart));
    setText("martialYears", yearsSince(martialStart));
  });
})();
