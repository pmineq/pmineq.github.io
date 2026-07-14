(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js-ready");

  if (!reduceMotion && window.Lenis) {
    const lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  if (reduceMotion || !window.gsap) {
    return;
  }

  const { gsap } = window;

  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  gsap.from("[data-hero-reveal]", {
    autoAlpha: 0,
    y: 18,
    duration: 0.72,
    stagger: 0.08,
    ease: "power3.out",
  });

  gsap.utils.toArray("[data-studio-section]").forEach((section) => {
    gsap.from(section.querySelectorAll(".section-heading, .reveal-card, .method-item, .idea-strip article"), {
      autoAlpha: 0,
      y: 24,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
    });
  });

  gsap.utils.toArray("[data-float]").forEach((element) => {
    gsap.to(element, {
      y: -10,
      rotate: 0.35,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });
})();
