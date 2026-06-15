import { useAppStore } from "./app-store";

function resetAppStore() {
  useAppStore.setState({
    selectedIntervention: undefined,
    findThreeVariantIndex: undefined,
    circlesPressHandler: null,
    circlesPressHandlerOwnerId: null,
    highContrastPreviewEnabled: false,
  });
}

describe("app store circles press handler ownership", () => {
  beforeEach(resetAppStore);
  afterEach(resetAppStore);

  it("does not let a stale screen cleanup clear the focused screen handler", () => {
    const firstHandler = jest.fn();
    const focusedHandler = jest.fn();

    useAppStore.getState().setCirclesPressHandler(1, firstHandler);
    useAppStore.getState().setCirclesPressHandler(2, focusedHandler);
    useAppStore.getState().clearCirclesPressHandler(1);

    useAppStore.getState().circlesPressHandler?.();

    expect(firstHandler).not.toHaveBeenCalled();
    expect(focusedHandler).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().circlesPressHandlerOwnerId).toBe(2);
  });

  it("clears the handler only for the active owner", () => {
    const handler = jest.fn();

    useAppStore.getState().setCirclesPressHandler(7, handler);
    useAppStore.getState().clearCirclesPressHandler(7);

    expect(useAppStore.getState().circlesPressHandler).toBeNull();
    expect(useAppStore.getState().circlesPressHandlerOwnerId).toBeNull();
  });
});
