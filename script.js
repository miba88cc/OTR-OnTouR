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
  if (popup) {
    popup.classList.remove("active");
    popup.setAttribute("aria-hidden", "true");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const heroVideo = document.getElementById("heroVideo");
  const form = document.getElementById("form");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");
  const popup = document.getElementById("successPopup");

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.autoplay = true;
    heroVideo.loop = true;

    heroVideo.setAttribute("muted", "");
    heroVideo.setAttribute("playsinline", "");
    heroVideo.setAttribute("webkit-playsinline", "");
    heroVideo.setAttribute("autoplay", "");
    heroVideo.setAttribute("loop", "");

    const tryPlayHero = () => {
      const promise = heroVideo.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    };

    heroVideo.addEventListener("loadeddata", tryPlayHero);
    heroVideo.addEventListener("canplay", tryPlayHero);
    window.addEventListener("pageshow", tryPlayHero);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        tryPlayHero();
      }
    });

    tryPlayHero();
  }

  const portfolioVideos = document.querySelectorAll(".portfolio-video, .swap-video");

  portfolioVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");

    const tryPlay = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    };

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("mouseenter", tryPlay);
    video.addEventListener("touchstart", tryPlay, { passive: true });

    tryPlay();
  });

  const hoverCards = document.querySelectorAll(".portfolio-hover-swap");

  hoverCards.forEach((card) => {
    const hoverVideo = card.querySelector(".swap-video");
    if (!hoverVideo) return;

    card.addEventListener("mouseenter", () => {
      const promise = hoverVideo.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    });

    card.addEventListener("mouseleave", () => {
      hoverVideo.pause();
      hoverVideo.currentTime = 0;
    });
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Wird gesendet...";
      }

      if (formStatus) {
        formStatus.textContent = "Wird gesendet...";
      }

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: json
        });

        const data = await response.json();

        if (response.ok) {
          if (formStatus) {
            formStatus.textContent = "";
          }

          if (popup) {
            popup.classList.add("active");
            popup.setAttribute("aria-hidden", "false");
          }

          if (typeof gtag !== "undefined") {
            gtag("event", "lead_submitted", {
              event_category: "Form",
              event_label: object.angebot || "unknown"
            });
          }

          form.reset();
        } else {
          if (formStatus) {
            formStatus.textContent = "Fehler beim Senden. Bitte erneut versuchen.";
          }
          console.error("Web3Forms error:", data);
        }
      } catch (error) {
        if (formStatus) {
          formStatus.textContent = "Netzwerkfehler. Bitte erneut versuchen.";
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
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        closePopup();
      }
    });
  }
});