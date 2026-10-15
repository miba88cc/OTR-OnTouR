const GA_MEASUREMENT_ID = "G-NLWQMN5WKY";

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};

function loadGoogleAnalytics() {
  if (window.__gaLoaded) return;

  window.__gaLoaded = true;
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(analyticsScript);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true
  });
}

function selectOffer(offerName) {
  const offerInput = document.getElementById("offer");
  const formSection = document.getElementById("anfrage");

  if (offerInput) {
    offerInput.value = offerName;
    offerInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  if (formSection) {
    formSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function closePopup() {
  const popup = document.getElementById("successPopup");
  if (!popup) return;

  popup.classList.remove("active");
  popup.setAttribute("aria-hidden", "true");
}

function setCookieConsent(value) {
  try { localStorage.setItem("otr_cookie_consent", value); } catch (e) {}
}

function getCookieConsent() {
  try { return localStorage.getItem("otr_cookie_consent"); } catch (e) { return null; }
}

/* ---------- Theme (hell / dunkel) ---------- */
const THEME_KEY = "otr_theme";

function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.setAttribute("aria-label", theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren");
  }
}

function initTheme() {
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

  if (media && media.addEventListener) {
    media.addEventListener("change", (event) => {
      if (!getStoredTheme()) applyTheme(event.matches ? "light" : "dark");
    });
  }

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }
}

/* ---------- Header, Menü, Back-to-top ---------- */
function initHeader() {
  const header = document.getElementById("siteHeader");
  const hero = document.querySelector(".hero");
  const backToTop = document.querySelector(".back-to-top");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    if (header && hero) {
      const limit = hero.offsetHeight - header.offsetHeight - 10;
      header.classList.toggle("on-hero", y < limit);
    }
    if (backToTop) backToTop.classList.toggle("visible", y > 700);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (header && menuToggle && navLinks) {
    const setOpen = (open) => {
      header.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
    };
    menuToggle.addEventListener("click", () => setOpen(!header.classList.contains("menu-open")));
    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (header.classList.contains("menu-open") && !header.contains(event.target)) setOpen(false);
    });
  }
}

/* ---------- Reveal-Animationen ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  items.forEach((el) => io.observe(el));
}

/* ---------- Business-Videos: erst auf Klick, mit Ton ---------- */
function initSoundVideos() {
  const videos = Array.from(document.querySelectorAll(".sound-video"));
  if (!videos.length) return [];

  videos.forEach((video) => {
    const item = video.closest(".portfolio-item");
    const media = video.closest(".portfolio-media");
    const button = item ? item.querySelector(".play-sound") : null;
    const label = button ? button.querySelector(".play-label") : null;

    const setState = (playing) => {
      if (!button) return;
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Video pausieren" : "Video mit Ton abspielen");
      if (label) label.textContent = playing ? "Pause" : "Abspielen";
    };

    const start = () => {
      document.dispatchEvent(new CustomEvent("otr:sound", { detail: video }));
      loadDeferredVideo(video);
      video.muted = false;
      if (button) button.classList.add("is-loading");
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          // Falls der Browser Ton blockiert: stumm abspielen statt gar nicht
          video.muted = true;
          safelyPlay(video);
        });
      }
    };

    const toggle = () => {
      if (video.paused) start(); else video.pause();
    };

    if (button) button.addEventListener("click", toggle);
    video.addEventListener("click", toggle);

    video.addEventListener("playing", () => {
      if (media) media.classList.add("video-ready");
      if (button) button.classList.remove("is-loading");
      setState(true);
    });
    video.addEventListener("pause", () => {
      if (button) button.classList.remove("is-loading");
      setState(false);
    });

    document.addEventListener("otr:sound", (event) => {
      if (event.detail !== video && !video.paused) video.pause();
    });
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !entry.target.paused) entry.target.pause();
      });
    }, { threshold: 0.2 });
    videos.forEach((v) => io.observe(v));
  }

  return videos;
}

