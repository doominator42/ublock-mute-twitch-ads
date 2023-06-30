/// mute-twitch-ads.js
(function () {
  if (window.location.href === 'about:blank') {
    return;
  }
  const log = () => { }; // console.log.bind(console);
  log('mute-twitch-ads');
  let observedVideo = undefined;
  let wasAdBreak = false;
  let wasMuted = false;
  let adjustingVolume = false;
  const observer = new MutationObserver((mutations) => {
    if (!observedVideo) {
      return;
    }
    for (let mutation of mutations) {
      if (mutation.type === 'childList' && mutation.target === observedVideo.parentElement &&
        mutation.removedNodes && mutation.removedNodes.find(n => n === observedVideo)
      ) {
        log('video removed');
        observer.disconnect();
        observedVideo = undefined;
        wasAdBreak = false;
        findVideo();
      }
    }
    if (observedVideo && observedVideo.nextElementSibling) {
      let isAdBreak = /\bad break\b/i.test(observedVideo.nextElementSibling.innerText);
      if (isAdBreak !== wasAdBreak) {
        log(isAdBreak ? 'ad started' : 'ad ended');
        wasAdBreak = isAdBreak;
        observedVideo.style.display = isAdBreak ? 'none' : 'block';
        if (isAdBreak) {
          wasMuted = observedVideo.muted;
          let miniVideo = findMiniVideo(observedVideo);
          if (miniVideo && !wasMuted) {
            log('unmuting mini video');
            miniVideo.volume = observedVideo.volume;
            miniVideo.muted = false;
          }
          if (!wasMuted) {
            log('muting ad');
            observedVideo.muted = true;
          }
        } else if (!wasMuted) {
          log('unmuting ad');
          observedVideo.muted = false;
          let miniVideo = findMiniVideo(observedVideo);
          if (miniVideo) {
            log('muting mini video');
            miniVideo.muted = true;
          }
        }
      }
    }
  });
  function findVideo() {
    log('finding video');
    let video = document.body && document.body.querySelector('video[src^="blob:https://www.twitch.tv/"]');
    if (!video) {
      setTimeout(findVideo, 1000);
      return;
    }
    log('found', video);
    observedVideo = video;
    observedVideo.addEventListener('volumechange', () => {
      if (!(observedVideo && wasAdBreak) || adjustingVolume) {
        return;
      }
      let miniVideo = findMiniVideo(observedVideo);
      if (miniVideo) {
        log('adjusting mini video volume to ' + observedVideo.volume);
        wasMuted = observedVideo.volume === 0;
        adjustingVolume = true;
        try {
          miniVideo.volume = observedVideo.volume;
          miniVideo.muted = false;
          observedVideo.muted = true;
        } finally {
          setTimeout(() => {
            adjustingVolume = false;
          }, 10);
        }
      }
    });
    observer.observe(video.parentElement, {
      attributes: false,
      characterData: false,
      childList: true,
      subtree: false,
    });
    observer.observe(video.nextElementSibling, {
      attributes: false,
      characterData: true,
      childList: true,
      subtree: true,
    });
  }
  function findMiniVideo(video) {
    let doc = video && video.ownerDocument;
    if (doc && doc.body) {
      for (let miniVideo of doc.body.querySelectorAll('video')) {
        if (miniVideo !== video) {
          return miniVideo;
        }
      }
    }
    return undefined;
  }
  findVideo();
})();
