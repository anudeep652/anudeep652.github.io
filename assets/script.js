/* ============================================================
   Anudeep S — Portfolio JS
   No deps. Plain vanilla.
============================================================ */

(() => {
  "use strict";

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav shadow on scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target))
        closeMenu();
    });
  }

  /* ---------- Typing effect ---------- */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const phrases = [
      "fullstack web apps.",
      "React Native apps.",
      "open-source tools.",
      "fast, accessible UIs.",
      "with Node.js & TypeScript.",
    ];
    let pi = 0,
      ci = 0,
      deleting = false;
    const TYPE_MS = 75,
      DEL_MS = 38,
      PAUSE_END = 1400,
      PAUSE_START = 250;

    const tick = () => {
      const word = phrases[pi];
      typedEl.textContent = word.slice(0, ci);
      if (!deleting) {
        if (ci < word.length) {
          ci++;
          setTimeout(tick, TYPE_MS);
        } else {
          deleting = true;
          setTimeout(tick, PAUSE_END);
        }
      } else {
        if (ci > 0) {
          ci--;
          setTimeout(tick, DEL_MS);
        } else {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, PAUSE_START);
        }
      }
    };
    tick();
  }

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Skill chips ---------- */
  const ICON_BASE =
    "https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/";
  document.querySelectorAll("[data-skills]").forEach((wrap) => {
    let list;
    try {
      list = JSON.parse(wrap.getAttribute("data-skills"));
    } catch {
      return;
    }
    const html = list
      .map(
        ([name, href, icon]) =>
          `<a class="chip" href="${href}" target="_blank" rel="noreferrer" title="${name}">
             <img loading="lazy" src="${ICON_BASE}${icon}" alt="${name} icon" width="18" height="18"/>
             <span>${name}</span>
           </a>`,
      )
      .join("");
    wrap.innerHTML = html;
  });

  /* ---------- Project cards: mouse-tracked glow ---------- */
  document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".proj-card").forEach((card) => {
      const r = card.getBoundingClientRect();
      if (
        e.clientX < r.left - 60 ||
        e.clientX > r.right + 60 ||
        e.clientY < r.top - 60 ||
        e.clientY > r.bottom + 60
      )
        return;
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- GitHub data (shared cache for projects + stats) ---------- */
  const USERNAME = "anudeep652";
  const ONE_HOUR = 60 * 60 * 1000;

  let reposPromise = null;
  function getRepos() {
    if (reposPromise) return reposPromise;
    const KEY = `gh_repos_${USERNAME}_v3`;

    reposPromise = (async () => {
      try {
        const cached = JSON.parse(localStorage.getItem(KEY) || "null");
        if (
          cached &&
          Date.now() - cached.t < ONE_HOUR &&
          Array.isArray(cached.d)
        ) {
          return cached.d;
        }
      } catch {}

      const res = await fetch(
        `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const repos = await res.json();

      try {
        localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: repos }));
      } catch {}

      return repos;
    })();

    return reposPromise;
  }

  let userPromise = null;
  function getUser() {
    if (userPromise) return userPromise;
    const KEY = `gh_user_${USERNAME}_v1`;

    userPromise = (async () => {
      try {
        const cached = JSON.parse(localStorage.getItem(KEY) || "null");
        if (cached && Date.now() - cached.t < ONE_HOUR && cached.d) {
          return cached.d;
        }
      } catch {}

      const res = await fetch(`https://api.github.com/users/${USERNAME}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const user = await res.json();

      try {
        localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: user }));
      } catch {}

      return user;
    })();

    return userPromise;
  }

  /* ---------- Projects ---------- */
  const projectsGrid = document.getElementById("projectsGrid");
  if (projectsGrid) loadProjects(projectsGrid).catch(() => {});

  async function loadProjects(grid) {
    try {
      const repos = await getRepos();

      const filtered = repos
        .filter(
          (r) => !r.fork && !r.archived && r.name !== `${USERNAME}.github.io`,
        )
        .sort((a, b) => {
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        })
        .slice(0, 6);

      render(grid, filtered);
    } catch (err) {
      console.error("Failed to load GitHub repos:", err);
      grid.innerHTML = `
        <div class="proj-error">
          Couldn't load repositories right now.
          <br/>
          <a href="https://github.com/${USERNAME}" target="_blank" rel="noreferrer">Browse on GitHub →</a>
        </div>`;
    }
  }

  /* ---------- GitHub stats panel + top languages ---------- */
  const ghStatsEl = document.getElementById("ghStats");
  const ghLangsEl = document.getElementById("ghLangs");
  if (ghStatsEl || ghLangsEl) loadGhStats().catch(() => {});

  async function loadGhStats() {
    let repos = [];
    let user = null;

    try {
      repos = await getRepos();
    } catch (err) {
      console.error("Failed to load repos for stats:", err);
    }
    try {
      user = await getUser();
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }

    const ownRepos = repos.filter((r) => !r.fork);
    const totalStars = ownRepos.reduce(
      (s, r) => s + (r.stargazers_count || 0),
      0,
    );
    const totalForks = ownRepos.reduce((s, r) => s + (r.forks_count || 0), 0);
    const totalRepos = user?.public_repos ?? ownRepos.length;
    const followers = user?.followers ?? "—";

    if (ghStatsEl) {
      const cards = [
        { num: totalRepos, label: "Public repos" },
        { num: totalStars, label: "Total stars" },
        { num: totalForks, label: "Total forks" },
        { num: followers, label: "Followers" },
      ];
      ghStatsEl.innerHTML = cards
        .map(
          (c) => `
            <div class="stat-num-card">
              <span class="stat-num">${c.num}</span>
              <span class="stat-label">${c.label}</span>
            </div>`,
        )
        .join("");
    }

    if (ghLangsEl) {
      const langCounts = {};
      ownRepos.forEach((r) => {
        if (r.language)
          langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      });
      const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
      const total = sorted.reduce((s, [, c]) => s + c, 0);
      const top = sorted.slice(0, 6);

      if (!top.length || total === 0) {
        ghLangsEl.innerHTML = `<div class="lang-bar-placeholder">No language data available.</div>`;
        return;
      }

      ghLangsEl.innerHTML = top
        .map(([lang, count]) => {
          const pct = ((count / total) * 100).toFixed(1);
          const color = LANG_COLORS[lang] || "#71717a";
          return `
            <div class="lang-bar" style="--w:${pct}%;--c:${color}">
              <span class="lang-bar-name">
                <span class="lang-dot" style="background:${color}"></span>
                ${escapeHtml(lang)}
              </span>
              <div class="lang-bar-track"><div class="lang-bar-fill"></div></div>
              <span class="lang-bar-pct">${pct}%</span>
            </div>`;
        })
        .join("");

      const bars = ghLangsEl.querySelectorAll(".lang-bar");
      const animate = () =>
        bars.forEach((b, i) => setTimeout(() => b.classList.add("in"), i * 90));

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animate();
                io.disconnect();
              }
            });
          },
          { threshold: 0.25 },
        );
        io.observe(ghLangsEl);
      } else {
        animate();
      }
    }
  }

  /* Hand-written descriptions for repos where the GitHub
     "About" field is empty. Keyed by repo name. */
  const REPO_DESCRIPTIONS = {
    "bus-booking-system":
      "Multi-role bus ticket booking REST API — users book seats, operators publish trips, admins oversee. Built with Node, Express, MongoDB, JWT auth, and shipped via Docker for dev & prod.",
    "open-this":
      "Cross-folder file & directory search CLI written in Rust — finds your target anywhere on disk and opens it in VS Code (or your default app). Built to escape endless `cd`'ing in the terminal.",
    "rust-kill-process":
      "A tiny Rust CLI (`p-kill`) that frees up any TCP port by killing the process bound to it — a one-line replacement for `kill -9 $(lsof -t -i:PORT)`.",
    "bookstore-library-backend":
      "Node + Express + Mongoose REST API powering the Bookstore-Library app. JWT-based auth, bcrypt password hashing, and SendGrid transactional email for account flows.",
    "components-backend":
      "Express + MongoDB backend serving user authentication and reusable UI-component data for a frontend components playground.",
    "bookstore-library":
      "Full-stack monorepo for an online bookstore-library — a React client and an Express + MongoDB API wired together cleanly via git submodules.",
  };

  const LANG_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    C: "#555555",
    "C++": "#f34b7d",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Dart: "#00B4AB",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Kotlin: "#A97BFF",
    Swift: "#F05138",
    Solidity: "#AA6746",
  };

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render(grid, repos) {
    if (!repos.length) {
      grid.innerHTML = `<div class="proj-empty">No public repos to show yet — check back soon.</div>`;
      return;
    }

    grid.innerHTML = repos
      .map((r) => {
        const fallback = REPO_DESCRIPTIONS[r.name];
        const desc = escapeHtml(
          r.description || fallback || "No description provided.",
        );
        const name = escapeHtml(r.name);
        const lang = escapeHtml(r.language || "");
        const langColor = LANG_COLORS[r.language] || "#71717a";
        const stars = r.stargazers_count || 0;
        const forks = r.forks_count || 0;
        const homepage =
          r.homepage && /^https?:\/\//.test(r.homepage) ? r.homepage : "";

        return `
          <article class="proj-card">
            <div class="proj-head">
              <div class="proj-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 4a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm9 1v3a1 1 0 001 1h3l-4-4z"/></svg>
              </div>
              <div class="proj-actions">
                <a href="${r.html_url}" target="_blank" rel="noreferrer" aria-label="View source on GitHub" title="Source">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.74 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/></svg>
                </a>
                ${
                  homepage
                    ? `
                  <a href="${escapeHtml(homepage)}" target="_blank" rel="noreferrer" aria-label="Live demo" title="Live demo">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>`
                    : ""
                }
              </div>
            </div>
            <h3><a href="${r.html_url}" target="_blank" rel="noreferrer">${name}</a></h3>
            <p>${desc}</p>
            <div class="proj-meta">
              ${lang ? `<span><span class="lang-dot" style="background:${langColor}"></span>${lang}</span>` : ""}
              <span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                ${stars}
              </span>
              <span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 3a3 3 0 100 6 3 3 0 000-6zm12 0a3 3 0 100 6 3 3 0 000-6zM6 15a3 3 0 100 6 3 3 0 000-6zm1-5h10v2H7v-2zm5 2h2v3h-2v-3z"/></svg>
                ${forks}
              </span>
            </div>
          </article>`;
      })
      .join("");
  }
})();
