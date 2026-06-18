(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    window.initMoviePlayer = function (streamUrl) {
        ready(function () {
            var video = document.querySelector("[data-player-video]");
            var layer = document.querySelector("[data-player-layer]");
            var button = document.querySelector("[data-player-button]");
            var attached = false;
            var hls = null;

            if (!video || !streamUrl) {
                return;
            }

            function attachStream() {
                if (attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    return;
                }

                video.src = streamUrl;
            }

            function playVideo() {
                attachStream();
                video.controls = true;

                if (layer) {
                    layer.classList.add("is-hidden");
                }

                var playPromise = video.play();

                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }

            function pauseVideo() {
                if (!video.paused) {
                    video.pause();
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playVideo();
                });
            }

            if (layer) {
                layer.addEventListener("click", function (event) {
                    event.preventDefault();
                    playVideo();
                });
            }

            video.addEventListener("click", function () {
                if (!attached || video.paused) {
                    playVideo();
                    return;
                }
                pauseVideo();
            });

            video.addEventListener("play", function () {
                if (layer) {
                    layer.classList.add("is-hidden");
                }
            });

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
