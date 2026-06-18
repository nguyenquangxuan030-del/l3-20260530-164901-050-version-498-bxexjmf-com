(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to") || 0));
        restart();
      });
    });

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".header-search, .mobile-search"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        window.location.href = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function setupFilters() {
    var grid = document.querySelector(".filter-grid");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var input = document.querySelector(".filter-input");
    var year = document.querySelector(".filter-year");
    var type = document.querySelector(".filter-type");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear.indexOf(selectedYear) === -1) {
          matched = false;
        }
        if (selectedType && cardType !== selectedType) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [input, year, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });
    apply();
  }

  window.initPlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }

    var hlsInstance = null;
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
        return;
      }
      video.src = streamUrl;
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    attach();

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMobileNav();
    setupHeaderSearch();
    setupHero();
    setupFilters();
  });
})();
