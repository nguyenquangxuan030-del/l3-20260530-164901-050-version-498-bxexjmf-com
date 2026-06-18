(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });

      panel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          panel.classList.remove("is-open");
        });
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./movies.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-scroll-prev], [data-scroll-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        var wrap = button.closest(".rail-wrap");
        var row = wrap ? wrap.querySelector("[data-scroll-row]") : null;
        if (!row) {
          return;
        }
        var direction = button.hasAttribute("data-scroll-prev") ? -1 : 1;
        row.scrollBy({ left: direction * 340, behavior: "smooth" });
      });
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && input) {
        input.value = query;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category
          ].join(" ").toLowerCase();

          var matched = !keyword || haystack.indexOf(keyword) !== -1;

          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter-select");
            var value = select.value;
            if (value && card.dataset[key] !== value) {
              matched = false;
            }
          });

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var source = player.getAttribute("data-src");
      var attached = false;

      function attach() {
        if (!video || !source || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          player.hlsInstance = hls;
          return;
        }
        video.src = source;
      }

      function startPlayback() {
        attach();
        if (!video) {
          return;
        }
        player.classList.add("is-loading");
        var action = video.play();
        if (action && typeof action.then === "function") {
          action.then(function () {
            player.classList.add("is-playing");
            player.classList.remove("is-loading");
          }).catch(function () {
            player.classList.remove("is-loading");
          });
        } else {
          player.classList.add("is-playing");
          player.classList.remove("is-loading");
        }
      }

      attach();

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });
      }
    });
  });
}());
