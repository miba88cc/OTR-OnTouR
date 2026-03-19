function selectOffer(offerName) {
  const offerInput = document.getElementById("offer");
  const formSection = document.getElementById("anfrage");

  if (offerInput) {
    offerInput.value = offerName;
  }

  if (formSection) {
    formSection.scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const heroVideo = document.getElementById("heroVideo");

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.autoplay = true;
    heroVideo.loop = true;

    heroVideo.setAttribute("muted", "");
    heroVideo.setAttribute("playsinline
