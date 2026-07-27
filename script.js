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
  localStorage.setItem("otr_cookie_consent", value);
}

function getCookieConsent() {
  return localStorage.getItem("otr_cookie_consent");
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
