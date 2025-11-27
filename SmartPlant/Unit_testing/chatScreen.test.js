import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ChatScreen from "../src/pages/AIChatScreen";
import { Alert } from "react-native";

// ---- MOCK API URL ----
jest.mock("../src/config", () => ({
  API_URL: "http://mock-api",
}));

// ---- MOCK UUID ----
jest.mock("uuid", () => ({
  v4: () => "mock-session-id",
}));

// ---- MOCK FETCH ----
global.fetch = jest.fn();

// ---- MOCK NAVIGATION ----
const mockGoBack = jest.fn();
const createNavigation = () => ({
  goBack: mockGoBack,
});

// ---- MOCK ICONS ----
jest.mock("@expo/vector-icons/Entypo", () => {
  const React = require("react");
  return ({ name, size, color }) =>
    React.createElement("Icon", { name, size, color });
});

describe("ChatScreen Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders initial AI welcome message", () => {
    const navigation = createNavigation();

    const { getByText } = render(<ChatScreen navigation={navigation} />);

    expect(
      getByText("Hello! I’m your AI plant assistant 🌱")
    ).toBeTruthy();
  });

  test("typing updates input field", () => {
    const navigation = createNavigation();
    const { getByPlaceholderText } = render(
      <ChatScreen navigation={navigation} />
    );

    const input = getByPlaceholderText("Ask something...");

    fireEvent.changeText(input, "Hello");

    expect(input.props.value).toBe("Hello");
  });

  test("sending a message adds user message", async () => {
    const navigation = createNavigation();

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ reply: "AI reply text" }),
    });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <ChatScreen navigation={navigation} />
    );

    const input = getByPlaceholderText("Ask something...");

    fireEvent.changeText(input, "Hi AI");
    fireEvent.press(getByText("Send"));

    await waitFor(() => {
      expect(queryByText("Hi AI")).toBeTruthy();
    });
  });

  test("AI reply is added after API response", async () => {
    const navigation = createNavigation();

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ reply: "This is an AI response." }),
    });

    const { getByText, getByPlaceholderText } = render(
      <ChatScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Ask something..."), "Test");
    fireEvent.press(getByText("Send"));

    await waitFor(() => {
      expect(getByText("This is an AI response.")).toBeTruthy();
    });
  });

  test("shows fallback message if API fails", async () => {
    const navigation = createNavigation();

    fetch.mockRejectedValueOnce(new Error("Network error"));

    const { getByText, getByPlaceholderText } = render(
      <ChatScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Ask something..."), "Hello");
    fireEvent.press(getByText("Send"));

    await waitFor(() => {
      expect(
        getByText("⚠️ Failed to connect to the AI agent.")
      ).toBeTruthy();
    });
  });

  test("closing chat triggers end-session & navigation.goBack", async () => {
    const navigation = createNavigation();

    fetch.mockResolvedValueOnce({}); // end-session mock

    const { getByRole } = render(
      <ChatScreen navigation={navigation} />
    );

    const icon = getByRole("button");

    fireEvent.press(icon);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://mock-api/end-session", expect.anything());
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
  beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

});
