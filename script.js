/* =========================================================
   RED PLANET — INTERACTIONS
   Front-end behaviour only. Form delivery requires a backend.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initSmoothScroll();
  initNavbarEffect();
  initRevealOnScroll();
  initCounterAnimations();
  initActiveNavLinks();
  initApplicationForms();
});

function initMobileNavigation() {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (!menuButton || !nav) return;

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");

  const closeMenu = () => {
    nav.classList.remove("active");
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    menuButton.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });
  });
}

function initNavbarEffect() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const update = () => navbar.classList.toggle("scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll(".reveal, .section, .card, .feature, .stat, .panel, .workflow-step");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  elements.forEach((element) => {
    element.classList.add("hidden-start");
    observer.observe(element);
  });
}

function initCounterAnimations() {
  const counters = document.querySelectorAll(".count[data-target]");
  if (!counters.length) return;

  const animate = (counter) => {
    const target = Number(counter.dataset.target);
    if (!Number.isFinite(target) || target < 0) return;
    const start = performance.now();
    const duration = 1200;

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * progress);
      counter.textContent = target >= 1000 ? value.toLocaleString() : String(value);
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach((counter) => { counter.textContent = counter.dataset.target; });
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}

function initActiveNavLinks() {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length || !("IntersectionObserver" in window)) return;

  const linkById = new Map();
  links.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (id) linkById.set(id, link);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      });
      const activeLink = linkById.get(entry.target.id);
      if (activeLink) {
        activeLink.classList.add("active");
        activeLink.setAttribute("aria-current", "location");
      }
    });
  }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });

  sections.forEach((section) => observer.observe(section));
}

function initApplicationForms() {
  document.querySelectorAll("#joinForm, .join-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const status = form.querySelector(".form-status");
      if (status) {
        status.classList.remove("success");
        status.textContent = "Your details are valid. Application delivery is not connected yet; a secure backend is the next step.";
      } else {
        window.alert("Your details are valid. Application delivery is not connected yet. Please check back soon.");
      }
    });
  });
}
