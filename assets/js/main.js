// Main JavaScript for NuVue Media LLC

function initHeroSlideshow() {
  document.querySelectorAll(".page-hero--slideshow, .page-hero--portfolio").forEach((hero) => {
    if (hero.dataset.slideshowInit === "true") return;

    const slidesContainer = hero.querySelector(".page-hero-slides");
    if (!slidesContainer) return;

    hero.dataset.slideshowInit = "true";

    let slides = slidesContainer.querySelectorAll(".page-hero-slide");

    if (!slides.length) {
      const fromData = (hero.getAttribute("data-slideshow-images") || "")
        .split(",")
        .map((src) => src.trim())
        .filter(Boolean);

      const fromGrid = Array.from(hero.closest("main")?.querySelectorAll(".portfolio-item img") || [])
        .map((img) => img.getAttribute("src"))
        .filter(Boolean);

      const images = [...new Set([...fromData, ...fromGrid])];
      if (!images.length) return;

      images.forEach((src, index) => {
        const slide = document.createElement("div");
        slide.className = `page-hero-slide${index === 0 ? " is-active no-transition" : ""}`;
        slide.style.backgroundImage = `url("${src}")`;
        slidesContainer.appendChild(slide);
      });

      slides = slidesContainer.querySelectorAll(".page-hero-slide");
    }

    const activeSlide = slidesContainer.querySelector(".page-hero-slide.is-active");
    if (activeSlide?.classList.contains("no-transition")) {
      requestAnimationFrame(() => {
        activeSlide.classList.remove("no-transition");
      });
    }

    if (slides.length === 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let currentIndex = Array.from(slides).findIndex((slide) => slide.classList.contains("is-active"));
    if (currentIndex < 0) currentIndex = 0;

    window.setInterval(() => {
      slides[currentIndex].classList.remove("is-active");
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add("is-active");
    }, 5000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlideshow();

  const heroVideo = document.querySelector(".hero-video");
  const heroSource = heroVideo?.querySelector("source[data-src]");

  if (heroVideo && heroSource) {
    const revealHeroVideo = () => {
      heroVideo.classList.add("is-ready");
    };

    heroVideo.addEventListener("canplay", revealHeroVideo, { once: true });

    const loadHeroVideo = () => {
      if (heroSource.src || heroVideo.dataset.loaded === "true") return;
      heroSource.src = heroSource.dataset.src;
      heroVideo.dataset.loaded = "true";
      heroVideo.load();
      heroVideo.play().catch(() => {});
    };

    loadHeroVideo();
  }

  // Testimonial slider
  const slides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".dot");
  if (slides.length && dots.length) {
    let currentSlide = 0;

    const showSlide = (index) => {
      slides.forEach((slide) => slide.classList.remove("active"));
      dots.forEach((dot) => dot.classList.remove("active"));
      slides[index].classList.add("active");
      dots[index].classList.add("active");
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });

    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  // Image lazy loading
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach((img) => imageObserver.observe(img));
  } else {
    document.querySelectorAll("img[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }

  // Simple parallax effect for the CTA section
  const ctaSection = document.querySelector(".cta-section");
  if (ctaSection) {
    window.addEventListener("scroll", () => {
      const scrollPosition = window.pageYOffset;
      ctaSection.style.backgroundPositionY = scrollPosition * 0.1 + "px";
    });
  }

  // Video modal functionality
  const viewDemoBtn = document.getElementById("viewDemoBtn");
  const videoModal = document.getElementById("videoModal");
  const videoModalClose = document.getElementById("videoModalClose");
  const videoContainer = document.getElementById("videoContainer");

  if (viewDemoBtn && videoModal && videoModalClose && videoContainer) {
    const clearVideo = () => {
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }
    };

    const loadVideo = () => {
      clearVideo();
      const player = document.createElement("div");
      player.className = "video-modal-player";
      const video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.src = "assets/images/folly-beach/folly-beach-loop.mp4";
      player.appendChild(video);
      videoContainer.appendChild(player);
      video.play().catch(() => {});
    };

    viewDemoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loadVideo();
      videoModal.classList.add("active");
    });

    videoModalClose.addEventListener("click", () => {
      videoModal.classList.remove("active");
      clearVideo();
    });

    window.addEventListener("click", (e) => {
      if (e.target === videoModal) {
        videoModal.classList.remove("active");
        clearVideo();
      }
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  // Avoid reloading when already on the homepage
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/index.html";
  document.querySelectorAll('a[href="index.html"], a[href="./"], a[href="/"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const onHome =
        currentPath.endsWith("/index.html") ||
        currentPath.endsWith("/") ||
        !currentPath.split("/").pop().includes(".");
      if (onHome) event.preventDefault();
    });
  });

  // Portfolio item hover effect
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const overlay = item.querySelector('.item-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateY(0)';
      }
    });
    
    item.addEventListener('mouseleave', () => {
      const overlay = item.querySelector('.item-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateY(20px)';
      }
    });
  });
  
  // Lazy loading images
  const lazyImages = document.querySelectorAll('img.lazy-load');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.onload = () => {
            img.classList.add('loaded');
          };
          
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver support
    const lazyLoad = () => {
      const scrollTop = window.pageYOffset;
      
      lazyImages.forEach(img => {
        if (img.offsetTop < window.innerHeight + scrollTop) {
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.add('loaded');
        }
      });
      
      if (lazyImages.length === 0) { 
        document.removeEventListener('scroll', lazyLoad);
        window.removeEventListener('resize', lazyLoad);
        window.removeEventListener('orientationChange', lazyLoad);
      }
    };
    
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationChange', lazyLoad);
  }
  
});
