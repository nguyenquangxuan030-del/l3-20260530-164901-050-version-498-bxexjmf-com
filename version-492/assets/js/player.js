(function () {
  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));

  stages.forEach(function (stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('.video-overlay');
    var stream = stage.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || !stream || prepared) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
      stage.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        prepare();
      });
    }

    stage.addEventListener('click', function (event) {
      if (event.target === stage) {
        prepare();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        stage.classList.add('is-playing');
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
