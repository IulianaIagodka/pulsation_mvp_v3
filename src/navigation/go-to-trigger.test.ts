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

  it("dismisses to trigger when dismissTo is available", () => {
    const router = {
      dismissTo: jest.fn(),
      dismissAll: jest.fn(),
      replace: jest.fn(),
    };

    goToTrigger(router as never, "/return");

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
