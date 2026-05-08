const RESPONSIVE_WIDTHS = [160, 320, 640, 960, 1280] as const;

function canUseSrcSet(src: string) {
  return !src.startsWith("data:") && !src.startsWith("blob:");
}

export function getResponsiveImageProps(src: string, sizes: string) {
  return {
    src,
    sizes,
    decoding: "async" as const,
    srcSet: canUseSrcSet(src)
      ? RESPONSIVE_WIDTHS.map((width) => `${src} ${width}w`).join(", ")
      : undefined,
  };
}
