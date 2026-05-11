const RESPONSIVE_WIDTHS = [160, 320, 640, 960, 1280] as const;
const DEFAULT_MENU_IMAGE_SRC_SET =
  "/Menus-320.jpg 320w, /Menus-640.jpg 640w, /Menus-800.jpg 800w, /Menus-960.jpg 960w";

function canUseSrcSet(src: string) {
  return !src.startsWith("data:") && !src.startsWith("blob:");
}

export function getResponsiveImageProps(src: string, sizes: string) {
  return {
    src,
    sizes,
    decoding: "async" as const,
    srcSet: src === "/Menus-800.jpg"
      ? DEFAULT_MENU_IMAGE_SRC_SET
      : canUseSrcSet(src)
      ? RESPONSIVE_WIDTHS.map((width) => `${src} ${width}w`).join(", ")
      : undefined,
  };
}
