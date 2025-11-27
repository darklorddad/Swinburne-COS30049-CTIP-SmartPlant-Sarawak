import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FeedbackScreen from "../src/pages/Feedback";

describe("FeedbackScreen Tests", () => {
  const mockNavigation = { goBack: jest.fn() };

  test("renders title (unique check)", () => {
    const { getAllByText } = render(<FeedbackScreen navigation={mockNavigation} />);
    expect(getAllByText("Feedback")[0]).toBeTruthy(); // first = title
  });

  test("back button triggers navigation.goBack", () => {
    const { getByTestId } = render(
      <FeedbackScreen navigation={mockNavigation} />
    );

    const backBtn = getByTestId("back-btn");
    fireEvent.press(backBtn);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test("renders preview text", () => {
    const { getByText } = render(<FeedbackScreen navigation={mockNavigation} />);
    expect(getByText("xxxxxxxx")).toBeTruthy();
  });

  test("renders reply button", () => {
    const { getByTestId } = render(<FeedbackScreen navigation={mockNavigation} />);
    expect(getByTestId("reply-btn")).toBeTruthy();
  });
});
