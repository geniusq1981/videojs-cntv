/* The MIT License (MIT)

Copyright (c) 2014-2015 Benoit Tremblay <trembl.ben@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
/*global define, YT*/
(function(root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		var videojs = require('video.js');
		module.exports = factory(videojs.default || videojs);
	} else if (typeof define === 'function' && define.amd) {
		define(['videojs'], function(videojs) {
			return (root.cntv = factory(videojs));
		});
	} else {
		root.cntv = factory(root.videojs);
	}
}(this, function(videojs) {
	'use strict';

	var _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_NATIVE_ANDROID;

	var PlayerState = {
		UNSTARTED: -1,
		ENDED: 0,
		PLAYING: 1,
		PAUSED: 2,
		BUFFERING: 3,
		BUFFEREND: 4
	};
	var Tech = videojs.getTech('Tech');

	var cntv = videojs.extend(Tech, {

		constructor: function(options, ready) {
			Tech.call(this, options, ready);

			this.setPoster(options.poster);
			this.setSrc(this.options_.source, true);
			console.log(options);
			this.playInfo = {
				"play_type": options.play_type,
				"columnId": "",
				"seriesID": options.seriesID,
				"programId": options.programId,
				"price": 0,
				"resolution": "",
				"duration": options.duration,
				"extend": "",
				"playUrl": options.playUrl,
				"startPosition": options.startPosition,
				"dhDecryption": options.dhDecryption,
				"adModel": options.adModel,
				"appKey":options.appKey,
				"channeId":options.channalId,
				"cdnDispathURl":options.cdnDispathURl,
				"dynamicKeyUrl":options.dynamicKeyUrl,
			}
			this.playStatus = {
				state: PlayerState.UNSTARTED,
				volume: 1,
				muted: false,
				muteVolume: 1,
				time: 0,
				duration: 0,
				rate: 1,
				buffered: 0,
				//url: self.baseUrl + self.videoId,
				error: null
			}
			// Set the vjs-cntv class to the player
			// Parent is not set yet so we have to wait a tick
			this.setTimeout(function() {
				if (this.el_) {
					this.el_.parentNode.className += ' vjs-cntv';

					if (_isOnMobile) {
						this.el_.parentNode.className += ' vjs-cntv-mobile';
					}

					this.initCNTVPlayer();

				}
			}.bind(this));
		},

		dispose: function() {
			if (this.ytPlayer) {
				//Dispose of the cntv Player
				if (this.ytPlayer.close) {
					this.ytPlayer.close();
				}
				if (this.ytPlayer.destroy) {
					this.ytPlayer.destroy();
				}
			} else {
				//cntv API hasn't finished loading or the player is already disposed
				var index = cntv.apiReadyQueue.indexOf(this);
				if (index !== -1) {
					cntv.apiReadyQueue.splice(index, 1);
				}
			}
			this.ytPlayer = null;

			this.el_.parentNode.className = this.el_.parentNode.className
				.replace(' vjs-cntv', '')
				.replace(' vjs-cntv-mobile', '');
			this.el_.parentNode.removeChild(this.el_);

			//Needs to be called after the cntv player is destroyed, otherwise there will be a null reference exception
			Tech.prototype.dispose.call(this);
		},

		createEl: function() {
			var div = document.createElement('div');
			div.setAttribute('id', this.options_.techId);
			div.setAttribute('style', 'width:100%;height:100%;top:0;left:0;position:absolute');
			div.setAttribute('class', 'vjs-tech');

			var divWrapper = document.createElement('div');
			divWrapper.appendChild(div);

			if (!_isOnMobile && !this.options_.ytControls) {
				var divBlocker = document.createElement('div');
				divBlocker.setAttribute('class', 'vjs-iframe-blocker');
				divBlocker.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%');

				// In case the blocker is still there and we want to pause
				divBlocker.onclick = function() {
					this.pause();
				}.bind(this);

				divWrapper.appendChild(divBlocker);
			}

			return divWrapper;
		},

		initCNTVPlayer: function() {
			var playerVars = {
				controls: 0,
				modestbranding: 1,
				rel: 0,
				showinfo: 0,
				loop: this.options_.loop ? 1 : 0
			};

			// Let the user set any cntv parameter
			// https://developers.google.com/cntv/player_parameters?playerVersion=HTML5#Parameters
			// To use cntv controls, you must use ytControls instead
			// To use the loop or autoplay, use the video.js settings

			if (typeof this.options_.autohide !== 'undefined') {
				playerVars.autohide = this.options_.autohide;
			}

			if (typeof this.options_['cc_load_policy'] !== 'undefined') {
				playerVars['cc_load_policy'] = this.options_['cc_load_policy'];
			}

			if (typeof this.options_.ytControls !== 'undefined') {
				playerVars.controls = this.options_.ytControls;
			}

			if (typeof this.options_.disablekb !== 'undefined') {
				playerVars.disablekb = this.options_.disablekb;
			}

			if (typeof this.options_.color !== 'undefined') {
				playerVars.color = this.options_.color;
			}

			if (!playerVars.controls) {
				// Let video.js handle the fullscreen unless it is the cntv native controls
				playerVars.fs = 0;
			} else if (typeof this.options_.fs !== 'undefined') {
				playerVars.fs = this.options_.fs;
			}

			if (this.options_.source.src.indexOf('end=') !== -1) {
				var srcEndTime = this.options_.source.src.match(/end=([0-9]*)/);
				this.options_.end = parseInt(srcEndTime[1]);
			}

			if (typeof this.options_.end !== 'undefined') {
				playerVars.end = this.options_.end;
			}

			if (typeof this.options_.hl !== 'undefined') {
				playerVars.hl = this.options_.hl;
			} else if (typeof this.options_.language !== 'undefined') {
				// Set the cntv player on the same language than video.js
				playerVars.hl = this.options_.language.substr(0, 2);
			}

			if (typeof this.options_['iv_load_policy'] !== 'undefined') {
				playerVars['iv_load_policy'] = this.options_['iv_load_policy'];
			}

			if (typeof this.options_.list !== 'undefined') {
				playerVars.list = this.options_.list;
			} else if (this.url && typeof this.url.listId !== 'undefined') {
				playerVars.list = this.url.listId;
			}

			if (typeof this.options_.listType !== 'undefined') {
				playerVars.listType = this.options_.listType;
			}

			if (typeof this.options_.modestbranding !== 'undefined') {
				playerVars.modestbranding = this.options_.modestbranding;
			}

			if (typeof this.options_.playlist !== 'undefined') {
				playerVars.playlist = this.options_.playlist;
			}

			if (typeof this.options_.playsinline !== 'undefined') {
				playerVars.playsinline = this.options_.playsinline;
			}

			if (typeof this.options_.rel !== 'undefined') {
				playerVars.rel = this.options_.rel;
			}

			if (typeof this.options_.showinfo !== 'undefined') {
				playerVars.showinfo = this.options_.showinfo;
			}

			if (this.options_.source.src.indexOf('start=') !== -1) {
				var srcStartTime = this.options_.source.src.match(/start=([0-9]*)/);
				this.options_.start = parseInt(srcStartTime[1]);
			}

			if (typeof this.options_.start !== 'undefined') {
				playerVars.start = this.options_.start;
			}

			if (typeof this.options_.theme !== 'undefined') {
				playerVars.theme = this.options_.theme;
			}

			// Allow undocumented options to be passed along via customVars
			if (typeof this.options_.customVars !== 'undefined') {
				var customVars = this.options_.customVars;
				Object.keys(customVars).forEach(function(key) {
					playerVars[key] = customVars[key];
				});
			}

			this.activeVideoId = this.url ? this.url.videoId : null;
			this.activeList = playerVars.list;

			var playerConfig = {
				videoId: this.activeVideoId,
				playerVars: playerVars,
				events: {
					onReady: this.onPlayerReady.bind(this),
					onPlaybackQualityChange: this.onPlayerPlaybackQualityChange.bind(this),
					onPlaybackRateChange: this.onPlayerPlaybackRateChange.bind(this),
					onStateChange: this.onPlayerStateChange.bind(this),
					onVolumeChange: this.onPlayerVolumeChange.bind(this),
					onError: this.onPlayerError.bind(this)
				}
			};

			if (typeof this.options_.enablePrivacyEnhancedMode !== 'undefined' && this.options_.enablePrivacyEnhancedMode) {
				playerConfig.host = 'https://www.cntv-nocookie.com';
			}

			//this.ytPlayer = new YT.Player(this.options_.techId, playerConfig);
			this.ytPlayer = cordova.plugins.mytoast;
			if (this.el_) {
				//console.log(this.el_.parentNode.clientWidth);
				//console.log(this.el_.parentNode.clientHeight);
				//console.log(this.el_.parentNode.offsetLeft);
				//console.log(this.el_.parentNode.offsetTop);
			}
			this.onPlayerReady();
			this.play();
			/*cordova.plugins.mytoast.startFloatPlayer("", {
				'x': Math.round(this.getElPosition(this.el_.parentNode).x * window.devicePixelRatio) || 300,
				'y': Math.round(this.getElPosition(this.el_.parentNode).y * window.devicePixelRatio) || 200,
				'width': Math.round(this.el_.parentNode.clientWidth * window.devicePixelRatio) || 480,
				'height': Math.round(this.el_.parentNode.clientHeight * window.devicePixelRatio) || 270
			}, function onSuccess(message) {
				console.log(message);
				switch (message.eventType) {
					case "BUFFER_START_EVENT":
						break;
					case "BUFFER_END_EVENT":
						break;
					case "PREPARED_EVENT":
						break;
					case "POSITION_EVENT":
						this.playStatus.time = message.currentPosition >= 0 ? message.currentPosition : 0;
						this.player_.trigger('timeupdate');
						break;
					case "COMPLETION_EVENT":
						this.playStatus.state = PlayerState.ENDED;
						this.player_.trigger('ended');
						break;
					case "SEEK_EVENT":
						this.player_.trigger('seeking');
						this.playStatus.time = message.currentPosition >= 0 ? message.currentPosition : 0;
						this.player_.trigger('timeupdate');
						this.player_.trigger('seeked');
						break;
					default:
						break;
				}
			}.bind(this), function onFail(message) {
				console.log('Failed because: ' + message);
			});*/
		},
		/**
		 * 获取元素在页面中的坐标(x, y) 
		 * @param {Object} e
		 */
		getElPosition: function(e) {
			var x = 0,
				y = 0;
			while (e != null) {
				x += e.offsetLeft;
				y += e.offsetTop;
				e = e.offsetParent;
			}
			return {
				x: x,
				y: y
			};
		},

		onPlayerReady: function() {
			if (this.options_.muted) {
				//this.ytPlayer.mute();
			}

			//var playbackRates = this.ytPlayer.getAvailablePlaybackRates();
			/*if (playbackRates.length > 1) {
				this.featuresPlaybackRate = true;
			}*/

			this.playerReady_ = true;
			this.player_.triggerReady();

			if (this.playOnReady) {
				this.play();
			} else if (this.cueOnReady) {
				this.cueVideoById_(this.url.videoId);
				this.activeVideoId = this.url.videoId;
			}
		},

		onPlayerPlaybackQualityChange: function() {

		},

		onPlayerPlaybackRateChange: function() {
			this.player_.trigger('ratechange');
		},

		onPlayerStateChange: function(state) {
			//var state = e.data;
			console.log("onPlayerStateChange");
			console.log("377 lastState"+this.lastState);
			console.log("378 errorNumber"+this.errorNumber);
			console.log(state);
			if (state === this.lastState || this.errorNumber) {
				return;
			}
			this.lastState = state;
			switch (state) {
				case -1:
					this.player_.trigger('loadstart');
					//this.player_.trigger('loadedmetadata');
					this.player_.trigger('durationchange');
					this.player_.trigger('ratechange');
					break;

				case PlayerState.ENDED:
					this.player_.trigger('ended');
					break;

				case PlayerState.PLAYING:
					this.player_.trigger('canplay');
					this.player_.trigger('timeupdate');
					this.player_.trigger('durationchange');
					this.player_.trigger('playing');
					this.player_.trigger('play');

					if (this.isSeeking) {
						this.onSeeked();
					}
					break;

				case PlayerState.PAUSED:
					if (this.isSeeking) {
						this.onSeeked();
					} else {
						this.player_.trigger('pause');
					}
					break;

				case PlayerState.BUFFERING:
					this.player_.trigger('waiting');
					break;
			}
		},

		onPlayerVolumeChange: function() {
			this.player_.trigger('volumechange');
		},

		onPlayerError: function(e) {
			this.errorNumber = e.data;
			this.player_.trigger('pause');
			this.player_.trigger('error');
		},

		error: function() {
			var code = 1000 + this.errorNumber; // as smaller codes are reserved
			switch (this.errorNumber) {
				case 5:
					return {
						code: code,
						message: 'Error while trying to play the video'
					};

				case 2:
				case 100:
					return {
						code: code,
						message: 'Unable to find the video'
					};

				case 101:
				case 150:
					return {
						code: code,
						message: 'Playback on other Websites has been disabled by the video owner.'
					};
			}

			return {
				code: code,
				message: 'cntv unknown error (' + this.errorNumber + ')'
			};
		},

		loadVideoById_: function(id) {
			var options = {
				videoId: id
			};
			if (this.options_.start) {
				options.startSeconds = this.options_.start;
			}
			if (this.options_.end) {
				options.endEnd = this.options_.end;
			}
			//this.ytPlayer.loadVideoById(options);
		},

		cueVideoById_: function(id) {
			var options = {
				videoId: id
			};
			if (this.options_.start) {
				options.startSeconds = this.options_.start;
			}
			if (this.options_.end) {
				options.endEnd = this.options_.end;
			}
			//this.ytPlayer.cueVideoById(options);
		},

		src: function(src) {
			if (src) {
				this.setSrc({
					src: src
				});
			}

			return this.source;
		},

		poster: function() {
			// You can't start programmaticlly a video with a mobile
			// through the iframe so we hide the poster and the play button (with CSS)
			if (_isOnMobile) {
				return null;
			}

			return this.poster_;
		},

		setPoster: function(poster) {
			this.poster_ = poster;
		},

		setSrc: function(source) {
			if (!source || !source.src) {
				return;
			}

			delete this.errorNumber;
			this.source = source;
			this.url = cntv.parseUrl(source.src);

			if (!this.options_.poster) {
				if (this.url.videoId) {
					// Set the low resolution first
					this.poster_ = 'https://img.cntv.com/vi/' + this.url.videoId + '/0.jpg';
					this.player_.trigger('posterchange');

					// Check if their is a high res
					this.checkHighResPoster();
				}
			}

			if (this.options_.autoplay && !_isOnMobile) {
				if (this.isReady_) {
					this.play();
				} else {
					this.playOnReady = true;
				}
			} else if (this.activeVideoId !== this.url.videoId) {
				if (this.isReady_) {
					this.cueVideoById_(this.url.videoId);
					this.activeVideoId = this.url.videoId;
				} else {
					this.cueOnReady = true;
				}
			}
		},

		autoplay: function() {
			return this.options_.autoplay;
		},

		setAutoplay: function(val) {
			this.options_.autoplay = val;
		},

		loop: function() {
			return this.options_.loop;
		},

		setLoop: function(val) {
			this.options_.loop = val;
		},

		play: function() {
			if (this.ytPlayer) {
				console.log(this.playStatus.state);
				if(this.playStatus.state == PlayerState.UNSTARTED) {
					//this.onPlayerStateChange(-1);
					console.log("startFloatPlayer firsttime");
					this.onPlayerStateChange(this.playStatus.state);
					this.ytPlayer.startFloatPlayer(this.playInfo, {
						'x': Math.round(this.getElPosition(this.el_.parentNode).x * window.devicePixelRatio),
						'y': Math.round(this.getElPosition(this.el_.parentNode).y * window.devicePixelRatio),
						'width': Math.round(this.el_.parentNode.clientWidth * window.devicePixelRatio),
						'height': Math.round(this.el_.parentNode.clientHeight * window.devicePixelRatio)
					}, function onSuccess(message) {
						console.log(message);
						//console.log(this);
						//this.player_.trigger('play');
						//this.playStatus.duration = message.duration > 0 ? message.duration/1000 : 0;
						//this.player_.trigger('canplay');
						switch (message.eventType) {
							case "BUFFER_START_EVENT":
								console.log("BUFFER_START_EVENT")
								//this.player_.trigger('timeupdate');
								//this.player_.trigger('waiting');
								this.playStatus.duration = message.duration > 0 ? message.duration/1000 : 0;
								this.playStatus.state = PlayerState.BUFFERING;
								this.onPlayerStateChange(this.playStatus.state);
								break;
							case "BUFFER_END_EVENT":
								console.log("BUFFER_END_EVENT")
								this.playStatus.duration = message.duration > 0 ? message.duration/1000 : 0;
								//this.player_.trigger('durationchange');
								//this.player_.trigger('playing');
								//this.player_.trigger('play');
								this.playStatus.state = PlayerState.PLAYING;
								this.onPlayerStateChange(this.playStatus.state);
								break;
							case "PREPARED_EVENT":
								console.log("PREPARED_EVENT")
								this.playStatus.duration = message.duration > 0 ? message.duration/1000 : 0;
								//this.player_.trigger('durationchange');
								//this.player_.trigger('playing');
								//this.player_.trigger('play');
								this.playStatus.state = PlayerState.PLAYING;
								this.onPlayerStateChange(this.playStatus.state);
								//this.playStatus.duration = message.duration>0?message.duration/1000:0;
								//this.player_.trigger('durationchange');
								break;
							case "POSITION_EVENT":
								this.playStatus.time = message.currentPosition >= 0 ? message.currentPosition/1000 : 0;
								this.player_.trigger('timeupdate');
								break;
							case "COMPLETION_EVENT":
								console.log("player completion")
								console.log(message)
								if(message.completion=="1"||message.completion=="2"){
								this.playStatus.state = PlayerState.ENDED;
								this.onPlayerStateChange(this.playStatus.state);
								}
								break;
							case "SEEK_EVENT":
								this.player_.trigger('seeking');
								//this.playStatus.time = message.currentPosition >= 0 ? message.currentPosition : 0;
								//this.player_.trigger('timeupdate');
								//this.playStatus.state = PlayerState.
								//this.player_.trigger('seeked');
								break;
							default:
								break;
						}
					}.bind(this), function onFail(message) {
						console.log('Failed because: ' + message);
					}.bind(this));
				}
				if (this.playStatus.state == PlayerState.PAUSED) {
					this.ytPlayer.play();
					this.playStatus.state = PlayerState.PLAYING;
					this.onPlayerStateChange(this.playStatus.state);
					//this.player_.trigger('playing');
				}
			}
		},

		pause: function() {
			if (this.ytPlayer) {
				this.ytPlayer.pause();
				this.playStatus.state = PlayerState.PAUSED
				this.onPlayerStateChange(this.playStatus.state);
				//this.player_.trigger('canplay');
				//this.player_.trigger('pause');
			}
		},

		paused: function() {
			return (this.ytPlayer) ?
				(this.playStatus.state !== PlayerState.PLAYING && this.playStatus.state !== PlayerState.BUFFERING) :
				true;
		},

		currentTime: function() {
			return this.playStatus.time;
		},

		setCurrentTime: function(seconds) {

			console.log(seconds)
			this.ytPlayer.seekTo(seconds*1000, function(message) {
					console.log(message);
			}, function(err) {
					console.log(err);
			});
			this.player_.trigger('timeupdate');
			this.player_.trigger('seeking');
			this.isSeeking = true;
		},

		seeking: function() {
			return this.isSeeking;
		},

		seekable: function() {
			if (!this.ytPlayer) {
				return videojs.createTimeRange();
			}

			return videojs.createTimeRange(0, this.duration());
		},

		onSeeked: function() {
			//clearInterval(this.checkSeekedInPauseInterval);
			console.log("seek complete")
			this.isSeeking = false;
			this.player_.trigger('seeked');
			if (this.wasPausedBeforeSeek) {
				this.pause();
			}

			
		},

		playbackRate: function() {
			return this.playStatus.rate;
		},

		setPlaybackRate: function(suggestedRate) {
			if (!this.ytPlayer) {
				return;
			}
			this.playStatus.rate = suggestedRate;
			//this.ytPlayer.setPlaybackRate(suggestedRate);
		},

		duration: function() {
			console.log(this.playStatus.duration);
			return this.playStatus.duration >= 0 ? this.playStatus.duration : 0;
		},

		currentSrc: function() {
			return this.source && this.source.src;
		},

		ended: function() {
			return this.ytPlayer ? (this.lastState === PlayerState.ENDED) : false;
		},

		volume: function() {
			return /*this.ytPlayer ? this.ytPlayer.getVolume() / 100.0 :*/ 1;
		},

		setVolume: function(percentAsDecimal) {
			if (!this.ytPlayer) {
				return;
			}

			//this.ytPlayer.setVolume(percentAsDecimal * 100.0);
		},

		muted: function() {
			return this.ytPlayer ? true : false;
		},

		setMuted: function(mute) {
			if (!this.ytPlayer) {
				return;
			} else {
				this.muted(true);
			}

			if (mute) {
				//this.ytPlayer.mute();
			} else {
				//this.ytPlayer.unMute();
			}
			this.setTimeout(function() {
				this.player_.trigger('volumechange');
			}, 50);
		},

		buffered: function() {
			if (!this.ytPlayer /*|| !this.ytPlayer.getVideoLoadedFraction*/ ) {
				return videojs.createTimeRange();
			}

			var bufferedEnd = this.duration(); //.ytPlayer.getVideoLoadedFraction() * this.ytPlayer.getDuration();

			return videojs.createTimeRange(0, bufferedEnd);
		},

		// TODO: Can we really do something with this on cntv?
		preload: function() {},
		load: function() {},
		reset: function() {},
		networkState: function() {
			if (!this.ytPlayer) {
				return 0; //NETWORK_EMPTY
			}
			/*switch (this.ytPlayer.getPlayerState()) {
				case -1: //unstarted
					return 0; //NETWORK_EMPTY
				case 3: //buffering
					return 2; //NETWORK_LOADING
				default:
					return 1; //NETWORK_IDLE
			}*/
			return 0;
		},
		readyState: function() {
			if (!this.ytPlayer) {
				return 0; //HAVE_NOTHING
			}
			/*switch (this.ytPlayer.getPlayerState()) {
				case -1: //unstarted
					return 0; //HAVE_NOTHING
				case 5: //video cued
					return 1; //HAVE_METADATA
				case 3: //buffering
					return 2; //HAVE_CURRENT_DATA
				default:
					return 4; //HAVE_ENOUGH_DATA
			}*/
		},

		supportsFullScreen: function() {
			console.log("supportsFullScreen")
			return true;
		},
		enterFullScreen: function() {
			// this.ytPlayer.fullScreen(function(msg){
			// 	console.log(msg);
			// },function(err){
			// 	console.log(err);
			// });
			console.log("enterFullScreen")
			this.ytPlayer.setDisplayRect({
				'x': Math.round(this.getElPosition(this.el_.parentNode).x * window.devicePixelRatio),
				'y': Math.round(this.getElPosition(this.el_.parentNode).y * window.devicePixelRatio),
				'width': Math.round(this.el_.parentNode.clientWidth * window.devicePixelRatio),
				'height': Math.round(this.el_.parentNode.clientHeight * window.devicePixelRatio)
			});
			return true;
		},
		exitFullScreen: function() {
			console.log("exitFullScreen")
			this.ytPlayer.setDisplayRect({
				'x': Math.round(this.getElPosition(this.el_.parentNode).x * window.devicePixelRatio),
				'y': Math.round(this.getElPosition(this.el_.parentNode).y * window.devicePixelRatio),
				'width': Math.round(this.el_.parentNode.clientWidth * window.devicePixelRatio),
				'height': Math.round(this.el_.parentNode.clientHeight * window.devicePixelRatio)
			});
			return true;
		},
		// Tries to get the highest resolution thumbnail available for the video
		checkHighResPoster: function() {
			var uri = 'https://img.cntv.com/vi/' + this.url.videoId + '/maxresdefault.jpg';

			try {
				var image = new Image();
				image.onload = function() {
					// Onload may still be called if cntv returns the 120x90 error thumbnail
					if ('naturalHeight' in image) {
						if (image.naturalHeight <= 90 || image.naturalWidth <= 120) {
							return;
						}
					} else if (image.height <= 90 || image.width <= 120) {
						return;
					}

					this.poster_ = uri;
					this.player_.trigger('posterchange');
				}.bind(this);
				image.onerror = function() {};
				image.src = uri;
			} catch (e) {}
		}
	});

	cntv.isSupported = function() {
		return true;
	};

	cntv.canPlaySource = function(e) {
		return cntv.canPlayType(e.type);
	};

	cntv.canPlayType = function(e) {
		return (e === 'video/cntv');
	};

	cntv.parseUrl = function(url) {
		var result = {
			videoId: null
		};

		var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = url.match(regex);

		if (match && match[2].length === 11) {
			result.videoId = match[2];
		}

		var regPlaylist = /[?&]list=([^#\&\?]+)/;
		match = url.match(regPlaylist);

		if (match && match[1]) {
			result.listId = match[1];
		}

		return result;
	};


	function loadScript(src, callback) {
		var loaded = false;
		var tag = document.createElement('script');
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		tag.onload = function() {
			if (!loaded) {
				loaded = true;
				callback();
			}
		};
		tag.onreadystatechange = function() {
			if (!loaded && (this.readyState === 'complete' || this.readyState === 'loaded')) {
				loaded = true;
				callback();
			}
		};
		tag.src = src;
	}

	function injectCss() {
		var css = // iframe blocker to catch mouse events
			'.vjs-cntv .vjs-iframe-blocker { display: none; }' +
			'.vjs-cntv.vjs-user-inactive .vjs-iframe-blocker { display: block; }' +
			'.vjs-cntv .vjs-poster { background-size: cover; }' +
			'.vjs-cntv-mobile .vjs-big-play-button { display: none; }';

		var head = document.head || document.getElementsByTagName('head')[0];

		var style = document.createElement('style');
		style.type = 'text/css';

		if (style.styleSheet) {
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}

	cntv.apiReadyQueue = [];

	// Older versions of VJS5 doesn't have the registerTech function
	if (typeof videojs.registerTech !== 'undefined') {
		videojs.registerTech('cntv', cntv);
	} else {
		videojs.registerComponent('cntv', cntv);
	}
}));
