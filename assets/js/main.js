// Small progressive enhancements. Everything on the site works without JS except the lightbox and search filter.

// Mobile navigation
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
}

// E-mail addresses written as "user(at)domain" become mailto links
document.querySelectorAll(".js-email").forEach((a) => {
  const addr = `${a.dataset.u}@${a.dataset.d}`;
  a.href = `mailto:${addr}`;
  a.textContent = addr;
});

// Contact form: preselect subject from ?subject=phd etc.
const subject = document.getElementById("f-subject");
if (subject) {
  const want = new URLSearchParams(location.search).get("subject");
  if (want && [...subject.options].some((o) => o.value === want)) subject.value = want;
}

// YouTube: load the player only when clicked
document.querySelectorAll(".yt").forEach((box) => {
  box.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    const iframe = document.createElement("iframe");
    const start = box.dataset.start ? `&start=${box.dataset.start}` : "";
    iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0${start}`;
    iframe.title = box.querySelector("a").getAttribute("aria-label") || "YouTube video";
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    box.replaceChildren(iframe);
  });
});

// Lightbox for photo links
const links = [...document.querySelectorAll(".lightbox-link")];
if (links.length) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.hidden = true;
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure>
    <button class="lb-close" type="button" aria-label="Close">×</button>
    <button class="lb-prev" type="button" aria-label="Previous">‹</button>
    <button class="lb-next" type="button" aria-label="Next">›</button>`;
  document.body.append(lb);
  const img = lb.querySelector("img");
  const cap = lb.querySelector("figcaption");
  let group = [];
  let idx = 0;
  let opener = null;

  const show = (i) => {
    idx = (i + group.length) % group.length;
    const a = group[idx];
    img.src = a.href;
    img.alt = a.dataset.caption || "";
    cap.textContent = a.dataset.caption || "";
    const multi = group.length > 1;
    lb.querySelector(".lb-prev").hidden = !multi;
    lb.querySelector(".lb-next").hidden = !multi;
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    img.removeAttribute("src");
    opener?.focus();
  };
  links.forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      opener = a;
      group = links.filter((l) => l.dataset.group === a.dataset.group);
      show(group.indexOf(a));
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    })
  );
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

// Publication search / type filter
const q = document.getElementById("pub-search");
const typeSel = document.getElementById("pub-type");
if (q && typeSel) {
  const years = [...document.querySelectorAll(".pub-year")];
  const counter = document.querySelector("[data-pub-count]");
  const empty = document.querySelector(".pub-empty");
  const apply = () => {
    const terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const type = typeSel.value;
    let total = 0;
    years.forEach((y) => {
      let n = 0;
      y.querySelectorAll(".pub").forEach((li) => {
        const t = li.dataset.type;
        const typeOk = !type || t === type || (type === "book-chapter" && (t === "book" || t === "book-chapter"));
        const ok = typeOk && terms.every((w) => li.dataset.search.includes(w));
        li.hidden = !ok;
        if (ok) n++;
      });
      y.hidden = n === 0;
      total += n;
    });
    if (counter) counter.textContent = total;
    if (empty) empty.hidden = total !== 0;
  };
  let timer;
  q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
  typeSel.addEventListener("change", apply);
  const initial = new URLSearchParams(location.search).get("q");
  if (initial) { q.value = initial; apply(); }
}
