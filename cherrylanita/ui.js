document.addEventListener('DOMContentLoaded', function () {
  var introBtn = document.getElementById('intro-btn');
  var titleSection = document.getElementById('title-section');
  var introBanner = document.getElementById('intro-banner');
  var outroOverlay = document.getElementById('outro-overlay');
  var loader = document.getElementById('loader');
  var audio1 = document.getElementById('audio-1');
  var lyricsContainer = document.getElementById('lyrics');
  var lyrics1Container = document.getElementById('lyrics-1');

  var AUDIO1_TARGET_VOLUME = 0.7;
  var FADE_IN_DURATION = 500;
  var END_FADE_DURATION = 1300;
  var SWITCH_TO_BOX_TIME = 14; // segundo en el que pasa al recuadro
  var SAFETY_FALLBACK_MS = 120000;

  function easeInExpo(t) {
    return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1));
  }

  function fadeVolume(audio, targetVolume, duration, onComplete) {
    if (!audio) { if (onComplete) onComplete(); return; }
    var startVolume = audio.volume;
    var startTime = null;
    var rising = targetVolume > startVolume;

    function step(now) {
      if (startTime === null) startTime = now;
      var rawProgress = Math.min((now - startTime) / duration, 1);
      var eased = rising ? easeInExpo(rawProgress) : 1 - easeInExpo(1 - rawProgress);
      audio.volume = startVolume + (targetVolume - startVolume) * eased;
      if (rawProgress < 1) {
        requestAnimationFrame(step);
      } else {
        audio.volume = targetVolume;
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(step);
  }

  function attachEndFade(audio, fadeMs) {
    if (!audio) return;
    var fading = false;
    audio.addEventListener('play', function () {
      fading = false;
    });
    audio.addEventListener('timeupdate', function () {
      if (fading || !isFinite(audio.duration)) return;
      var remainingMs = (audio.duration - audio.currentTime) * 1000;
      if (remainingMs <= fadeMs) {
        fading = true;
        fadeVolume(audio, 0, Math.max(remainingMs, 300));
      }
    });
  }

  attachEndFade(audio1, END_FADE_DURATION);

  window.addEventListener('load', function () {
    loader.classList.add('hide');
    setTimeout(function () {
      loader.style.display = 'none';
    }, 600);
  });

  var lyrics1 = [
    { time: 0,    text: 'i fall' },
    { time: 1,    text: 'to peaces' },
    { time: 4.9,  text: 'bitch' },
    { time: 6,    text: 'i' },
    { time: 6.4,  text: 'fall' },
    { time: 6.9,  text: 'to peaces' },
    { time: 9.7,  text: 'when' },
    { time: 10.3, text: 'im' },
    { time: 10.8, text: 'with you.....' }
  ];

  var lyrics = [
    { time: 14,   text: 'WHI????' },
    { time: 14.9, text: 'CAUSE I' },
    { time: 16,   text: 'LOVE YOU' },
    { time: 17,   text: 'SO' },
    { time: 18,   text: 'MUUUCCH' },
    { time: 19.1, text: 'I FALL' },
    { time: 21,   text: 'TO PEACEEEEEES' },
    { time: 25.3, text: 'my cherries and wine' },
    { time: 28.9, text: 'rosemary and thyme' },
    { time: 32.4, text: 'and all of my peaches' },
    { time: 37,   text: 'are ruined' },
    { time: 37.5, text: '(bitch)' }
  ];

  var TYPEWRITER_SPEED = 32;       // ms por caracter (banner - primer recuadro)
  var TYPEWRITER_SPEED_BOX = 70;   // ms por caracter (recuadro principal, un poco más lento)

  function typeLine(container, text, speed) {
    if (!container) return;
    if (container._typeTimer) {
      clearInterval(container._typeTimer);
      container._typeTimer = null;
    }
    container.textContent = '';
    container.classList.remove('done');
    var i = 0;
    container._typeTimer = setInterval(function () {
      container.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(container._typeTimer);
        container._typeTimer = null;
        container.classList.add('done');
      }
    }, speed || TYPEWRITER_SPEED);
  }

  var currentLineIndex1 = -1;
  var currentLineIndex = -1;

  if (audio1) {
    audio1.addEventListener('timeupdate', function () {
      var t = audio1.currentTime;

      if (lyrics1Container) {
        var newIndex1 = -1;
        for (var i = 0; i < lyrics1.length; i++) {
          if (t >= lyrics1[i].time) newIndex1 = i;
        }
        if (newIndex1 !== currentLineIndex1 && newIndex1 >= 0) {
          currentLineIndex1 = newIndex1;
          typeLine(lyrics1Container, lyrics1[newIndex1].text);
        }
      }

      if (lyricsContainer) {
        var newIndex = -1;
        for (var j = 0; j < lyrics.length; j++) {
          if (t >= lyrics[j].time) newIndex = j;
        }
        if (newIndex !== currentLineIndex && newIndex >= 0) {
          currentLineIndex = newIndex;
          typeLine(lyricsContainer, lyrics[newIndex].text, TYPEWRITER_SPEED_BOX);
        }
      }

      if (!transitioned && t >= SWITCH_TO_BOX_TIME) {
        goToNextSection();
      }
    });
  }

  var HEART_BURST_DURATION = 900;
  var activated = false;
  var transitioned = false;

  function burstHeart() {
    introBtn.classList.remove('playing');
    void introBtn.offsetWidth;
    introBtn.classList.add('playing');
  }

  introBtn.addEventListener('animationend', function (e) {
    if (e.animationName === 'fade-in-slow') {
      introBtn.classList.add('playing');
    }
  });

  function goToNextSection() {
    if (transitioned) return;
    transitioned = true;

    introBtn.classList.remove('pulsing');
    introBtn.classList.add('hide');
    introBtn.style.display = 'none';

    if (introBanner) {
      introBanner.classList.remove('show');
      introBanner.classList.add('hide');
      introBanner.style.display = 'none';
    }

    titleSection.classList.add('show');
  }

  function showOutroOverlay() {
    if (!outroOverlay) return;
    outroOverlay.style.display = '';
    void outroOverlay.offsetWidth;
    outroOverlay.classList.add('show');
  }

  function handleIntroActivate() {
    if (activated) return;
    activated = true;

    burstHeart();

    // Muestra el banner debajo de la cereza
    if (introBanner) {
      introBanner.classList.remove('hide');
      introBanner.style.display = '';
      // forzar reflow y luego mostrar
      void introBanner.offsetWidth;
      introBanner.classList.add('show');
      if (lyrics1Container && lyrics1.length) {
        typeLine(lyrics1Container, lyrics1[0].text);
        currentLineIndex1 = 0;
      }
    }

    if (audio1) {
      audio1.volume = 0;
      audio1.currentTime = 0;
      var play1 = audio1.play();
      if (play1 !== undefined) {
        play1
          .then(function () {
            fadeVolume(audio1, AUDIO1_TARGET_VOLUME, FADE_IN_DURATION);
          })
          .catch(function (err) {
            console.warn('No se pudo reproducir sound1:', err);
          });
      }
      audio1.addEventListener('ended', showOutroOverlay);
    }

    setTimeout(function () {
      introBtn.classList.add('pulsing');
    }, HEART_BURST_DURATION);

    setTimeout(goToNextSection, SAFETY_FALLBACK_MS);
  }

  introBtn.addEventListener('click', handleIntroActivate);
  introBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleIntroActivate();
    }
  });
});
