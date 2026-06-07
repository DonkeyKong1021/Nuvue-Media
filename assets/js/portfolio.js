document.addEventListener('DOMContentLoaded', () => {
  initPortfolioStats();
  initPortfolioFilters();
  initPortfolioLightbox();
  initDemoVideoModal();
  initSpotlightVideo();
});

function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('#portfolioGallery .filter-btn');
  const portfolioItems = document.querySelectorAll('#portfolioGallery .portfolio-item');
  const resultsEl = document.getElementById('portfolioResults');
  const emptyEl = document.getElementById('portfolioEmpty');

  const categoryLabels = {
    weddings: 'Weddings',
    'real-estate': 'Real Estate',
    commercial: 'Commercial',
  };

  const matchesFilter = (item, filterValue) => {
    if (filterValue === 'all') return true;
    return (item.getAttribute('data-category') || '').includes(filterValue);
  };

  const updateResults = (filterValue) => {
    let visibleCount = 0;
    portfolioItems.forEach((item) => {
      const visible = matchesFilter(item, filterValue);
      item.classList.toggle('is-filtered-out', !visible);
      if (visible) visibleCount += 1;
    });

    if (resultsEl) {
      const label = categoryLabels[filterValue] || 'All work';
      resultsEl.textContent =
        filterValue === 'all'
          ? `Showing all ${visibleCount} items`
          : `${visibleCount} ${label.toLowerCase()} item${visibleCount === 1 ? '' : 's'}`;
    }

    if (emptyEl) {
      emptyEl.classList.toggle('is-visible', visibleCount === 0);
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');
      updateResults(this.getAttribute('data-filter'));
    });
  });

  updateResults('all');
}

function initSpotlightVideo() {
  const spotlightVideo = document.querySelector('.spotlight-card-media video[data-preview]');
  if (!spotlightVideo) return;

  const parent = spotlightVideo.closest('.spotlight-card');
  if (!parent) return;

  let isLoaded = false;

  const ensureLoaded = () => {
    if (isLoaded || !spotlightVideo.dataset.src) return;
    spotlightVideo.src = spotlightVideo.dataset.src;
    isLoaded = true;
  };

  parent.addEventListener('mouseenter', () => {
    ensureLoaded();
    spotlightVideo.currentTime = 0;
    spotlightVideo.play().catch(() => {});
  });

  parent.addEventListener('mouseleave', () => {
    spotlightVideo.pause();
    spotlightVideo.currentTime = 0;
  });
}

function initPortfolioStats() {
  const galleryItems = document.querySelectorAll('#portfolioGallery .portfolio-item');
  const photos = document.querySelectorAll('#portfolioGallery .portfolio-item[data-media="photo"]').length;
  const demos = document.querySelectorAll('.portfolio-demos .portfolio-item').length;
  const categories = new Set(
    Array.from(galleryItems).map((item) => item.getAttribute('data-category')).filter(Boolean)
  ).size;

  const stats = document.querySelectorAll('.portfolio-stat strong');
  if (stats[0]) stats[0].textContent = String(photos);
  if (stats[1]) stats[1].textContent = String(demos);
  if (stats[2]) stats[2].textContent = String(categories);
}

function initDemoVideoModal() {
  const demoBtn = document.getElementById('weddingDemoBtn');
  const videoModal = document.getElementById('videoModal');
  const videoModalClose = document.getElementById('videoModalClose');
  const videoContainer = document.getElementById('videoContainer');

  if (!demoBtn || !videoModal || !videoModalClose || !videoContainer) return;

  const clearVideo = () => {
    while (videoContainer.firstChild) {
      videoContainer.removeChild(videoContainer.firstChild);
    }
  };

  const loadVideo = () => {
    clearVideo();
    const iframe = document.createElement('iframe');
    iframe.width = '800';
    iframe.height = '450';
    iframe.src = 'https://www.youtube.com/embed/uQPXx1ccGYI';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );
    iframe.setAttribute('allowfullscreen', '');
    videoContainer.appendChild(iframe);
  };

  demoBtn.addEventListener('click', (event) => {
    event.preventDefault();
    loadVideo();
    videoModal.classList.add('active');
  });

  videoModalClose.addEventListener('click', () => {
    videoModal.classList.remove('active');
    clearVideo();
  });

  window.addEventListener('click', (event) => {
    if (event.target === videoModal) {
      videoModal.classList.remove('active');
      clearVideo();
    }
  });
}

