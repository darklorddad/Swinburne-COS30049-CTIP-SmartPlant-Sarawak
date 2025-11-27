import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import HomepageExpert from "../src/pages/HomepageExpert";

// ---- MOCK NAVIGATION ----
const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

// ---- MOCK FIREBASE AUTH ----
jest.mock("../src/firebase/FirebaseConfig", () => ({
  auth: {
    currentUser: {
      uid: "expert123",
      email: "expert@example.com",
      displayName: "Test Expert",
    },
  },
  db: {},
}));

// ---- MOCK FIRESTORE ----
jest.mock("firebase/firestore", () => {
  // reusable doc builder
  const makeDoc = (id, data) => ({
    id,
    data: () => data
  });

  return {
    collection: jest.fn((db, name) => name),

    query: jest.fn((ref) => ref),
    orderBy: jest.fn(),
    limit: jest.fn(),

    doc: jest.fn((db, col, id) => ({ col, id })),

    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
    increment: jest.fn(() => 1),

    runTransaction: jest.fn((db, fn) =>
      fn({
        get: jest.fn(() =>
          ({ exists: () => true, data: () => ({ liked_by: [] }) })
        ),
        update: jest.fn(),
      })
    ),

    /** ------------------------------
     *  🔥 FULL onSnapshot MOCK
     *  Handles BOTH:
     *   - account
     *   - plant_identify
     * --------------------------------
     */
    onSnapshot: jest.fn((ref, callback) => {
      let snapshot;

      // 🧪 Mock for account collection
      if (ref === "account") {
        const docs = [
          makeDoc("acc1", {
            full_name: "Expert Tester",
            user_id: "expert123",
            email: "expert@test.com",
            profile_pic: null,
          }),
        ];

        snapshot = {
          docs,
          forEach: (fn) => docs.forEach(fn),
        };
      }

      // 🧪 Mock for plant_identify collection
      else if (ref === "plant_identify") {
        const docs = [
          makeDoc("post1", {
            user_id: "user123",
            user_email: "user@test.com",
            ImageURLs: ["https://example.com/img.jpg"],
            locality: "Kuching",
            createdAt: { toMillis: () => Date.now() - 10000 },
            model_predictions: {
              top_1: { plant_species: "Test Plant", ai_score: 0.9 }
            },
            liked_by: [],
            saved_by: [],
            comment_count: 1,
            identify_status: "pending",
          }),
        ];

        snapshot = {
          docs,
          forEach: (fn) => docs.forEach(fn),
        };
      }

      // fallback empty snapshot
      else {
        snapshot = {
          docs: [],
          forEach: (fn) => [],
        };
      }

      callback(snapshot);

      return () => {}; // unsubscribe
    }),
  };
});


// ---- MOCK ASYNC STORAGE ----
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// ---- MOCK ICONS ----
jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

// ---- MOCK IMAGE SLIDER ----
jest.mock("../src/components/ImageSlideShow", () => () => null);

// ---- MOCK BOTTOM NAV ----
jest.mock("../src/components/NavigationExpert", () => () => null);

describe("HomepageExpert Screen", () => {

  test("renders greeting title", async () => {
    const { getByText } = render(<HomepageExpert navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("Good Morning")).toBeTruthy();
    });
  });

  test("renders expert name from Firebase Auth", async () => {
    const { getByText } = render(<HomepageExpert navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("Expert Tester")).toBeTruthy();
    });
  });

  test("renders 'Recent' section", () => {
    const { getByText } = render(<HomepageExpert navigation={mockNavigation} />);
    expect(getByText("Recent")).toBeTruthy();
  });

});
