# stormworks-screen-api

Canvas-based JS/Typescript implementation of the [Stormworks](https://store.steampowered.com/app/573090/Stormworks_Build_and_Rescue/) LUA screen API.

This library can be used to test and emulate controller designs outside of the game, as seen in [Stormdev](https://stormdev.vercel.app/).

## Getting started

**Install the package:**

_With npm:_

```shell
$ npm i --save stormworks-screen-api
```

_With yarn:_

```shell
$ yarn add stormworks-screen-api
```

**Create an API instance**

You can allow the API to create a canvas instance internally:

```ts
const stormworksScreenApi = screenApi();

// Retrieve the canvas element, e.g to include it in the DOM:
const canvasElement = stormworksScreenApi.getCanvasElement();
```

Or create your own canvas and provide it as an argument:

```ts
const myCanvasElement = document.getElementById('my-canvas');

if (!myCanvasElement) {
  throw new Error('Failed to find canvas element');
}

const stormworksScreenApi = screenApi({
  canvas: myCanvasElement,
});
```

The screen API methods are isolated under the `screen` property, which makes it easy to pass to an emulator context:

```ts
const stormworksScreenApi = screenApi();

const screen = stormworksScreenApi.screen;

screen.setColor(255, 0, 0, 255);
screen.drawLine(0, 0, 10, 10);
screen.drawRectF(10, 10, screen.getWidth() / 2, screen.getHeight() / 2);
```

## Compatibility

This library aims to be as accurate as possible compared to the in-game implementation, however, no guarantees are made. If a decision needs to be made between accuracy and practicality, practicality will always win.

### `drawMap`

Note that currently `drawMap` and map-related methods are not fully implemented - calls to these methods will succeed without rendering anything to the canvas.

## Additional options:

The `screenApi` method accepts a series of optional properties, which can be used to further configure how the API works, and how it renders elements onto the canvas.

All top-level properties are optional:

```ts
const stormworksScreenApi = screenApi({
  // Provide a Canvas element; if not provided, one will be created internally
  canvas: myCanvasElement,

  // If a canvas element is not provided, these dimensions will be used to create a new canvas:
  dimensions: {
    width: 480,
    height: 320,
  },

  // Override the values returned by `getWidth` and `getHeight`, can be used for emulation trickery:
  reportDimensions: {
    width: 64,
    height: 64,
  },

  // Settings used while rendering onto the canvas. Default values are shown here:
  drawSettings: {
    lineWidth: 1.4,
    fontSize: 5,
    fontFamily: "'Screen Mono', 'Lucida Console', Monaco, monospace",
    fontCharDimensions: {
      width: 4,
      height: 5,
    },
    defaultColor: [255, 255, 255, 255] as Color,
    circle: {
      lineSegmentIntervalsByRadius: [0, 20, 28],
      lineSegmentIntervals: [8, 12, 16],
    },
    map: {
      grass: [255, 255, 255, 255],
      land: [255, 255, 255, 255],
      ocean: [255, 255, 255, 255],
      sand: [255, 255, 255, 255],
      shallows: [255, 255, 255, 255],
      snow: [255, 255, 255, 255],
    },
  },
});
```

## Developing

A kitchen-sink is provided to visually inspect changes during development:

```shell
$ yarn dev
```

This will launch your primary browser on a page with a canvas element. You can use your developer console to test out the API locally, through the provided exported api at `window.S`, e.g:

```js
const screen = window.S.screen;

screen.drawText(1, 1, 'Hello!');
```

## Stuff

Contributions are welcome! Please open tickets or - ideally - pull requests with your suggestions.
