import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreatePost from "../src/pages/CreatePost";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// MOCK image picker
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "mock-camera-photo.jpg" }],
    })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "mock-library-photo.jpg" }],
    })
  ),
  MediaTypeOptions: { Images: "Images" },
}));

// MOCK Alert
jest.spyOn(Alert, "alert");

// mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

function createNavWithRoutes(routes) {
  return {
    navigate: mockNavigate,
    goBack: mockGoBack,
    getState: () => ({ routes }),
    getParent: jest.fn(() => null),
  };
}

describe("CreatePost Screen Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly", () => {
    const nav = createNavWithRoutes([]);
    const { getByText } = render(<CreatePost navigation={nav} />);

    expect(getByText("Create Post")).toBeTruthy();
    expect(getByText("No image selected")).toBeTruthy();
  });

  test("typing a caption works", () => {
    const nav = createNavWithRoutes([]);
    const { getByPlaceholderText } = render(<CreatePost navigation={nav} />);

    const input = getByPlaceholderText("Write a caption...");

    fireEvent.changeText(input, "Nice Plant!");

    expect(input.props.value).toBe("Nice Plant!");
  });

  test("alert shows when posting with no image and no caption", () => {
    const nav = createNavWithRoutes([]);
    const { getByText } = render(<CreatePost navigation={nav} />);

    fireEvent.press(getByText("Post"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Nothing to post",
      "Add a photo or write a caption first."
    );
  });

  test("picking a photo from library updates image state", async () => {
    const nav = createNavWithRoutes([]);
    const { getByText, queryByText } = render(<CreatePost navigation={nav} />);

    fireEvent.press(getByText("Library"));

    await waitFor(() => {
      expect(queryByText("No image selected")).toBeNull();
    });
  });

  test("taking photo updates image state", async () => {
    const nav = createNavWithRoutes([]);
    const { getByText, queryByText } = render(<CreatePost navigation={nav} />);

    fireEvent.press(getByText("Camera"));

    await waitFor(() => {
      expect(queryByText("No image selected")).toBeNull();
    });
  });

  test("posts successfully and navigates to HomepageUser", () => {
    const nav = createNavWithRoutes([
      { name: "HomepageUser" },
    ]);

    const { getByPlaceholderText, getByText } = render(
      <CreatePost navigation={nav} />
    );

    const input = getByPlaceholderText("Write a caption...");
    fireEvent.changeText(input, "My new plant!");

    fireEvent.press(getByText("Post"));

    expect(mockNavigate).toHaveBeenCalledWith("HomepageUser", {
      newPost: expect.objectContaining({
        caption: "My new plant!",
      }),
    });
  });

  test("posts successfully and navigates to HomepageExpert", () => {
    const nav = createNavWithRoutes([
      { name: "HomepageExpert" },
    ]);

    const { getByPlaceholderText, getByText } = render(
      <CreatePost navigation={nav} />
    );

    const input = getByPlaceholderText("Write a caption...");
    fireEvent.changeText(input, "Expert plant question");

    fireEvent.press(getByText("Post"));

    expect(mockNavigate).toHaveBeenCalledWith("HomepageExpert", {
      newPost: expect.objectContaining({
        caption: "Expert plant question",
      }),
    });
  });

  test("fallback: goes back if no home route exists", () => {
    const nav = createNavWithRoutes([
      { name: "SomethingElse" },
    ]);

    const { getByPlaceholderText, getByText } = render(
      <CreatePost navigation={nav} />
    );

    fireEvent.changeText(getByPlaceholderText("Write a caption..."), "Test caption");
    fireEvent.press(getByText("Post"));

    expect(mockGoBack).toHaveBeenCalled();
  });
});
