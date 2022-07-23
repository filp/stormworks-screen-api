type CanvasDimensions = {
  width: number;
  height: number;
};

// RGB or RGBA
type Color = [number, number, number] | [number, number, number, number];

type ScreenApiOptions = {
  canvas?: HTMLCanvasElement;
  dimensions?: CanvasDimensions;

  drawSettings?: Partial<typeof defaultDrawSettings>;

  onDraw?: () => void;
  onStartDraw?: () => void;
  onFinishDraw?: () => void;
};

const defaultDrawSettings = {
  lineWidth: 1.4,
  fontSize: 5,
  fontFamily: "'Screen Mono', 'Lucida Console', Monaco, monospace",
  defaultColor: [255, 255, 255, 255] as Color,
};

const asRGBAString = (color: Color) =>
  `rgba(${(color[0], color[1], color[2], color[3])})`;

const createCanvasElement = ({ width, height }: CanvasDimensions) => {
  const canvasElm = document.createElement('canvas');

  canvasElm.width = width;
  canvasElm.height = height;

  return canvasElm;
};

export const screenApi = (options: ScreenApiOptions) => {
  const { canvas, dimensions } = options;
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

  const setColor = (r: number, g: number, b: number, a: number) => {
    const colorRGBA = asRGBAString([r, g, b, a]);

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

  const drawClear = () => {
    ctx.clearRect(0, 0, canvasElm.width, canvasElm.height);
  };

  return {
    setColor,
    drawLine,
    drawClear,
  };
};