/* ---------- Kunden-Reels ---------- */
function initReels(canAutoplayMedia, saveData) {
  const reels = Array.from(document.querySelectorAll(".reel-video"));
  if (!reels.length) return [];
  const setPosterEarly = (video) => {
    if (video.dataset.poster && !video.poster) video.poster = video.dataset.poster;
  };
  if (!("IntersectionObserver" in window)) reels.forEach(setPosterEarly);

  reels.forEach((video) => {
    video.muted = true;
    video.playsInline = true;

    const button = video.parentElement.querySelector(".reel-sound");
    if (button) {
      button.addEventListener("click", () => {
        const enable = video.muted;
        reels.forEach((other) => {
          other.muted = true;
          const b = other.parentElement.querySelector(".reel-sound");
          if (b) { b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Ton einschalten"); }
        });
        video.muted = !enable;
        if (enable) {
          document.dispatchEvent(new CustomEvent("otr:sound", { detail: video }));
          loadDeferredVideo(video);
          safelyPlay(video);
        }
        button.setAttribute("aria-pressed", String(enable));
        button.setAttribute("aria-label", enable ? "Ton ausschalten" : "Ton einschalten");
      });
    }

    video.addEventListener("click", () => {
      setPoster(video);
      loadDeferredVideo(video);
      if (video.paused) safelyPlay(video); else video.pause();
    });
  });

  document.addEventListener("otr:sound", (event) => {
    reels.forEach((other) => {
      if (other === event.detail || other.muted) return;
      other.muted = true;
      const b = other.parentElement.querySelector(".reel-sound");
      if (b) { b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Ton einschalten"); }
    });
  });

  const setPoster = (video) => {
    if (video.dataset.poster && !video.poster) video.poster = video.dataset.poster;
  };

  if ("IntersectionObserver" in window) {
    const posterIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setPoster(entry.target);
          posterIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: "900px 0px" });
    reels.forEach((v) => posterIo.observe(v));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          setPoster(video);
          if (!saveData) loadDeferredVideo(video);
          if (canAutoplayMedia) safelyPlay(video);
        } else {
          video.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.35 });
    reels.forEach((v) => io.observe(v));
  }

  return reels;
}

function showCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  banner.classList.add("active");
  banner.setAttribute("aria-hidden", "false");
}

function hideCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  banner.classList.remove("active");
  banner.setAttribute("aria-hidden", "true");
}

function safelyPlay(video) {
  if (!video) return;

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
}

function loadDeferredVideo(video) {
  if (!video || video.dataset.loaded === "true") return;

  const sources = video.querySelectorAll("source[data-src]");
  let hasSource = false;

  sources.forEach((source) => {
    if (!source.src) {
      source.src = source.dataset.src;
      hasSource = true;
    }
  });

  if (hasSource) {
    video.load();
  }

  video.dataset.loaded = "true";
}

