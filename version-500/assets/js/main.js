(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var mainNav = document.querySelector("[data-main-nav]");

        if (navToggle && mainNav) {
            navToggle.addEventListener("click", function () {
                mainNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
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

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var scope = document.querySelector("[data-filter-scope]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));

        if (filterInput && scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));

            function filterCards(value) {
                var query = String(value || "").trim().toLowerCase();

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
                });
            }

            filterInput.addEventListener("input", function () {
                filterCards(filterInput.value);
                chips.forEach(function (chip) {
                    chip.classList.toggle("is-active", chip.getAttribute("data-filter-chip") === filterInput.value);
                });
            });

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    filterInput.value = chip.getAttribute("data-filter-chip") || "";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    filterCards(filterInput.value);
                });
            });

            if (filterInput.hasAttribute("data-query-reader")) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q") || "";

                if (query) {
                    filterInput.value = query;
                    filterCards(query);
                }
            }
        }
    });
})();
