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

  function getStarts() {
    // The script tag that loaded this file.
    const script = document.currentScript || document.querySelector('script[src$="experience-years.js"]');
    if (!script) return null;

    return {
      wingchunStart: script.getAttribute("data-wingchun-start"),
      teachingStart: script.getAttribute("data-teaching-start"),
      martialStart: script.getAttribute("data-martial-start"),
    };
  }

  function applyYears() {
    const starts = getStarts();
    if (!starts) return;

    setText("wingchunYears", yearsSince(starts.wingchunStart));
    setText("teachingYears", yearsSince(starts.teachingStart));
    setText("martialYears", yearsSince(starts.martialStart));
  }

  document.addEventListener("DOMContentLoaded", applyYears);
  document.addEventListener("i18n:applied", applyYears);
})();
