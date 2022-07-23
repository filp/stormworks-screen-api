import { findLastIndexInArray } from './util';

type CanvasDimensions = {
  width: number;
  height: number;
};

// RGB or RGBA
type Color = [number, number, number] | [number, number, number, number];

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

  onDraw?: () => void;
  onStartDraw?: () => void;
  onFinishDraw?: () => void;
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
};

const asRGBAString = (color: Color) =>
  `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;

const createCanvasElement = ({ width, height }: CanvasDimensions) => {
  const canvasElm = document.createElement('canvas');

  canvasElm.width = width;
  canvasElm.height = height;

  return canvasElm;
};

export const screenApi = (options: ScreenApiOptions = {}) => {
  const { canvas, dimensions, reportDimensions } = options;
  const drawSettings = {
    ...defaultDrawSettings,
    ...(options.drawSettings || {}),
  };

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

    if (circleType === 'stroke') ctx.stroke();
    else {
      ctx.fill();
    }

    ctx.closePath();
  };

  const getWidth = () => reportDimensions?.width || canvasElm.width;
  const getHeight = () => reportDimensions?.height || canvasElm.height;

  const setColor = (r: number, g: number, b: number, a: number) => {
    const colorRGBA = asRGBAString([r, g, b, a / 255]);

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
    ctx.clearRect(0, 0, canvasElm.width, canvasElm.height);
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

  return {
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
  };
};
