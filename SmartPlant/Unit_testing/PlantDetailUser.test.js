// Unit_testing/PlantDetailUser.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PlantDetailUser from "../src/pages/PlantDetailUser";

// --- mocks ---

// Mock BottomNav so it doesn't break tests
jest.mock("../src/components/Navigation", () => () => null);

// Mock ImageSlideshow as a simple View
jest.mock("../src/components/ImageSlideShow", () => {
  return function MockImageSlideshow(props) {
    return <></>;
  };
});

// Mock FirebaseConfig (db)
jest.mock("../src/firebase/FirebaseConfig", () => ({
  db: {},
}));

// Mock Firestore functions used inside the component
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
} from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

// helper: default route factory
const makeRoute = (postOverrides = {}) => {
  const basePost = {
    id: "post1",
    author: "Tester",
    time: 1700000000000, // ms timestamp
    locality: "Kuching",
    prediction: [
      {
        plant_species: "Ficus lyrata",
        ai_score: 0.92,
      },
    ],
    conservation_status: "common",
    coordinate: { latitude: 1.23, longitude: 2.34 },
    visible: true,
  };
  return {
    params: {
      post: { ...basePost, ...postOverrides },
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();

  // default onSnapshot: no comments
  onSnapshot.mockImplementation((q, callback) => {
    callback({ docs: [] });
    return jest.fn(); // unsubscribe function
  });

  // default stubs for other functions
  collection.mockReturnValue({});
  query.mockReturnValue({});
  orderBy.mockReturnValue({});
  doc.mockReturnValue({});
  getDoc.mockResolvedValue({ exists: () => false });
});

describe("PlantDetailUser screen", () => {
  test("renders scientific name and conservation status pill", () => {
    const route = makeRoute();
    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    // Label
    expect(getByText("Scientific Name:")).toBeTruthy();
    // From prediction[0].plant_species
    expect(getByText("Ficus lyrata")).toBeTruthy();
    // Conservation status pill text
    expect(getByText("Common")).toBeTruthy();
  });

  test("uses manual_scientific_name when present", () => {
    const route = makeRoute({
      manual_scientific_name: "Manualus plantus",
    });

    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    expect(getByText("Manualus plantus")).toBeTruthy();
  });

  test("View on Map button is enabled and navigates with correct params", () => {
    const route = makeRoute({
      manual_scientific_name: "MapPlantus",
      coordinate: { latitude: 1.5, longitude: 110.3 },
      visible: true,
    });

    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    const viewOnMapText = getByText("View on Map");
    const button = viewOnMapText.parent; // TouchableOpacity

    expect(button.props.disabled).toBeFalsy();

    fireEvent.press(button);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("MapPage", {
      focus: {
        latitude: 1.5,
        longitude: 110.3,
        title: "MapPlantus",
      },
      focusMarkerId: "post1",
    });
  });

  test("View on Map button is disabled when visible=false", () => {
    const route = makeRoute({
      visible: false,
      coordinate: { latitude: 1.5, longitude: 110.3 },
    });

    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    const viewOnMapText = getByText("View on Map");
    const button = viewOnMapText.parent.parent;

    // Use RTL matcher instead of raw prop
    expect(button).toBeDisabled();

    fireEvent.press(button);
    expect(mockNavigation.navigate).not.toHaveBeenCalled();

  });

  test("shows 'No comments yet.' when there are no comments", () => {
    const route = makeRoute();

    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    expect(getByText("No comments yet.")).toBeTruthy();
  });

  test("renders live comments from Firestore", async () => {
    // override onSnapshot for this test to return one comment
    onSnapshot.mockImplementation((q, callback) => {
      callback({
        docs: [
          {
            id: "c1",
            data: () => ({
              text: "Nice plant!",
              user_id: "anon",
              user_name: "Commenter",
              createdAt: { seconds: 1000 },
            }),
          },
        ],
      });
      return jest.fn();
    });

    const route = makeRoute();

    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    await waitFor(() => {
      expect(getByText("Nice plant!")).toBeTruthy();
      expect(getByText("Commenter")).toBeTruthy();
    });
  });

  test("Top Suggestion button navigates to TopSuggestions with post", () => {
    const route = makeRoute();

    const { getByText } = render(
      <PlantDetailUser navigation={mockNavigation} route={route} />
    );

    const button = getByText("Top Suggestion");
    fireEvent.press(button);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("TopSuggestions", {
      post: route.params.post,
    });
  });
});
