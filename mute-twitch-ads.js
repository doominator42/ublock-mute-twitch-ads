/// mute-twitch-ads.js
(function () {
  //const log = console.log.bind(console);
  const log = () => { };
  log('mute-twitch-ads', this);
  if (window.location.href === 'about:blank') {
    return;
  }
  let observedVideo = undefined;
  let observedContainer = undefined;
  let wasAdBreak = false;
  let savedVolume = {
    volume: 0,
    muted: true,
  };
  const observer = new MutationObserver((mutations) => {
    if (!observedVideo) {
      return;
    }
    if (observedVideo && observedContainer) {
      let isAdBreak = !!observedContainer.querySelector('[aria-label="Ad"]');
      if (isAdBreak !== wasAdBreak) {
        log(isAdBreak ? 'ad started' : 'ad ended');
        wasAdBreak = isAdBreak;
        if (isAdBreak) {
          observedVideo.style.opacity = 0;
          copyVolume(observedVideo, savedVolume);
          const startTime = performance.now();
          const setupMiniVideo = () => {
            log('finding mini video');
            let miniVideo = findMiniVideo(observedVideo);
            if (!miniVideo || !isPlaying(miniVideo)) {
              if (wasAdBreak && performance.now() - startTime < 10000) {
                setTimeout(setupMiniVideo, 200);
              }
              return;
            }
            log('found mini video');
            miniVideo.controls = true;
            copyVolume(savedVolume, miniVideo);
          };
          setTimeout(setupMiniVideo, 200);
          if (!observedVideo.muted) {
            log('muting ad');
            observedVideo.muted = true;
          }
        } else {
          observedVideo.style.removeProperty('opacity');
          let miniVideo = findMiniVideo(observedVideo);
          log('unmuting ad');
          if (miniVideo) {
            log('muting mini video');
            copyVolume(miniVideo, observedVideo);
            miniVideo.muted = true;
          } else {
            copyVolume(savedVolume, observedVideo);
          }
        }
      }
    }
  });
  function findVideo() {
    log('finding video');
    let video = document.body && document.body.querySelector('video[src^="blob:https://www.twitch.tv/"], video[src^="blob:https://m.twitch.tv/"]');
    if (!video) {
      setTimeout(findVideo, 1000);
      return;
    }
    let container = getVideoContainer(video);
    log('found', video, container);
    observedVideo = video;
    observedContainer = container;
    observer.observe(container, {
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
  function videoRemoved() {
    log('video removed');
    observer.disconnect();
    observedVideo = undefined;
    observedContainer = undefined;
    wasAdBreak = false;
    findVideo();
  }
  function isPlaying(video) {
    return !!(video.currentSrc && video.currentTime > 0 && !video.paused && !video.ended);
  }
  function copyVolume(from, to) {
    to.volume = from.volume;
    to.muted = from.muted;
  }
  function getVideoContainer(video) {
    let container = video;
    let videoRect = video.getBoundingClientRect();
    while (rectDiff(videoRect, container.parentElement.getBoundingClientRect()) <= 8) {
      container = container.parentElement;
    }
    return container;
  }
  function rectDiff(rect1, rect2) {
    return Math.abs(rect1.x - rect2.x) +
      Math.abs(rect1.y - rect2.y) +
      Math.abs(rect1.width - rect2.width) +
      Math.abs(rect1.height - rect2.height);
  }
  findVideo();
  setInterval(() => {
    if (observedVideo && document.body && !document.body.contains(observedVideo)) {
      videoRemoved();
    }
  }, 500);
})();
