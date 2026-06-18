(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-menu]");
        var search = document.querySelector(".nav-search");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            if (search) {
                search.classList.toggle("open");
            }
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function bindSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var form = document.querySelector("[data-search-page-form]");
        if (!input || !results || !window.siteCatalog) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render(query) {
            var q = query.trim().toLowerCase();
            var items = window.siteCatalog.filter(function (item) {
                if (!q) {
                    return true;
                }
                return item.searchText.indexOf(q) !== -1;
            }).slice(0, 120);
            if (!items.length) {
                results.innerHTML = '<div class="empty-state">未找到相关影片</div>';
                return;
            }
            results.innerHTML = items.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster" href="' + item.href + '">',
                    '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
                    '<span class="play-chip">播放</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<div class="movie-meta-line"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
                    '<h3><a href="' + item.href + '">' + item.title + '</a></h3>',
                    '<p>' + item.oneLine + '</p>',
                    '<div class="tag-row"><span>' + item.genre + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var q = input.value.trim();
                var next = q ? "?q=" + encodeURIComponent(q) : window.location.pathname;
                window.history.replaceState({}, "", next);
                render(q);
            });
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    function bindNavSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var url = form.getAttribute("data-search-url") || form.getAttribute("action") || "search.html";
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = url;
                }
            });
        });
    }

    function bindPlayer() {
        var video = document.querySelector("[data-player]");
        var button = document.querySelector("[data-play-button]");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var started = false;
        var hlsInstance = null;
        function start() {
            if (!stream) {
                return;
            }
            if (!started) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                started = true;
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
            if (button) {
                button.classList.add("hide");
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("hide");
            }
        });
        video.addEventListener("pause", function () {
            if (button) {
                button.classList.remove("hide");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindNavSearch();
        bindSearchPage();
        bindPlayer();
    });
})();
