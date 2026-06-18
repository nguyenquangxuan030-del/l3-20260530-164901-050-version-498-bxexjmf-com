(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-item'));
    var empty = scope.querySelector('[data-empty-state]');
    var activeValue = '全部';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var categoryMatch = activeValue === '全部' || activeValue === category || text.indexOf(activeValue.toLowerCase()) !== -1;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var matched = categoryMatch && keywordMatch;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.getAttribute('data-filter-value') || '全部';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });
})();
