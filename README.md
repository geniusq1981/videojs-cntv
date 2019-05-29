# cntv Playback Technology<br />for [Video.js](https://github.com/videojs/video.js)

[![Greenkeeper badge](https://badges.greenkeeper.io/videojs/videojs-cntv.svg)](https://greenkeeper.io/)

## Install
You can use bower (`bower install videojs-cntv`), npm (`npm install videojs-cntv`) or the source and build it using `npm run build`. Then, the only file you need is dist/cntv.min.js.

## Version Note
Use branch `vjs4` if you still using old VideoJS `v4.x`.

## Example
```html
<!DOCTYPE html>
<html>
<head>
  <link type="text/css" rel="stylesheet" href="../node_modules/video.js/dist/video-js.min.css" />
</head>
<body>
  <video
    id="vid1"
    class="video-js vjs-default-skin"
    controls
    autoplay
    width="640" height="264"
    data-setup='{ "techOrder": ["cntv"], "sources": [{ "type": "video/cntv", "src": "https://www.cntv.com/watch?v=xjS6SftYQaQ"}] }'
  >
  </video>

  <script src="../node_modules/video.js/dist/video.min.js"></script>
  <script src="../dist/cntv.min.js"></script>
</body>
</html>
```

See the examples folder for more

## How does it work?
Including the script cntv.min.js will add the cntv as a tech. You just have to add it to your techOrder option. Then, you add the option src with your cntv URL.

It supports:
- cntv.com as well as youtu.be
- Regular URLs: http://www.cntv.com/watch?v=xjS6SftYQaQ
- Embeded URLs: http://www.cntv.com/embed/xjS6SftYQaQ
- Playlist URLs: http://www.cntv.com/playlist?list=PLA60DCEB33156E51F OR http://www.cntv.com/watch?v=xjS6SftYQaQ&list=SPA60DCEB33156E51F

## Options
It supports every regular Video.js options. Additionally, you can change any [cntv parameter](https://developers.google.com/cntv/player_parameters?hl=en#Parameters). Here is an example of setting the `iv_load_policy` parameter to `1`.

```html
<video
  id="vid1"
  class="video-js vjs-default-skin"
  controls
  autoplay
  width="640" height="264"
  data-setup='{ "techOrder": ["cntv"], "sources": [{ "type": "video/cntv", "src": "https://www.cntv.com/watch?v=xjS6SftYQaQ"}], "cntv": { "iv_load_policy": 1 } }'
>
</video>
```

### cntv controls
Because `controls` is already a Video.js option, to use the cntv controls, you must set the `ytControls` parameter.

```html
<video
  id="vid1"
  class="video-js vjs-default-skin"
  controls
  autoplay
  width="640" height="264"
  data-setup='{ "techOrder": ["cntv"], "sources": [{ "type": "video/cntv", "src": "https://www.cntv.com/watch?v=xjS6SftYQaQ"}], "cntv": { "ytControls": 2 } }'
>
</video>
```

### Custom Player Options
If you need to set any additional options on the cntv player, you may do so with the `customVars` parameter:

```html
<video
  id="vid1"
  class="video-js vjs-default-skin"
  controls
  autoplay
  width="640" height="264"
  data-setup='{ "techOrder": ["cntv"], "sources": [{ "type": "video/cntv", "src": "https://www.cntv.com/watch?v=xjS6SftYQaQ"}], "cntv": { "customVars": { "wmode": "transparent" } } }'
>
</video>
```

## Special Thank You
Thanks to Steve Heffernan for the amazing Video.js and to John Hurliman for the original version of the cntv tech

## License
The MIT License (MIT)

Copyright (c) Benoit Tremblay <trembl.ben@gmail.com> and videojs-cntv contributors

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
THE SOFTWARE.
