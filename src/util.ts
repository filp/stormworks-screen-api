// RGB or RGBA
export type Color = [number, number, number] | [number, number, number, number];

export const findLastIndexInArray = <T>(
  arr: T[],
  pred: (v: T, i: number, arr: T[]) => boolean | undefined
) => {
  let len = arr.length;

  while (len--) {
    if (pred(arr[len], len, arr)) {
      return len;
    }
  }

  return -1;
};

export const asRGBAString = (color: Color) =>
  `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
