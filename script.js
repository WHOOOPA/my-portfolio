// Hampus Holm - Portfolio & Showcase Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Header shadow on scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Highlight active nav link on scroll using IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
  }

  // 4. Architectural Layered Image Galleries (3D Depth, Prev/Next Previews, Zero Page Scroll)
  initLayeredGalleries();

  function initLayeredGalleries() {
    const galleries = document.querySelectorAll('.interactive-gallery');

    galleries.forEach(gallery => {
      const slides = gallery.querySelectorAll('.gallery-slide');
      const thumbs = gallery.querySelectorAll('.gallery-thumb-item');
      const thumbsStrip = gallery.querySelector('.gallery-thumbnails-strip');
      const prevBtn = gallery.querySelector('.gallery-nav-btn.prev');
      const nextBtn = gallery.querySelector('.gallery-nav-btn.next');
      const captionBadge = gallery.querySelector('.caption-badge');
      const captionHeading = gallery.querySelector('.caption-heading');
      const captionSubtext = gallery.querySelector('.caption-subtext');
      const captionCounter = gallery.querySelector('.caption-counter');
      const total = slides.length;
      if (total <= 1) return;

      let currentIndex = 0;
      const intervalDuration = parseInt(gallery.dataset.autoplay, 10) || 7500;
      let timer = null;
      let isPaused = false;

      function formatNum(num) {
        return num < 10 ? '0' + num : '' + num;
      }

      function updateSlide(index) {
        // Cyclical wrapping
        if (index < 0) {
          currentIndex = total - 1;
        } else if (index >= total) {
          currentIndex = 0;
        } else {
          currentIndex = index;
        }

        const prevIndex = (currentIndex - 1 + total) % total;
        const nextIndex = (currentIndex + 1) % total;

        // Apply layered 3D depth classes to all slides
        slides.forEach((slide, idx) => {
          slide.classList.remove('active', 'prev-slide', 'next-slide', 'hidden-left', 'hidden-right');

          if (idx === currentIndex) {
            slide.classList.add('active');
          } else if (idx === prevIndex) {
            slide.classList.add('prev-slide');
          } else if (idx === nextIndex) {
            slide.classList.add('next-slide');
          } else {
            if (idx < currentIndex) {
              slide.classList.add('hidden-left');
            } else {
              slide.classList.add('hidden-right');
            }
          }
        });

        // Update active slide caption bar content
        const activeSlide = slides[currentIndex];
        if (activeSlide) {
          const badge = activeSlide.getAttribute('data-badge') || '';
          const title = activeSlide.getAttribute('data-title') || '';
          const desc = activeSlide.getAttribute('data-desc') || '';

          if (captionBadge) captionBadge.textContent = badge;
          if (captionHeading) captionHeading.textContent = title;
          if (captionSubtext) captionSubtext.textContent = desc;
          if (captionCounter) captionCounter.textContent = `${formatNum(currentIndex + 1)} / ${formatNum(total)}`;
        }

        // Update matching thumbnail and horizontally center inside the strip without touching the page scroll
        thumbs.forEach((thumb, idx) => {
          const isActive = (idx === currentIndex);
          thumb.classList.toggle('active', isActive);

          if (isActive && thumbsStrip) {
            const thumbLeft = thumb.offsetLeft;
            const thumbWidth = thumb.offsetWidth;
            const stripWidth = thumbsStrip.clientWidth;
            thumbsStrip.scrollTo({
              left: thumbLeft - (stripWidth / 2) + (thumbWidth / 2),
              behavior: 'smooth'
            });
          }
        });

        resetAutoplay();
      }

      function nextSlide() {
        updateSlide(currentIndex + 1);
      }

      function prevSlide() {
        updateSlide(currentIndex - 1);
      }

      function startAutoplay() {
        stopAutoplay();
        isPaused = false;
        timer = setInterval(() => {
          if (!isPaused) {
            nextSlide();
          }
        }, intervalDuration);
      }

      function stopAutoplay() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function resetAutoplay() {
        startAutoplay();
      }

      function pauseAutoplay() {
        isPaused = true;
      }

      function resumeAutoplay() {
        isPaused = false;
      }

      // Next / Prev listeners
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          nextSlide();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prevSlide();
        });
      }

      // Clicking directly on visible side slides advances or goes back
      slides.forEach(slide => {
        slide.addEventListener('click', () => {
          if (slide.classList.contains('next-slide')) {
            nextSlide();
          } else if (slide.classList.contains('prev-slide')) {
            prevSlide();
          }
        });
      });

      // Thumbnail click listeners
      thumbs.forEach((thumb, idx) => {
        thumb.addEventListener('click', (e) => {
          e.preventDefault();
          updateSlide(idx);
        });
      });

      // Pause when hovering over the gallery to inspect technical details undisturbed
      gallery.addEventListener('mouseenter', pauseAutoplay);
      gallery.addEventListener('mouseleave', resumeAutoplay);

      // Touch swipe support for mobile
      let touchStartX = 0;
      let touchEndX = 0;
      gallery.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        pauseAutoplay();
      }, { passive: true });

      gallery.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        resumeAutoplay();
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
      }, { passive: true });

      // Initialize slide layout
      updateSlide(0);
    });
  }

  // 5. Interactive Education Cards & Individual Course Accordions
  initEducationCards();
  initCourseAccordions();

  function initEducationCards() {
    const eduCards = document.querySelectorAll('.education-card');
    const metricsStrip = document.querySelector('.hero-metrics-strip');
    if (!eduCards.length) return;

    function setCardState(card, isExpanded, isCompact) {
      card.classList.toggle('is-expanded', isExpanded);
      card.classList.toggle('is-compact', isCompact);
      card.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      const triggerLabel = card.querySelector('.edu-trigger-label');
      if (triggerLabel) {
        if (isExpanded) {
          triggerLabel.textContent = 'Hide Coursework';
        } else if (isCompact) {
          triggerLabel.textContent = 'Expand';
        } else {
          triggerLabel.textContent = 'Relevant Coursework';
        }
      }
    }

    eduCards.forEach(card => {
      const handleToggle = () => {
        const isCurrentlyExpanded = card.classList.contains('is-expanded');

        if (isCurrentlyExpanded) {
          // Collapse active card and restore both cards to neutral balanced 50/50 state
          eduCards.forEach(c => setCardState(c, false, false));
          if (metricsStrip) metricsStrip.classList.remove('has-expanded');
        } else {
          // Expand clicked card across container and compress sibling card to the side
          eduCards.forEach(c => {
            if (c === card) {
              setCardState(c, true, false);
            } else {
              setCardState(c, false, true);
            }
          });
          if (metricsStrip) metricsStrip.classList.add('has-expanded');
        }
      };

      card.addEventListener('click', (e) => {
        // Prevent collapsing parent card when clicking links or anywhere inside the course drawer!
        if (e.target.closest('a') || e.target.closest('.edu-accordion-drawer')) return;
        handleToggle();
      });

      card.addEventListener('keydown', (e) => {
        // Only toggle degree card if keydown was directly focused on the degree card, not on child course items
        if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
          e.preventDefault();
          handleToggle();
        }
      });
    });
  }

  function initCourseAccordions() {
    const courseItems = document.querySelectorAll('.course-accordion-item');
    if (!courseItems.length) return;

    courseItems.forEach(item => {
      const toggle = (e) => {
        if (e) e.stopPropagation();
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        item.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      };

      item.addEventListener('click', (e) => {
        toggle(e);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(e);
        }
      });
    });
  }

  // 6. Copy Email to Clipboard
  const copyBtn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('email-text');
  const toast = document.getElementById('toast');

  if (copyBtn && emailText && toast) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = emailText.innerText.trim();
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Email address copied to clipboard');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Email address copied to clipboard');
      }
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 6. Image Lightbox Viewer
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
  let lastFocusedElement = null;

  function openLightbox(src, captionText, altText) {
    if (!lightbox || !lightboxImg) return;
    lastFocusedElement = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = altText || captionText || 'Enlarged image view';
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || '';
    }
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) {
      setTimeout(() => lightboxClose.focus(), 50);
    }
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.src = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  if (lightbox) {
    if (lightboxClose) {
      lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    // Delegated click listener for all clickable gallery cards
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.clickable-gallery-item');
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        const fullSrc = item.getAttribute('data-full') || item.querySelector('img')?.src;
        const caption = item.getAttribute('data-caption') || item.querySelector('img')?.alt;
        const alt = item.querySelector('img')?.alt || '';
        if (fullSrc) {
          openLightbox(fullSrc, caption, alt);
        }
      }
    });

    // Keyboard support for activating gallery cards (Enter or Space)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = document.activeElement?.closest('.clickable-gallery-item');
        if (item && !lightbox.classList.contains('active')) {
          e.preventDefault();
          e.stopPropagation();
          const fullSrc = item.getAttribute('data-full') || item.querySelector('img')?.src;
          const caption = item.getAttribute('data-caption') || item.querySelector('img')?.alt;
          const alt = item.querySelector('img')?.alt || '';
          if (fullSrc) {
            openLightbox(fullSrc, caption, alt);
          }
        }
      }
    });
  }

  // 7. Dynamic Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