function isVideoLink(link) {
  if (link.getAttribute('data-type') === 'video') return true;
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(link.getAttribute('href') || '');
}

function getGalleryRoot(link) {
  return link.closest('[data-gallery]');
}

function getVisibleLinks(galleryRoot) {
  if (!galleryRoot) return [];
  return Array.from(galleryRoot.querySelectorAll('.portfolio-item:not(.is-filtered-out) a[href]'));
}

function initPortfolioLightbox() {
  const modal = document.createElement('div');
  modal.className = 'portfolio-lightbox';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="portfolio-lightbox-backdrop" data-lightbox-close></div>
    <div class="portfolio-lightbox-content">
      <button type="button" class="portfolio-lightbox-close" aria-label="Close gallery">&times;</button>
      <button type="button" class="portfolio-lightbox-nav portfolio-lightbox-prev" aria-label="Previous item">&lsaquo;</button>
      <figure class="portfolio-lightbox-figure">
        <img class="portfolio-lightbox-image" src="" alt="">
        <video class="portfolio-lightbox-video is-hidden" controls playsinline></video>
        <div class="portfolio-lightbox-meta">
          <figcaption class="portfolio-lightbox-caption"></figcaption>
          <p class="portfolio-lightbox-counter"></p>
        </div>
      </figure>
      <button type="button" class="portfolio-lightbox-nav portfolio-lightbox-next" aria-label="Next item">&rsaquo;</button>
    </div>
  `;
  document.body.appendChild(modal);

  const image = modal.querySelector('.portfolio-lightbox-image');
  const video = modal.querySelector('.portfolio-lightbox-video');
  const caption = modal.querySelector('.portfolio-lightbox-caption');
  const counter = modal.querySelector('.portfolio-lightbox-counter');
  const prevBtn = modal.querySelector('.portfolio-lightbox-prev');
  const nextBtn = modal.querySelector('.portfolio-lightbox-next');
  let links = [];
  let currentIndex = 0;
  let activeGallery = null;

  const refreshLinks = () => {
    links = getVisibleLinks(activeGallery);
  };

  const stopVideo = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.classList.add('is-hidden');
  };

  const showImage = (link) => {
    stopVideo();
    image.classList.remove('is-hidden');
    image.src = link.getAttribute('href');
    image.alt = link.querySelector('img')?.alt || link.getAttribute('data-title') || '';
  };

  const showVideo = (link) => {
    image.classList.add('is-hidden');
    image.removeAttribute('src');
    video.classList.remove('is-hidden');
    video.src = link.getAttribute('href');
    video.load();
    video.play().catch(() => {});
  };

  const updateCounter = () => {
    counter.textContent = `${currentIndex + 1} of ${links.length}`;
  };

  const openAt = (index) => {
    refreshLinks();
    if (!links.length) return;

    currentIndex = index;
    const link = links[currentIndex];
    caption.textContent = link.getAttribute('data-title') || '';
    updateCounter();

    if (isVideoLink(link)) {
      showVideo(link);
    } else {
      showImage(link);
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  const close = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    image.classList.remove('is-hidden');
    image.removeAttribute('src');
    stopVideo();
    activeGallery = null;
  };

  const showRelative = (step) => {
    refreshLinks();
    if (!links.length) return;
    const nextIndex = (currentIndex + step + links.length) % links.length;
    openAt(nextIndex);
  };

  const openFromLink = (link) => {
    activeGallery = getGalleryRoot(link);
    refreshLinks();
    const index = links.indexOf(link);
    if (index >= 0) openAt(index);
  };

  document.querySelectorAll('.portfolio-item a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openFromLink(link);
    });
  });

  const spotlightWatch = document.getElementById('spotlightWatchBtn');
  if (spotlightWatch) {
    spotlightWatch.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector('[data-spotlight-video]');
      if (!target) return;
      openFromLink(target);
    });
  }

  modal.querySelectorAll('[data-lightbox-close], .portfolio-lightbox-close').forEach((el) => {
    el.addEventListener('click', close);
  });

  prevBtn.addEventListener('click', () => showRelative(-1));
  nextBtn.addEventListener('click', () => showRelative(1));

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('active')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') showRelative(-1);
    if (event.key === 'ArrowRight') showRelative(1);
  });
}
