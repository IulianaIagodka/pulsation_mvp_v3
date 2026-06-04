import {
  isPressableHighlighted,
  resolvePressableTextOpacity,
} from "./pressable-highlight";

describe("pressable-highlight", () => {
  it("leaves idle opacity unchanged", () => {
    expect(resolvePressableTextOpacity(0.48, 0.72, { hovered: false, focused: false, pressed: false })).toBe(
      0.48,
    );
  });

  it("brightens on hover and focus", () => {
    expect(resolvePressableTextOpacity(0.48, 0.72, { hovered: true, focused: false, pressed: false })).toBe(
      0.84,
    );
    expect(resolvePressableTextOpacity(0.48, 0.72, { hovered: false, focused: true, pressed: false })).toBe(
      0.84,
    );
  });

  it("brightens further on press", () => {
    expect(resolvePressableTextOpacity(0.48, 0.72, { hovered: false, focused: false, pressed: true })).toBe(
      0.89,
    );
  });

  it("caps at full opacity", () => {
    expect(resolvePressableTextOpacity(0.95, 1, { hovered: true, focused: false, pressed: false })).toBe(1);
  });

  it("detects highlighted interaction state", () => {
    expect(isPressableHighlighted({ hovered: true, focused: false, pressed: false })).toBe(true);
    expect(isPressableHighlighted({ hovered: false, focused: false, pressed: false })).toBe(false);
  });
});
