(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var navLinks = qs('[data-nav-links]');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    qsa('[data-hero-next]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    });

    qsa('[data-hero-prev]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterInput = qs('[data-filter-input]');
  var filterYear = qs('[data-filter-year]');
  var filterRegion = qs('[data-filter-region]');
  var filterType = qs('[data-filter-type]');
  var filterCards = qsa('[data-filter-card]');
  var emptyMessage = qs('[data-empty-message]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterPageCards() {
    if (!filterCards.length) {
      return;
    }
    var keyword = normalize(filterInput && filterInput.value);
    var year = normalize(filterYear && filterYear.value);
    var region = normalize(filterRegion && filterRegion.value);
    var type = normalize(filterType && filterType.value);
    var visible = 0;

    filterCards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type')
      ].join(' '));
      var matched = true;
      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && normalize(card.getAttribute('data-year')) !== year) {
        matched = false;
      }
      if (region && normalize(card.getAttribute('data-region')) !== region) {
        matched = false;
      }
      if (type && normalize(card.getAttribute('data-type')) !== type) {
        matched = false;
      }
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle('is-visible', visible === 0);
    }
  }

  [filterInput, filterYear, filterRegion, filterType].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterPageCards);
      control.addEventListener('change', filterPageCards);
    }
  });
  filterPageCards();

  var searchRoot = qs('[data-search-root]');
  if (searchRoot && window.SITE_MOVIES) {
    var searchInput = qs('[data-search-input]', searchRoot);
    var searchButton = qs('[data-search-button]', searchRoot);
    var results = qs('[data-search-results]', searchRoot);
    var empty = qs('[data-search-empty]', searchRoot);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function card(movie) {
      return [
        '<a class="search-card" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<div>',
        '<strong>' + escapeHtml(movie.title) + '</strong>',
        '<span>' + escapeHtml(movie.desc) + '</span>',
        '<em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.category) + '</em>',
        '</div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function render() {
      var keyword = normalize(searchInput && searchInput.value);
      var matches = [];
      if (keyword) {
        matches = window.SITE_MOVIES.filter(function (movie) {
          return normalize(movie.title + ' ' + movie.desc + ' ' + movie.tags + ' ' + movie.year + ' ' + movie.region + ' ' + movie.category).indexOf(keyword) !== -1;
        }).slice(0, 120);
      } else {
        matches = window.SITE_MOVIES.slice(0, 40);
      }
      if (results) {
        results.innerHTML = matches.map(card).join('');
      }
      if (empty) {
        empty.classList.toggle('is-visible', matches.length === 0);
      }
    }

    if (searchInput) {
      searchInput.value = initial;
      searchInput.addEventListener('input', render);
      searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          render();
        }
      });
    }
    if (searchButton) {
      searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        render();
      });
    }
    render();
  }
})();