document.addEventListener("DOMContentLoaded", () => {
  const heroVideo = document.getElementById("heroVideo");
  const form = document.getElementById("form");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");
  const popup = document.getElementById("successPopup");
  const cookieAccept = document.getElementById("cookieAccept");
  const cookieDecline = document.getElementById("cookieDecline");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const canAutoplayMedia = !reducedMotion && !saveData;
  const formReadyAt = Date.now();

  initTheme();
  initHeader();
  initReveal();
  const reelVideos = initReels(canAutoplayMedia, saveData);
  const soundVideos = initSoundVideos();

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.autoplay = true;
    heroVideo.loop = true;
    heroVideo.preload = "auto";

    heroVideo.addEventListener("loadeddata", () => safelyPlay(heroVideo), { once: true });
    heroVideo.addEventListener("canplay", () => safelyPlay(heroVideo));
    window.addEventListener("pageshow", () => safelyPlay(heroVideo));
    document.addEventListener("pointerdown", () => safelyPlay(heroVideo), { once: true });
    safelyPlay(heroVideo);
  }

  const portfolioVideos = Array.from(document.querySelectorAll(".portfolio-video, .swap-video"));
  const visibleVideos = new Set();

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            visibleVideos.add(video);

            if (!saveData) {
              loadDeferredVideo(video);
            }

            if (canAutoplayMedia && video.classList.contains("portfolio-video")) {
              safelyPlay(video);
            }
          } else {
            visibleVideos.delete(video);
            video.pause();
          }
        });
      }, {
        rootMargin: "250px 0px",
        threshold: 0.15
      })
    : null;

  portfolioVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.addEventListener("playing", () => {
      const media = video.closest(".portfolio-media");
      const card = video.closest(".portfolio-hover-swap");

      if (media) media.classList.add("video-ready");
      if (card) card.classList.add("video-ready");
    });

    if (observer) {
      observer.observe(video);
    } else if (!saveData) {
      loadDeferredVideo(video);
    }
  });

  document.querySelectorAll(".portfolio-hover-swap").forEach((card) => {
    const hoverVideo = card.querySelector(".swap-video");
    if (!hoverVideo) return;

    const startHoverVideo = () => {
      if (saveData || reducedMotion) return;
      loadDeferredVideo(hoverVideo);
      safelyPlay(hoverVideo);
    };

    card.addEventListener("mouseenter", startHoverVideo);
    card.addEventListener("focusin", startHoverVideo);
    card.addEventListener("touchstart", startHoverVideo, { passive: true });

    card.addEventListener("mouseleave", () => {
      hoverVideo.pause();
      hoverVideo.currentTime = 0;
      card.classList.remove("video-ready");
    });

    card.addEventListener("focusout", () => {
      hoverVideo.pause();
      card.classList.remove("video-ready");
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (heroVideo) heroVideo.pause();
      portfolioVideos.forEach((video) => video.pause());
      reelVideos.forEach((video) => video.pause());
      soundVideos.forEach((video) => video.pause());
      return;
    }

    if (heroVideo) {
      safelyPlay(heroVideo);
    }

    visibleVideos.forEach((video) => {
      if (canAutoplayMedia && video.classList.contains("portfolio-video")) {
        safelyPlay(video);
      }
    });
  });

  const consent = getCookieConsent();

  if (consent === "accepted") {
    loadGoogleAnalytics();
  } else if (!consent) {
    showCookieBanner();
  }

  if (cookieAccept) {
    cookieAccept.addEventListener("click", () => {
      setCookieConsent("accepted");
      loadGoogleAnalytics();
      hideCookieBanner();

      if (window.__gaLoaded) {
        window.gtag("event", "cookie_consent_accepted");
      }
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener("click", () => {
      setCookieConsent("declined");
      hideCookieBanner();
    });
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const botcheck = form.querySelector('input[name="botcheck"]');
      if (botcheck && botcheck.checked) {
        return;
      }

      if (Date.now() - formReadyAt < 1800) {
        if (formStatus) {
          formStatus.textContent = "Bitte prüfe deine Angaben und versuche es erneut.";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Wird gesendet...";
      }

      if (formStatus) {
        formStatus.textContent = "Wird gesendet...";
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.ok && data.success !== false) {
          if (formStatus) {
            formStatus.textContent = "";
          }

          if (popup) {
            popup.classList.add("active");
            popup.setAttribute("aria-hidden", "false");
          }

          if (getCookieConsent() === "accepted" && window.__gaLoaded) {
            window.gtag("event", "lead_submitted", {
              event_category: "Form",
              event_label: payload.angebot || "unknown"
            });
          }

          form.reset();
        } else if (response.status === 429) {
          if (formStatus) {
            formStatus.textContent = "Zu viele Anfragen in kurzer Zeit. Bitte später erneut versuchen oder direkt per E-Mail schreiben.";
          }
        } else {
          if (formStatus) {
            formStatus.textContent = "Fehler beim Senden. Bitte erneut versuchen oder direkt per E-Mail schreiben.";
          }
          console.error("Web3Forms error:", data);
        }
      } catch (error) {
        if (formStatus) {
          formStatus.textContent = "Netzwerkfehler. Bitte erneut versuchen oder direkt per E-Mail schreiben.";
        }
        console.error("Submit error:", error);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Anfrage senden";
        }
      }
    });
  }

  if (popup) {
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && popup.classList.contains("active")) {
        closePopup();
      }
    });
  }
});
