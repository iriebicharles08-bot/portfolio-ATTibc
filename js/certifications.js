(function () {
  var cartes = document.querySelectorAll(".cert");
  if (!cartes.length) return;
  document.documentElement.classList.add("js");

  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Compteur d'année qui se déroule */
  function compter(el) {
    var fin = parseInt(el.dataset.annee, 10), debut = fin - 25, t0 = null;
    if (reduit) { el.textContent = fin; return; }
    function pas(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1600, 1);
      var e = 1 - Math.pow(1 - p, 4);               // ralentit vers la fin
      el.textContent = Math.round(debut + (fin - debut) * e);
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  /* 2. Apparition de chaque billet au scroll */
  function montrer(c) {
    if (c.classList.contains("vu")) return;
    c.classList.add("vu");
    var an = c.querySelector(".cert__annee");
    if (an) compter(an);
  }
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (liste) {
      liste.forEach(function (e) {
        if (e.isIntersecting) { montrer(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    cartes.forEach(function (c) { obs.observe(c); });
  } else {
    cartes.forEach(montrer);
  }
  setTimeout(function () { cartes.forEach(montrer); }, 5000); // filet de sécurité mobile

  /* 3. Inclinaison 3D + reflet (souris uniquement) */
  if (reduit) return;
  cartes.forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = c.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty("--rx", ((px - 0.5) * 14).toFixed(2) + "deg");
      c.style.setProperty("--ry", ((0.5 - py) * 14).toFixed(2) + "deg");
      c.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      c.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      c.classList.add("est-survole");
    });
    c.addEventListener("pointerleave", function () {
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
      c.classList.remove("est-survole");
    });
  });
})();