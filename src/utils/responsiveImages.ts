const DEFAULT_MENU_IMAGE_SRC_SET =
  "/Menus-320.jpg 320w, /Menus-640.jpg 640w, /Menus-672.jpg 672w, /Menus-800.jpg 800w, /Menus-960.jpg 960w";
const DEFAULT_MENU_IMAGE_WEBP_SRC_SET =
  "/Menus-320.webp 320w, /Menus-640.webp 640w, /Menus-672.webp 672w, /Menus-800.webp 800w, /Menus-960.webp 960w";
const DEFAULT_MENU_IMAGE_URLS = new Set(["/Menus-672.jpg", "/Menus-800.jpg"]);

export function getResponsiveImageProps(src: string, sizes: string) {
  return {
    src,
    sizes,
    decoding: "async" as const,
    srcSet: DEFAULT_MENU_IMAGE_URLS.has(src) ? DEFAULT_MENU_IMAGE_SRC_SET : undefined,
  };
}

export function getResponsiveWebpSourceProps(src: string, sizes: string) {
  return {
    type: "image/webp",
    sizes,
    srcSet: DEFAULT_MENU_IMAGE_URLS.has(src) ? DEFAULT_MENU_IMAGE_WEBP_SRC_SET : undefined,
  };
}
