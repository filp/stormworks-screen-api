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
