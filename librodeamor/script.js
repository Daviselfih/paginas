let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, CustomEase);

const body = select('body');
const introOverlay = select('#introOverlay');
const heartBtn = select('#heartBtn');
const bgSound = select('#bgSound');
const bfs = selectAll('.bf');

let animationsStarted = false;

// Prevent browser restoring previous scroll position
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

/* ---------- Intro ---------- */
body.classList.add('intro-active');
heartBtn.classList.add('idle');

heartBtn.addEventListener('click', startExperience);
heartBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  startExperience();
}, { passive: false });

function startExperience() {
  if (animationsStarted) return;
  animationsStarted = true;

  heartBtn.classList.remove('idle');
  heartBtn.classList.add('clicked');

  // Play sound
  if (bgSound) {
    bgSound.volume = 0.6;
    bgSound.play().catch(() => {
      setTimeout(() => bgSound.play().catch(() => {}), 100);
    });
  }

  // Hide overlay after heart animation
  gsap.delayedCall(0.7, () => {
    introOverlay.classList.add('hidden');
    body.classList.remove('intro-active');

    // Always start at the top (title), never mid-paragraph
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    initAnimations();

    // Lenis may take over scrolling — snap to top once it exists
    requestAnimationFrame(() => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    });
  });
}

/* ---------- Lenis + GSAP ticker ---------- */
let lenis = null;

function setupLenis() {
  lenis = new Lenis({
    smoothWheel: true,
    wheelMultiplier: 0.5,
    syncTouch: false,
    autoRaf: false,
    touchMultiplier: 1,
    lerp: 0.1,
  });

  lenis.on('scroll', () => {
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Ensure we begin at the title
  lenis.scrollTo(0, { immediate: true });
}

/* ---------- Butterfly animations ---------- */
function initAnimations() {
  setupLenis();

  CustomEase.create(
    'curvedFlipFlop',
    'M0,0 C0,0 0.12,-0.5 0.25,-0.5 0.5,-0.5 0.5,0.5 0.75,0.5 0.9,0.5 1,0 1,0'
  );

  // Side-to-side
  function side1() {
    const thisRepeat1 = parseInt(Math.random() * 3 + 3);
    const thisDuration1 = Math.random() * 2 + 2;
    const totalDuration1 = thisDuration1 * (thisRepeat1 + 1);

    gsap.timeline({
      repeat: thisRepeat1,
      defaults: { duration: thisDuration1, ease: 'curvedFlipFlop' },
    }).to(bfs[0], { x: 50 });

    gsap.delayedCall(totalDuration1, side1);
  }
  side1();

  function side2() {
    const thisRepeat2 = parseInt(Math.random() * 3 + 3);
    const thisDuration2 = Math.random() * 2 + 2;
    const totalDuration2 = thisDuration2 * (thisRepeat2 + 1);

    gsap.timeline({
      repeat: thisRepeat2,
      defaults: { duration: thisDuration2, ease: 'curvedFlipFlop' },
    }).to(bfs[1], { x: 50 });

    gsap.delayedCall(totalDuration2, side2);
  }
  side2();

  // Wing flapping
  function flap1() {
    const thisRepeat3 = parseInt(Math.random() * 3 + 3);
    const thisDuration3 = Math.random() * 0.2 + 0.3;
    const totalDuration3 = thisDuration3 * (thisRepeat3 + 1);

    gsap.timeline({
      repeat: thisRepeat3,
      defaults: { duration: thisDuration3, ease: 'power1.inOut' },
    }).fromTo('#bfw1', { '--rotateY': '65deg' }, { '--rotateY': '-65deg' });

    gsap.delayedCall(totalDuration3, flap1);
  }
  flap1();

  function flap2() {
    const thisRepeat4 = parseInt(Math.random() * 3 + 3);
    const thisDuration4 = Math.random() * 0.2 + 0.3;
    const totalDuration4 = thisDuration4 * (thisRepeat4 + 1);

    gsap.timeline({
      repeat: thisRepeat4,
      defaults: { duration: thisDuration4, ease: 'power1.inOut' },
    }).fromTo('#bfw2', { '--rotateY': '65deg' }, { '--rotateY': '-65deg' });

    gsap.delayedCall(totalDuration4, flap2);
  }
  flap2();

  // Automatic up / down floating
  function floatY(target, range, baseDuration) {
    function loop() {
      const dist = (Math.random() * 0.6 + 0.4) * range;
      const dur = baseDuration + Math.random() * 1.5;
      gsap.to(target, {
        y: `+=${dist}`,
        duration: dur,
        ease: 'sine.inOut',
        onComplete: () => {
          gsap.to(target, {
            y: `-=${dist}`,
            duration: dur + Math.random() * 0.8,
            ease: 'sine.inOut',
            onComplete: loop,
          });
        },
      });
    }
    gsap.delayedCall(Math.random() * 1.2, loop);
  }

  floatY('#bfw1', 28, 2.8);
  floatY('#bfw2', 36, 3.2);

  // Scroll-driven motion path
  gsap.to('#butterfly1', {
    motionPath: {
      path: '#spiral1',
      align: '#spiral1',
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 1,
    },
    ease: 'none',
    scrollTrigger: {
      trigger: body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  gsap.to('#butterfly2', {
    motionPath: {
      path: '#spiral2',
      align: '#spiral2',
      alignOrigin: [0.5, 0.5],
      start: 1,
      end: 0,
    },
    ease: 'none',
    scrollTrigger: {
      trigger: body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  ScrollTrigger.refresh();
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}
