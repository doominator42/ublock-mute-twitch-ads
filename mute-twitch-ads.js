/// mute-twitch-ads.js
(function () {
  //const log = console.log.bind(console);
  const log = () => { };
  const AD_BREAK_REGEX = /[\s;,.-](?:ad break|pause publicitaire|publicité|reklamepause|Werbung|pausa publicitaria|corte comercial|pubblicità|reklámszünet|reclame|reklamen|przerwie na reklamę|pausa para anúncios|anúncio comercial|pauză publicitară|reklamnej pauze|mainoskatkon|reklampausen|sau QC này|reklam aras[\u0131i]ndan|reklamní přestávce)[\s;,.!-]/i;
  log('mute-twitch-ads', this);
  if (window.location.href === 'about:blank') {
    return;
  }
  let observedVideo = undefined;
  let wasAdBreak = false;
  let savedVolume = {
    volume: 0,
    muted: true,
  };
  const observer = new MutationObserver((mutations) => {
    if (!observedVideo) {
      return;
    }
    for (let mutation of mutations) {
      if (mutation.type === 'childList' && mutation.target === observedVideo.parentElement &&
        mutation.removedNodes && mutation.removedNodes.find(n => n === observedVideo)
      ) {
        videoRemoved();
      }
    }
    if (observedVideo && observedVideo.nextElementSibling) {
      let isAdBreak = AD_BREAK_REGEX.test(observedVideo.nextElementSibling.innerText);
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
    let video = document.body && document.body.querySelector('video[src^="blob:https://www.twitch.tv/"]');
    if (!video) {
      setTimeout(findVideo, 1000);
      return;
    }
    log('found', video);
    observedVideo = video;
    observer.observe(video.parentElement, {
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
  findVideo();
  setInterval(() => {
    if (observedVideo && document.body && !document.body.contains(observedVideo)) {
      videoRemoved();
    }
  }, 500);
})();
