import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import IdentifyPage from "../src/pages/identify";
import { PermissionContext } from "../src/components/PermissionManager";

const renderWithProviders = (ui) =>
  render(
    <PermissionContext.Provider
      value={{
        cameraGranted: true,
        photosGranted: true,
        requestCameraPermission: jest.fn(),
        requestPhotosPermission: jest.fn(),
      }}
    >
      {ui}
    </PermissionContext.Provider>
  );

describe("IdentifyPage Combined Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Single and Multiple mode buttons", () => {
    const screen = renderWithProviders(<IdentifyPage />);
    expect(screen.getByTestId("single-mode-btn")).toBeTruthy();
    expect(screen.getByTestId("multiple-mode-btn")).toBeTruthy();
  });

  it("adds picked image into preview list", async () => {
    const screen = renderWithProviders(<IdentifyPage />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("pick-image-btn"));
    });

    expect(screen.getByTestId("preview-image-0")).toBeTruthy();
  });

  it("removes an image when delete is pressed", async () => {
    const screen = renderWithProviders(<IdentifyPage />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("pick-image-btn"));
    });

    expect(screen.getByTestId("preview-image-0")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("delete-image-0"));
    });

    expect(screen.queryByTestId("preview-image-0")).toBeNull();
  });

  it("calls /predict API when Identify is pressed", async () => {
    const screen = renderWithProviders(<IdentifyPage />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("pick-image-btn"));
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("identify-btn"));
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("navigates to IdentifyOutput after prediction", async () => {
    const screen = renderWithProviders(<IdentifyPage />);
    const nav = require("@react-navigation/native").useNavigation();

    await act(async () => {
      fireEvent.press(screen.getByTestId("pick-image-btn"));
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("identify-btn"));
    });

    expect(nav.navigate).toHaveBeenCalledWith(
      "IdentifyOutput",
      expect.any(Object)
    );
  });
});
