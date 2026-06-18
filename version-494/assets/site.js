(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
    var rail = wrap.querySelector('[data-rail]');
    var prev = wrap.querySelector('[data-rail-prev]');
    var next = wrap.querySelector('[data-rail-next]');

    function move(direction) {
      if (!rail) {
        return;
      }
      var amount = direction === 'left' ? -320 : 320;
      rail.scrollBy({ left: amount, behavior: 'smooth' });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move('left');
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move('right');
      });
    }
  });

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var target = document.querySelector(input.getAttribute('data-filter-input'));
    var empty = document.querySelector('[data-no-result]');
    if (!target) {
      return;
    }
    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));

    function run() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var match = text.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', run);
    run();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var startButton = player.querySelector('.player-start');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || !stream || attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      attached = true;
    }

    function play() {
      attach();
      player.classList.add('is-playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }
  });

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.location.href = url;
    });
  });

  var params = new URLSearchParams(window.location.search);
  var keyword = params.get('q');
  if (keyword) {
    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      input.value = keyword;
      input.dispatchEvent(new Event('input'));
    });
  }
}());
