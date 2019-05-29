import videojs from 'video.js';
//import cntvPlayer from '@cntv/player';

const Component = videojs.getComponent('Component');
const Tech = videojs.getComponent('Tech');
let cssInjected = false;

/**
 * cntv - Wrapper for Video Player API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class cntv
 */
class cntv extends Tech {
  constructor(options, ready) {
    super(options, ready);

    //injectCss();
    this.setPoster(options.poster);
    this.initcntvPlayer();
  }

  initcntvPlayer() {
    const cntvOptions = {
      url: this.options_.source.src,
      byline: false,
      portrait: false,
      title: false
    };

    if (this.options_.autoplay) {
      cntvOptions.autoplay = true;
    }
    if (this.options_.height) {
      cntvOptions.height = this.options_.height;
    }
    if (this.options_.width) {
      cntvOptions.width = this.options_.width;
    }
    if (this.options_.maxheight) {
      cntvOptions.maxheight = this.options_.maxheight;
    }
    if (this.options_.maxwidth) {
      cntvOptions.maxwidth = this.options_.maxwidth;
    }
    if (this.options_.loop) {
      cntvOptions.loop = this.options_.loop;
    }
    if (this.options_.color) {
      // cntv is the only API on earth to reject hex color with leading #
      cntvOptions.color = this.options_.color.replace(/^#/, '');
    }

    //this._player = new cntvPlayer(this.el(), cntvOptions);
   // this._player = cordova.plugins.mytoast;
	cordova.plugins.mytoast.startFloatPlayer('',
                function onSuccess(message) {
                    console.log(message);
                },
                function onFail(message) {
                    console.log('Failed because: ' + message);
                });	
	/*this.initcntvState();

    ['play', 'pause', 'ended', 'timeupdate', 'progress', 'seeked'].forEach(e => {
      this._player.on(e, (progress) => {
        if (this._cntvState.progress.duration !== progress.duration) {
          this.trigger('durationchange');
        }
        this._cntvState.progress = progress;
        this.trigger(e);
      });
    });

    this._player.on('pause', () => this._cntvState.playing = false);
    this._player.on('play', () => {
      this._cntvState.playing = true;
      this._cntvState.ended = false;
    });
    this._player.on('ended', () => {
      this._cntvState.playing = false;
      this._cntvState.ended = true;
    });
    this._player.on('volumechange', (v) => this._cntvState.volume = v);
    this._player.on('error', e => this.trigger('error', e));

    this.triggerReady();*/
  }

  initcntvState() {
    const state = this._cntvState = {
      ended: false,
      playing: false,
      volume: 0,
      progress: {
        seconds: 0,
        percent: 0,
        duration: 0
      }
    };

    this._player.getCurrentTime().then(time => state.progress.seconds = time);
    this._player.getDuration().then(time => state.progress.duration = time);
    this._player.getPaused().then(paused => state.playing = !paused);
    this._player.getVolume().then(volume => state.volume = volume);
  }

  createEl() {
    const div = videojs.createEl('div', {
      id: this.options_.techId
    });

    div.style.cssText = 'width:100%;height:100%;top:0;left:0;position:absolute';
    div.className = 'vjs-cntv';

    return div;
  }

  controls() {
    return true;
  }

  supportsFullScreen() {
    return true;
  }

  src() {
    // @note: Not sure why this is needed but videojs requires it
    return this.options_.source;
  }

  currentSrc() {
    return this.options_.source.src;
  }

  // @note setSrc is used in other usecases (YouTube, Html) it doesn't seem required here
  // setSrc() {}

  currentTime() {
    return this._cntvState.progress.seconds;
  }

  setCurrentTime(time) {
    this._player.setCurrentTime(time);
  }

  volume() {
    return this._cntvState.volume;
  }

  setVolume(volume) {
    return this._player.setVolume(volume);
  }

  duration() {
    return this._cntvState.progress.duration;
  }

  buffered() {
    const progress = this._cntvState.progress;

    return videojs.createTimeRange(0, progress.percent * progress.duration);
  }

  paused() {
    return !this._cntvState.playing;
  }

  pause() {
    this._player.pause();
  }

  play() {
    this._player.play();
  }

  muted() {
    return this._cntvState.volume === 0;
  }

  ended() {
    return this._cntvState.ended;
  }

  // cntv does has a mute API and native controls aren't being used,
  // so setMuted doesn't really make sense and shouldn't be called.
  // setMuted(mute) {}
}

cntv.prototype.featuresTimeupdateEvents = true;

cntv.isSupported = function() {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(cntv);

cntv.nativeSourceHandler = {};

/**
 * Check if cntv can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'maybe', or '' (empty string)
 */
cntv.nativeSourceHandler.canPlayType = function(source) {
  if (source === 'video/cntv') {
    return 'maybe';
  }

  return '';
};

/*
 * Check cntv can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'maybe', or '' (empty string)
 * @note: Copied over from YouTube — not sure this is relevant
 */
cntv.nativeSourceHandler.canHandleSource = function(source) {
  if (source.type) {
    return cntv.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return cntv.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

// @note: Copied over from YouTube — not sure this is relevant
cntv.nativeSourceHandler.handleSource = function(source, tech) {
  tech.src(source.src);
};

// @note: Copied over from YouTube — not sure this is relevant
cntv.nativeSourceHandler.dispose = function() { };

cntv.registerSourceHandler(cntv.nativeSourceHandler);

Component.registerComponent('cntv', cntv);
Tech.registerTech('cntv', cntv);

// Include the version number.
cntv.VERSION = '0.0.1';

export default cntv;
