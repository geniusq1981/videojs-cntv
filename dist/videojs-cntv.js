/**
 * videojs-cntv
 * @version 2.0.2
 * @copyright 2019 Benoit Tremblay <trembl.ben@gmail.com>
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsCntv = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import cntvPlayer from '@cntv/player';

var Component = _video2.default.getComponent('Component');
var Tech = _video2.default.getComponent('Tech');
var cssInjected = false;

/**
 * cntv - Wrapper for Video Player API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class cntv
 */

var cntv = function (_Tech) {
  _inherits(cntv, _Tech);

  function cntv(options, ready) {
    _classCallCheck(this, cntv);

    //injectCss();
    var _this = _possibleConstructorReturn(this, _Tech.call(this, options, ready));

    _this.setPoster(options.poster);
    _this.initcntvPlayer();
    return _this;
  }

  cntv.prototype.initcntvPlayer = function initcntvPlayer() {
    var cntvOptions = {
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
    cordova.plugins.mytoast.startFloatPlayer('', function onSuccess(message) {
      console.log(message);
    }, function onFail(message) {
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
  };

  cntv.prototype.initcntvState = function initcntvState() {
    var state = this._cntvState = {
      ended: false,
      playing: false,
      volume: 0,
      progress: {
        seconds: 0,
        percent: 0,
        duration: 0
      }
    };

    this._player.getCurrentTime().then(function (time) {
      return state.progress.seconds = time;
    });
    this._player.getDuration().then(function (time) {
      return state.progress.duration = time;
    });
    this._player.getPaused().then(function (paused) {
      return state.playing = !paused;
    });
    this._player.getVolume().then(function (volume) {
      return state.volume = volume;
    });
  };

  cntv.prototype.createEl = function createEl() {
    var div = _video2.default.createEl('div', {
      id: this.options_.techId
    });

    div.style.cssText = 'width:100%;height:100%;top:0;left:0;position:absolute';
    div.className = 'vjs-cntv';

    return div;
  };

  cntv.prototype.controls = function controls() {
    return true;
  };

  cntv.prototype.supportsFullScreen = function supportsFullScreen() {
    return true;
  };

  cntv.prototype.src = function src() {
    // @note: Not sure why this is needed but videojs requires it
    return this.options_.source;
  };

  cntv.prototype.currentSrc = function currentSrc() {
    return this.options_.source.src;
  };

  // @note setSrc is used in other usecases (YouTube, Html) it doesn't seem required here
  // setSrc() {}

  cntv.prototype.currentTime = function currentTime() {
    return this._cntvState.progress.seconds;
  };

  cntv.prototype.setCurrentTime = function setCurrentTime(time) {
    this._player.setCurrentTime(time);
  };

  cntv.prototype.volume = function volume() {
    return this._cntvState.volume;
  };

  cntv.prototype.setVolume = function setVolume(volume) {
    return this._player.setVolume(volume);
  };

  cntv.prototype.duration = function duration() {
    return this._cntvState.progress.duration;
  };

  cntv.prototype.buffered = function buffered() {
    var progress = this._cntvState.progress;

    return _video2.default.createTimeRange(0, progress.percent * progress.duration);
  };

  cntv.prototype.paused = function paused() {
    return !this._cntvState.playing;
  };

  cntv.prototype.pause = function pause() {
    this._player.pause();
  };

  cntv.prototype.play = function play() {
    this._player.play();
  };

  cntv.prototype.muted = function muted() {
    return this._cntvState.volume === 0;
  };

  cntv.prototype.ended = function ended() {
    return this._cntvState.ended;
  };

  // cntv does has a mute API and native controls aren't being used,
  // so setMuted doesn't really make sense and shouldn't be called.
  // setMuted(mute) {}


  return cntv;
}(Tech);

cntv.prototype.featuresTimeupdateEvents = true;

cntv.isSupported = function () {
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
cntv.nativeSourceHandler.canPlayType = function (source) {
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
cntv.nativeSourceHandler.canHandleSource = function (source) {
  if (source.type) {
    return cntv.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return cntv.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

// @note: Copied over from YouTube — not sure this is relevant
cntv.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

// @note: Copied over from YouTube — not sure this is relevant
cntv.nativeSourceHandler.dispose = function () {};

cntv.registerSourceHandler(cntv.nativeSourceHandler);

Component.registerComponent('cntv', cntv);
Tech.registerTech('cntv', cntv);

// Include the version number.
cntv.VERSION = '0.0.1';

exports.default = cntv;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
