import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import MyPost from "../src/pages/MyPost";

// Mock Expo Icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { Ionicons: (props) => <View {...props} /> };
});

// Mock Image Slideshow
jest.mock("../src/components/ImageSlideShow", () => {
  return () => <></>;
});

// Mock Firebase Config
jest.mock("../src/firebase/FirebaseConfig", () => ({
  auth: {
    currentUser: {
      uid: "user123",
      email: "test@example.com",
      displayName: "Test User",
    },
  },
  db: {},
}));

// Mock Firestore functions
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

describe("MyPost screen", () => {
  beforeEach(() => jest.clearAllMocks());

  // -------------------------------
  // Test 1: User has no posts
  // -------------------------------
  test("shows message when no posts exist", async () => {
    const { getDocs } = require("firebase/firestore");

    getDocs
      .mockResolvedValueOnce({ empty: true })  // account query
      .mockResolvedValueOnce({ empty: true }); // posts query

    const { getByTestId } = render(<MyPost navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByTestId("no-post-text")).toBeTruthy();
    });
  });

  // -------------------------------
  // Test 2: User has a post
  // -------------------------------
  test("renders user posts when Firestore returns data", async () => {
    const { getDocs } = require("firebase/firestore");

    getDocs
      .mockResolvedValueOnce({
        empty: false,  
        docs: [{ data: () => ({ full_name: "Test User" }) }],
      }) // first call: account
      .mockResolvedValueOnce({
        empty: false,  
        docs: [
          {
            id: "post1",
            data: () => ({
              caption: "A test post",
              ImageURLs: ["https://example.com/img.jpg"],
              locality: "Forest",
              model_predictions: { top_1: { plant_species: "Fern" } },
              like_count: 10,
              comment_count: 3,
              liked_by: ["user123"],
              saved_by: ["user123"],
              user_id: "user123",
              createdAt: { seconds: 1000 },
            }),
          },
        ],
      }); // second call: posts

    const { getByTestId } = render(<MyPost navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByTestId("post-item")).toBeTruthy();
    });
  });
});
