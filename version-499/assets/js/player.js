(function () {
  var shell = document.querySelector('.player-shell');
  var video = document.querySelector('.player-shell video');
  var button = document.querySelector('.play-layer .btn');
  var status = document.querySelector('.play-status');
  if (!shell || !video || !button) {
    return;
  }
  var stream = button.getAttribute('data-stream');
  var started = false;
  var hlsInstance = null;

  var setStatus = function (text) {
    if (status) {
      status.textContent = text;
    }
  };

  var attachStream = function () {
    if (started) {
      return;
    }
    started = true;
    shell.classList.add('is-playing');
    setStatus('正在加载视频');
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().then(function () {
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击视频继续播放');
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('视频加载失败，请稍后重试');
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          started = false;
          shell.classList.remove('is-playing');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', function () {
        video.play().then(function () {
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击视频继续播放');
        });
      }, { once: true });
    } else {
      video.src = stream;
      video.play().catch(function () {
        setStatus('当前设备暂时无法播放该视频');
      });
    }
  };

  button.addEventListener('click', attachStream);
  video.addEventListener('click', function () {
    if (!started) {
      attachStream();
    }
  });
})();
