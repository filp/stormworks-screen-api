import { screenApi } from '../src/index';

declare global {
  interface Window {
    S?: ReturnType<typeof screenApi>;
  }
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const canvas = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      throw new Error('failed to find canvas element');
    }

    const api = screenApi({
      canvas,
    });

    const { screen } = api;

    window.S = api;

    // eslint-disable-next-line no-console
    console.info(
      'screenApi object available at window.S',
      'Try S.screen.drawText(1, 1, "Hello!")'
    );

    screen.setColor(100, 100, 200, 255);
    screen.drawLine(0, 0, 200, 200);
  },
  false
);
