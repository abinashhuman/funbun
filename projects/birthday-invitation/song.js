// Our little speaker controls the full song, and Kitty follows the music.
(() => {
  const song = document.querySelector('[data-party-song]');
  const iframe = song.querySelector('.song-player');
  const speaker = song.querySelector('[data-song-speaker]');
  const label = song.querySelector('[data-song-button-label]');
  const status = song.querySelector('[data-song-status]');
  let player;
  let ready = false;

  function showPlaying(playing) {
    song.classList.toggle('is-playing', playing);
    speaker.setAttribute('aria-pressed', String(playing));
    speaker.setAttribute('aria-label', playing ? 'Pause the full meow song' : 'Play the full meow song');
    label.textContent = playing ? 'Pause song' : 'Play song';
  }
  function useSongLink() {
    ready = false;
    showPlaying(false);
    speaker.disabled = true;
    label.textContent = 'Use Open song';
    status.textContent = 'Tap Open song to listen to the full recording in a new tab.';
  }

  // Tell YouTube which website is using its player. Never start music on arrival.
  const source = new URL(iframe.src);
  if (location.origin !== 'null') source.searchParams.set('origin', location.origin);
  iframe.src = source.href;
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player(iframe.id, {
      events: {
        onReady: () => {
          ready = true;
          speaker.disabled = false;
          showPlaying(false);
        },
        onStateChange: event => {
          const playing = event.data === YT.PlayerState.PLAYING;
          showPlaying(playing);
          if (playing) status.textContent = 'Kitty is dancing! Tap the speaker to pause the song.';
          else if (event.data === YT.PlayerState.PAUSED) status.textContent = 'Dance break! Tap the speaker to keep singing.';
          else if (event.data === YT.PlayerState.ENDED) status.textContent = 'Meow! Tap the speaker to sing the full song again.';
          else if (event.data === YT.PlayerState.BUFFERING) status.textContent = 'Getting the song ready…';
        },
        onError: useSongLink,
        onAutoplayBlocked: () => {
          showPlaying(false);
          status.textContent = 'Tap ▶ inside the song player to start the music. Kitty will dance along!';
        }
      }
    });
  };
  speaker.addEventListener('click', () => {
    if (!ready) return;
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) player.pauseVideo();
    else player.playVideo();
  });

  // Load the same song service's small control API; the full player stays visible.
  if (window.YT && window.YT.Player) window.onYouTubeIframeAPIReady();
  else {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = useSongLink;
    document.head.appendChild(script);
  }
})();
