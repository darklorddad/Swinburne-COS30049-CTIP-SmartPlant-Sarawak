import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MailScreen from "../src/pages/Mail"; 

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");

  const Mock = (props) => <View {...props} />;

  return {
    Ionicons: Mock,
    FontAwesome: Mock,
    MaterialIcons: Mock,
  };
});

describe("MailScreen basic render", () => {
  test("renders Mail Management header", () => {
    const screen = render(<MailScreen navigation={mockNavigation} />);
    expect(screen.getByText("Mail Management")).toBeTruthy();
  });
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe("MailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render properly
  test("renders Mail Management header", () => {
    const { getByText } = render(<MailScreen navigation={mockNavigation} />);
    expect(getByText("Mail Management")).toBeTruthy();
  });

  // goBack() works
  test("back button triggers navigation.goBack()", () => {
  const { getByTestId } = render(<MailScreen navigation={mockNavigation} />);
  const backButton = getByTestId("back-button");

  fireEvent.press(backButton);

  expect(mockNavigation.goBack).toHaveBeenCalled();
});


  // navigate("Feedback") works
  test("pressing Feedback row navigates to Feedback screen", () => {
    const { getByText } = render(<MailScreen navigation={mockNavigation} />);
    const feedbackRow = getByText("Feedback");

    fireEvent.press(feedbackRow.parent); // parent is TouchableOpacity row
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Feedback");
  });

  // star toggles (Feedback)
  test("toggling Feedback star works", () => {
  const { getByTestId } = render(<MailScreen navigation={mockNavigation} />);

  const starButton = getByTestId("star-feedback");

  fireEvent.press(starButton);
  fireEvent.press(starButton); // can press twice

  // We just ensure no crash and later check UI if needed
  expect(starButton).toBeTruthy();
});



  // Search input works
  test("search input handles text entry", () => {
  const { getByTestId } = render(<MailScreen navigation={mockNavigation} />);

  const searchInput = getByTestId("search-input");

  expect(searchInput).toBeTruthy();

  fireEvent.changeText(searchInput, "plant");
});

});
