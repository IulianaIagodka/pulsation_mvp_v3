import { goToTrigger } from "./go-to-trigger";

describe("goToTrigger", () => {
  it("no-ops when already on trigger", () => {
    const router = {
      dismissTo: jest.fn(),
      dismissAll: jest.fn(),
      replace: jest.fn(),
    };

    goToTrigger(router as never, "/trigger");

    expect(router.dismissTo).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("pops return via back when the stack allows it", () => {
    const router = {
      canGoBack: () => true,
      back: jest.fn(),
      dismissTo: jest.fn(),
      dismissAll: jest.fn(),
      replace: jest.fn(),
    };

    goToTrigger(router as never, "/return");

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  it("dismisses to trigger when back is unavailable", () => {
    const router = {
      canGoBack: () => false,
      back: jest.fn(),
      dismissTo: jest.fn(),
      dismissAll: jest.fn(),
      replace: jest.fn(),
    };

    goToTrigger(router as never, "/return");

    expect(router.back).not.toHaveBeenCalled();
    expect(router.dismissTo).toHaveBeenCalledWith("/trigger");
    expect(router.dismissAll).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to dismissAll + replace when dismissTo is missing", () => {
    const router = {
      canDismiss: () => true,
      dismissAll: jest.fn(),
      replace: jest.fn(),
    };

    goToTrigger(router as never, "/return");

    expect(router.dismissAll).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/trigger");
  });
});
