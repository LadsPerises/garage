/**
 * Garage Forge 3D — Interatividade e Comportamento Principal
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. Elementos Principais
  // ---------------------------------------------------------------------------
  const header = document.querySelector('header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const carousel = document.querySelector('.application-grid');
  const cards = carousel ? [...carousel.querySelectorAll('.application')] : [];
  const progress = document.querySelector('.app-progress-bar, .app-progress span');
  const quoteForm = document.querySelector('#quote-form');
  const btnPrev = document.querySelector('.app-prev');
  const btnNext = document.querySelector('.app-next');

  const heroBg = document.querySelector('.hero-bg');
  const heroSection = document.querySelector('.hero');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = motionPreference.matches;
  const heroVideo = document.querySelector('.hero-bg-video');

  if (heroVideo) {
    const syncHeroVideo = () => {
      if (motionPreference.matches) {
        heroVideo.pause();
        heroVideo.classList.remove('is-playing');
      } else {
        heroVideo.play().catch(() => heroVideo.classList.remove('is-playing'));
      }
    };
    heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'));
    heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-playing'));
    motionPreference.addEventListener('change', syncHeroVideo);
    syncHeroVideo();
  }


  // ---------------------------------------------------------------------------
  // 2. Lenis Smooth Scroll e Parallax Sincronizado
  // ---------------------------------------------------------------------------
  let lenis = null;

  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sincronização direta de scroll com o Lenis
    lenis.on('scroll', ({ scroll }) => {
      // Cabeçalho fixo
      if (header) {
        header.classList.toggle('scrolled', scroll > 16);
      }

      // Parallax suave no Hero
      if (heroBg && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        if (scroll <= heroHeight + 60) {
          const parallaxOffset = scroll * 0.38;
          heroBg.style.transform = `translate3d(0, ${parallaxOffset.toFixed(1)}px, 0)`;
        }
      }
    });

    // Suavizar cliques em âncoras (menu e botões)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -70 });
          }
        }
      });
    });
  } else {
    // Fallback nativo se reduzido movimento ou Lenis indisponível
    function onScrollNative() {
      const scrollY = window.scrollY;
      if (header) {
        header.classList.toggle('scrolled', scrollY > 16);
      }
      if (heroBg && heroSection && !prefersReducedMotion) {
        const heroHeight = heroSection.offsetHeight;
        if (scrollY <= heroHeight + 50) {
          const parallaxOffset = scrollY * 0.38;
          heroBg.style.transform = `translate3d(0, ${parallaxOffset.toFixed(1)}px, 0)`;
        }
      }
    }
    window.addEventListener('scroll', onScrollNative, { passive: true });
    onScrollNative();
  }

  // ---------------------------------------------------------------------------
  // 3. Menu Lateral (Drawer) e Interatividade
  // ---------------------------------------------------------------------------
  const backdrop = document.getElementById('nav-backdrop');
  const closeButton = document.querySelector('.nav-close-btn');

  function openMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Fechar menu');
    nav.classList.add('open');
    if (backdrop) {
      backdrop.classList.add('active');
      backdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('open');
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    // Fechar ao clicar num link
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Fechar ao pressionar a tecla Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Carrossel de Aplicações
  // ---------------------------------------------------------------------------
  if (carousel && cards.length > 0) {
    function getActiveCardIndex() {
      const start = carousel.getBoundingClientRect().left;
      return cards.reduce((bestIndex, card, currentIndex) => {
        const currentDiff = Math.abs(card.getBoundingClientRect().left - start);
        const bestDiff = Math.abs(cards[bestIndex].getBoundingClientRect().left - start);
        return currentDiff < bestDiff ? currentIndex : bestIndex;
      }, 0);
    }

    function updateProgress() {
      const activeIndex = getActiveCardIndex();

      if (progress) {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (maxScroll > 0) {
          const scrollRatio = Math.max(0, Math.min(1, carousel.scrollLeft / maxScroll));
          progress.style.transform = `translateX(${scrollRatio * 200}%)`;
        } else {
          progress.style.transform = `translateX(${activeIndex * 100}%)`;
        }
      }

      if (btnPrev) {
        btnPrev.style.opacity = activeIndex === 0 ? '0.45' : '1';
        btnPrev.style.pointerEvents = activeIndex === 0 ? 'none' : 'auto';
      }
      if (btnNext) {
        btnNext.style.opacity = activeIndex === cards.length - 1 ? '0.45' : '1';
        btnNext.style.pointerEvents = activeIndex === cards.length - 1 ? 'none' : 'auto';
      }
    }

    function scrollToIndex(index) {
      const targetIndex = Math.max(0, Math.min(cards.length - 1, index));
      cards[targetIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        scrollToIndex(getActiveCardIndex() - 1);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        scrollToIndex(getActiveCardIndex() + 1);
      });
    }

    carousel.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ---------------------------------------------------------------------------
  // 5. Apresentação automática das etapas de trabalho
  // ---------------------------------------------------------------------------
  const processSection = document.querySelector('#processo');
  const processImage = document.querySelector('#process-stage-image');
  const processIndex = document.querySelector('.process-visual-index');
  const processLabel = document.querySelector('.process-visual-label');
  const processToggle = document.querySelector('#process-autoplay-toggle');
  const processSteps = processSection ? [...processSection.querySelectorAll('.process-list article')] : [];

  if (processSection && processImage && processSteps.length) {
    const processStages = [
      {
        src: 'images/etapas/Gemini_Generated_Image_ltt7h5ltt7h5ltt7.jpeg',
        alt: 'Uma pessoa fotografa uma peça automóvel partida com o telemóvel para mostrar o problema.',
        title: 'Mostra-nos a peça'
      },
      {
        src: 'images/etapas/Gemini_Generated_Image_roz3cproz3cproz3.jpeg',
        alt: 'Técnico desenha em CAD o modelo 3D de um suporte personalizado no computador.',
        title: 'Criamos o modelo'
      },
      {
        src: 'images/etapas/Gemini_Generated_Image_26y8lz26y8lz26y8.jpeg',
        alt: 'Peça acabada de imprimir em 3D a ser retirada e inspecionada na impressora.',
        title: 'Fabricamos'
      },
      {
        src: 'images/etapas/Gemini_Generated_Image_epikebepikebepik.jpeg',
        alt: 'Técnico testa o encaixe de um suporte personalizado no tablier de um veículo.',
        title: 'Testamos o encaixe'
      }
    ];

    const processInterval = 6800;
    let activeProcessStep = 0;
    let processTimer = null;
    let processVisible = false;
    let processPaused = prefersReducedMotion;
    let processSwapId = 0;

    const updateProcessControl = () => {
      if (!processToggle) return;
      const label = processPaused
        ? 'Reproduzir a apresentação automática'
        : 'Pausar a apresentação automática';
      processToggle.classList.toggle('is-paused', processPaused);
      processToggle.setAttribute('aria-label', label);
      processToggle.setAttribute('aria-pressed', String(!processPaused));
      processToggle.title = label;
    };

    const stopProcessTimer = () => {
      window.clearInterval(processTimer);
      processTimer = null;
    };

    const syncProcessTimer = () => {
      stopProcessTimer();
      if (!processPaused && processVisible && !document.hidden) {
        processTimer = window.setInterval(() => {
          showProcessStep((activeProcessStep + 1) % processStages.length);
        }, processInterval);
      }
    };

    const showProcessStep = (index) => {
      const targetIndex = (index + processStages.length) % processStages.length;
      const stage = processStages[targetIndex];
      const swapId = ++processSwapId;
      activeProcessStep = targetIndex;

      const applyStage = () => {
        if (swapId !== processSwapId) return;
        processImage.classList.add('is-changing');
        window.setTimeout(() => {
          if (swapId !== processSwapId) return;
          processImage.src = stage.src;
          processImage.alt = stage.alt;
          if (processIndex) processIndex.textContent = String(targetIndex + 1).padStart(2, '0');
          if (processLabel) processLabel.textContent = stage.title;

          processSteps.forEach((step, stepIndex) => {
            const isActive = stepIndex === targetIndex;
            step.classList.toggle('is-active', isActive);
            step.setAttribute('aria-current', isActive ? 'step' : 'false');
          });

          requestAnimationFrame(() => processImage.classList.remove('is-changing'));
        }, motionPreference.matches ? 0 : 180);
      };

      if (processImage.getAttribute('src') === stage.src) {
        processSteps.forEach((step, stepIndex) => {
          const isActive = stepIndex === targetIndex;
          step.classList.toggle('is-active', isActive);
          step.setAttribute('aria-current', isActive ? 'step' : 'false');
        });
        return;
      }

      const preload = new Image();
      preload.addEventListener('load', applyStage, { once: true });
      preload.addEventListener('error', applyStage, { once: true });
      preload.src = stage.src;
    };

    processSteps.forEach((step, index) => {
      const selectStep = () => {
        showProcessStep(index);
        syncProcessTimer();
      };

      step.addEventListener('click', selectStep);
      step.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectStep();
      });
    });

    if (processToggle) {
      processToggle.addEventListener('click', () => {
        processPaused = !processPaused;
        updateProcessControl();
        syncProcessTimer();
      });
    }

    document.addEventListener('visibilitychange', syncProcessTimer);
    updateProcessControl();

    if ('IntersectionObserver' in window) {
      const processObserver = new IntersectionObserver((entries) => {
        processVisible = entries.some((entry) => entry.isIntersecting);
        syncProcessTimer();
      }, { threshold: 0.12 });
      processObserver.observe(processSection);
    } else {
      processVisible = true;
      syncProcessTimer();
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Envio de Orçamento para o WhatsApp
  // ---------------------------------------------------------------------------
  if (quoteForm) {
    quoteForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const message = [
        `Olá, sou ${formData.get('nome')}.`,
        `Telefone: ${formData.get('telefone')}`,
        `Tipo de peça: ${formData.get('tipo')}`,
        '',
        `O que preciso: ${formData.get('mensagem')}`
      ].join('\n');

      const whatsappUrl = `https://wa.me/244950474743?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Animações de Revelação Suave (IntersectionObserver)
  // ---------------------------------------------------------------------------
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealTargets = document.querySelectorAll(
      '.about-copy, .about-visual, .process-intro, .process-list article, .portfolio-heading, .project, .application-heading, .contact-intro, .contact-form'
    );

    revealTargets.forEach((target, index) => {
      target.classList.add('reveal');
      const stepIndex = target.matches('.process-list article')
        ? [...target.parentElement.children].indexOf(target)
        : index % 3;
      target.style.setProperty('--reveal-delay', `${stepIndex * 85}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((target) => observer.observe(target));
    document.documentElement.classList.add('motion-ready');
  }
});
