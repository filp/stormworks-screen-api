import { screenApi } from '../src/index';

declare global {
  interface Window {
    S_API?: ReturnType<typeof screenApi>;
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

    api.setColor(100, 100, 200, 255);
    api.drawLine(0, 0, 200, 200);

    window.S_API = api;

    // eslint-disable-next-line no-console
    console.info('API object available at window.S_API');
  },
  false
);
