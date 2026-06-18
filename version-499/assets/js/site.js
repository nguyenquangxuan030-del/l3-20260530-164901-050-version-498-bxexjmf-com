(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  var input = document.querySelector('.local-filter-input');
  var typeSelect = document.querySelector('.local-filter-type');
  var yearSelect = document.querySelector('.local-filter-year');
  var empty = document.querySelector('.empty-state');
  var applyLocalFilter = function () {
    if (!cards.length) {
      return;
    }
    var query = input ? input.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var ok = true;
      if (query && text.indexOf(query) === -1) {
        ok = false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        ok = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };
  [input, typeSelect, yearSelect].forEach(function (el) {
    if (el) {
      el.addEventListener('input', applyLocalFilter);
      el.addEventListener('change', applyLocalFilter);
    }
  });

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.global-search'));
  var movies = window.MOVIE_INDEX || [];
  var rootPath = document.body.getAttribute('data-root') || './';
  var joinPath = function (root, path) {
    return root + String(path || '').replace(/^\.\//, '');
  };
  var safeText = function (value) {
    return String(value || '').replace(/[&<>"]/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  };
  searchInputs.forEach(function (box) {
    var results = box.parentElement.querySelector('.search-results');
    if (!results) {
      return;
    }
    box.addEventListener('input', function () {
      var q = box.value.trim().toLowerCase();
      if (!q) {
        results.classList.remove('is-open');
        results.innerHTML = '';
        return;
      }
      var hits = movies.filter(function (item) {
        return [item.title, item.region, item.type, item.tags].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 10);
      results.innerHTML = hits.map(function (item) {
        var title = safeText(item.title);
        var region = safeText(item.region);
        var type = safeText(item.type);
        return '<a class="search-result-item" href="' + joinPath(rootPath, item.href) + '">' +
          '<img src="' + joinPath(rootPath, item.poster) + '" alt="' + title + '">' +
          '<span><strong>' + title + '</strong><br><small>' + item.year + ' · ' + region + ' · ' + type + '</small></span>' +
          '</a>';
      }).join('');
      results.classList.toggle('is-open', hits.length > 0);
    });
  });
})();
