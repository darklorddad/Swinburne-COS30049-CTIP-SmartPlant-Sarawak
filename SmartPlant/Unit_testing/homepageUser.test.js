// Unit_testing/homepageUser.test.js
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import HomepageUser from "../src/pages/HomepageUser";

// Mock Firebase Auth
jest.mock("../src/firebase/FirebaseConfig", () => ({
  auth: {
    currentUser: {
      uid: "user123",
      email: "test@example.com",
      displayName: "Test User",
    },
  },
  db: {}, // db not used directly because we mock Firestore methods below
}));

// Mock getFullProfile
jest.mock("../src/firebase/UserProfile/UserUpdate", () => ({
  getFullProfile: jest.fn().mockResolvedValue({
    full_name: "Test User",
    profile_pic: null,
    user_id: "user123",
  }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("true"),
  setItem: jest.fn().mockResolvedValue(true),
}));

// Firestore mock
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    runTransaction: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
    increment: jest.fn(),

    // onSnapshot needs to behave differently for 2 collections:
    // 1) "account"
    // 2) "plant_identify"
    onSnapshot: jest.fn((ref, callback) => {
      // --- Fake account snapshot (used first) ---
      const accountSnapshot = {
        forEach: (fn) => {
          fn({
            id: "user123",
            data: () => ({
              full_name: "Test User",
              profile_pic: null,
              user_id: "user123",
            }),
          });
        },
        docs: [], // not used for account
      };

      // --- Fake plant_identify snapshot (used second) ---
      const plantSnapshot = {
        docs: [
          {
            id: "post1",
            data: () => ({
              user_id: "user123",
              ImageURLs: ["http://example.com/plant.jpg"],
              model_predictions: {
                top_1: { plant_species: "Test Plant", ai_score: 0.9 },
              },
              createdAt: { toMillis: () => Date.now() },
              identify_status: "verified",
            }),
          },
        ],
        forEach: () => {}, // unused for posts
      };

      // First trigger: accounts
      callback(accountSnapshot);

      // Second trigger: plant posts
      callback(plantSnapshot);

      return jest.fn(); // unsubscribe fn
    }),
  };
});


// Disable Navigation
jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({ params: {} }),
  useFocusEffect: (cb) => cb(),
}));

// Disable BottomNav + Slideshow (they cause errors)
jest.mock("../src/components/Navigation", () => () => null);
jest.mock("../src/components/ImageSlideShow", () => () => null);

describe("HomepageUser", () => {
  it("renders greeting with user name", async () => {
    const { getByText } = render(
      <HomepageUser navigation={{ navigate: jest.fn() }} />
    );

    await waitFor(() => {
      expect(getByText("Good Morning")).toBeTruthy();
      expect(getByText("Test User")).toBeTruthy();
    });
  });

  it("renders recent post section", async () => {
    const { getByText, getAllByText } = render(
      <HomepageUser navigation={{ navigate: jest.fn() }} />
    );

    await waitFor(() => {
      expect(getByText("Recent")).toBeTruthy();

      // Appears both in Recent + Feed list
      const matches = getAllByText("Test Plant");
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
