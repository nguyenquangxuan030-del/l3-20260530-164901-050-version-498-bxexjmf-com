(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        input.value = input.value.trim();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    restart();
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var filterScopes = document.querySelectorAll('[data-filter-scope]');
  filterScopes.forEach(function (scope) {
    var textInput = scope.querySelector('[data-card-filter]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var categorySelect = scope.querySelector('[data-category-filter]');
    var container = scope.nextElementSibling || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card[data-search]'));

    if (textInput && queryFromUrl) {
      textInput.value = queryFromUrl;
    }

    function applyFilters() {
      var text = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      cards.forEach(function (card) {
        var okText = !text || card.dataset.search.indexOf(text) !== -1;
        var okYear = !year || card.dataset.year === year;
        var okType = !type || card.dataset.type === type;
        var okCategory = !category || card.dataset.category === category;
        card.classList.toggle('is-hidden', !(okText && okYear && okType && okCategory));
      });
    }

    [textInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  });

  document.querySelectorAll('[data-player]').forEach(function (wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('.player-start');
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (!video || attached) {
        return;
      }
      attached = true;
      var src = video.dataset.src;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      wrapper.classList.add('is-playing');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          wrapper.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        wrapper.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          wrapper.classList.remove('is-playing');
        }
      });
      video.addEventListener('error', function () {
        wrapper.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
