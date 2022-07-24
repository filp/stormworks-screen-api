import { findLastIndexInArray, asRGBAString, type Color } from './util';

// Canvas dimensions if allowing screenApi to create it
type CanvasDimensions = {
  width: number;
  height: number;
};

enum TextHAlign {
  Left = -1,
  Center = 0,
  Right = 1,
}

enum TextVAlign {
  Top = -1,
  Center = 0,
  Bottom = 1,
}

// Line or fill types:
type StrokeFill = 'stroke' | 'fill';

type ScreenApiOptions = {
  canvas?: HTMLCanvasElement;
  dimensions?: CanvasDimensions;

  reportDimensions?: {
    width: number;
    height: number;
  };

  drawSettings?: Partial<typeof defaultDrawSettings>;
};

const defaultDrawSettings = {
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
};

type DrawSettings = typeof defaultDrawSettings;

// Naive 'deep merge' for drawSettings
const extendDrawSettings = (ext: Partial<DrawSettings>) => ({
  ...defaultDrawSettings,
  ...ext,

  circle: {
    ...defaultDrawSettings.circle,
    ...(ext.circle || {}),
  },

  fontCharDimensions: {
    ...defaultDrawSettings.fontCharDimensions,
    ...(ext.fontCharDimensions || {}),
  },

  map: {
    ...defaultDrawSettings.map,
    ...(ext.map || {}),
  },
});

const createCanvasElement = ({ width, height }: CanvasDimensions) => {
  const canvasElm = document.createElement('canvas');

  canvasElm.width = width;
  canvasElm.height = height;

  return canvasElm;
};

export const screenApi = (options: ScreenApiOptions = {}) => {
  const { canvas, dimensions, reportDimensions } = options;
  const drawSettings = extendDrawSettings(options.drawSettings || {});

  const mapColors = drawSettings.map;

  const canvasElm =
    canvas ||
    createCanvasElement(
      dimensions || {
        width: 380,
        height: 240,
      }
    );

  const ctx = canvasElm.getContext('2d');

  if (!ctx) {
    throw new Error('failed to get 2d context for canvas element');
  }

  ctx.font = `${drawSettings.fontSize}px ${drawSettings.fontFamily}`;
  ctx.lineWidth = drawSettings.lineWidth;

  const strokeOrFill = (t: StrokeFill) => {
    if (t === 'fill') ctx.fill();
    else ctx.stroke();
  };

  const circle = (x: number, y: number, r: number, circleType: StrokeFill) => {
    const { circle } = drawSettings;
    const lineSegments =
      circle.lineSegmentIntervals[
        findLastIndexInArray(circle.lineSegmentIntervalsByRadius, (v) => r >= v)
      ];

    const pi2 = Math.PI * 2;
    const stepAmount = pi2 / lineSegments;

    ctx.beginPath();

    for (let dist = 0; dist < pi2; dist += stepAmount) {
      const x1 = r * Math.cos(dist) + x;
      const y1 = r * Math.sin(dist) + y;
      const x2 = r * Math.cos(dist + stepAmount) + x;
      const y2 = r * Math.sin(dist + stepAmount) + y;

      // Move to starting position:
      if (dist === 0) {
        ctx.moveTo(x1, y1);
      }

      ctx.lineTo(x2, y2);
    }

    strokeOrFill(circleType);
    ctx.closePath();
  };

  const triangle = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    triangleType: StrokeFill
  ) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    strokeOrFill(triangleType);
    ctx.closePath();
  };

  const mapColorSetter =
    (prop: keyof typeof mapColors) =>
    (r: number, g: number, b: number, a?: number) => {
      mapColors[prop] = [r, g, b, a || 255];
    };

  const getWidth = () => reportDimensions?.width || canvasElm.width;
  const getHeight = () => reportDimensions?.height || canvasElm.height;

  // splits a string so that each line fits into a given max width, while
  // also accounting for existing newline characters.
  const splitTextLines = (text: string, maxWidth: number) =>
    text
      .replace(
        new RegExp(`(?![^\\n]{1,${maxWidth}}$)([^\\n]{1,${maxWidth}})\\s`, 'g'),
        '$1\n'
      )
      .split('\n');

  const setColor = (r: number, g: number, b: number, a?: number) => {
    const colorRGBA = asRGBAString([r, g, b, a ? a / 255 : 1]);

    ctx.strokeStyle = colorRGBA;
    ctx.fillStyle = colorRGBA;
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  };

  const drawCircle = (x: number, y: number, r: number) =>
    circle(x, y, r, 'stroke');

  const drawCircleF = (x: number, y: number, r: number) =>
    circle(x, y, r, 'fill');

  const drawClear = () => {
    ctx.clearRect(0, 0, getWidth(), getHeight());
  };

  const drawRect = (x: number, y: number, width: number, height: number) =>
    ctx.strokeRect(x, y, width, height);

  const drawRectF = (x: number, y: number, width: number, height: number) =>
    ctx.fillRect(x, y, width, height);

  const drawText = (x: number, y: number, text: string) => {
    text
      .toUpperCase()
      .split('\n')
      .forEach((line, i) => {
        ctx.fillText(
          line,
          x,
          y +
            i * (drawSettings.fontCharDimensions.height + 1) +
            drawSettings.fontSize
        );
      });
  };

  const drawTextBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    hAlign: TextHAlign,
    vAlign: TextVAlign
  ) => {
    const lines = splitTextLines(text.toUpperCase(), width);
    const halfW = width / 2;
    const halfH = height / 2;
    const hCenter = x + halfW + hAlign * halfW;
    const vCenter = y + halfH + vAlign * halfH;
    const lineHeight = drawSettings.fontCharDimensions.height + 1;

    lines.forEach((line, i) => {
      const lineW = line.length * drawSettings.fontCharDimensions.width - 1;
      ctx.fillText(
        line,
        Math.round(hCenter - lineW / 2 - (hAlign * lineW) / 2),
        Math.round(
          i * lineHeight +
            vCenter -
            (vAlign * lines.length * lineHeight) / 2 -
            (lines.length * lineHeight) / 2 +
            lineHeight -
            (i - 1) / lines.length
        )
      );
    });
  };

  // Not implemented
  const drawMap = (_x: number, _y: number, _zoom: number) => {};

  const drawTriangle = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) => triangle(x1, y1, x2, y2, x3, y3, 'stroke');

  const drawTriangleF = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) => triangle(x1, y1, x2, y2, x3, y3, 'fill');

  return {
    getCanvasElement: () => canvasElm,
    getCanvasContext: () => ctx,
    screen: {
      getWidth,
      getHeight,
      setColor,
      drawLine,
      drawClear,
      drawCircle,
      drawCircleF,
      drawRect,
      drawRectF,
      drawText,
      drawTextBox,
      drawTriangle,
      drawTriangleF,
      drawMap,
      setMapColorGrass: mapColorSetter('grass'),
      setMapColorLand: mapColorSetter('land'),
      setMapColorOcean: mapColorSetter('ocean'),
      setMapColorSand: mapColorSetter('sand'),
      setMapColorShallows: mapColorSetter('shallows'),
      setMapColorSnow: mapColorSetter('snow'),
    },
  };
};
