const OVERFLOW_SLACK_PX = 4;

type PaddingStyle = {
  padding?: number;
  paddingVertical?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

function flattenPaddingStyle(style: unknown): PaddingStyle {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<PaddingStyle>((acc, item) => ({ ...acc, ...flattenPaddingStyle(item) }), {});
  }
  if (typeof style === "object") {
    return style as PaddingStyle;
  }
  return {};
}

/** True when scrollable content is taller than the viewport (with a small layout slack). */
export function contentOverflows(
  viewportHeight: number,
  contentHeight: number,
  slack = OVERFLOW_SLACK_PX,
): boolean {
  return viewportHeight > 0 && contentHeight > viewportHeight + slack;
}

/** True when the user has not scrolled to the bottom yet. */
export function canScrollDown(
  scrollOffsetY: number,
  viewportHeight: number,
  contentHeight: number,
  slack = OVERFLOW_SLACK_PX,
): boolean {
  return scrollOffsetY + viewportHeight < contentHeight - slack;
}

/** Bottom fade hint — content continues below the visible area. */
export function shouldShowScrollOverflowHint(
  overflows: boolean,
  scrollOffsetY: number,
  viewportHeight: number,
  contentHeight: number,
): boolean {
  return overflows && canScrollDown(scrollOffsetY, viewportHeight, contentHeight);
}

/** Sum vertical padding from a content-container style (array-safe, no RN dependency). */
export function getVerticalContentPadding(style: unknown): { top: number; bottom: number } {
  const flat = flattenPaddingStyle(style);
  const base = typeof flat.padding === "number" ? flat.padding : 0;
  const vertical = typeof flat.paddingVertical === "number" ? flat.paddingVertical : base;
  return {
    top: typeof flat.paddingTop === "number" ? flat.paddingTop : vertical,
    bottom: typeof flat.paddingBottom === "number" ? flat.paddingBottom : vertical,
  };
}
