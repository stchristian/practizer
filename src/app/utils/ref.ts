export function requireRef<T>(ref: React.MutableRefObject<T> | React.RefObject<T>) {
  if (!ref.current) {
    throw new Error(`ref.current has no value.`);
  }
  return ref.current;
}
