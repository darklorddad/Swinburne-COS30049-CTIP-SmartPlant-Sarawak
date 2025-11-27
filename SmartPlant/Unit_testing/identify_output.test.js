import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ResultScreen from "../src/pages/identify_output";
import { Alert } from "react-native";

// ---- MOCK NAVIGATION ----
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({
    params: {
      prediction: [
        { class: "Test Plant", confidence: 0.4 },
        { class: "Alt Plant", confidence: 0.3 },
        { class: "Third Plant", confidence: 0.2 },
      ],
      imageURI: ["test://image1.jpg"]
    }
  }),
  useNavigation: () => ({
    navigate: mockNavigate,
    setParams: jest.fn()
  }),
}));

// ---- MOCK FIREBASE CONFIG ----
jest.mock("../src/firebase/FirebaseConfig", () => ({
  auth: { currentUser: { uid: "user123", email: "user@test.com" } },
  db: {},
  storage: {},
}));

// ---- MOCK FIRESTORE ----
jest.mock("firebase/firestore", () => ({
  serverTimestamp: jest.fn(() => "SERVER_TIME"),
  addDoc: jest.fn(async () => ({ id: "mockDocID" })),
  collection: jest.fn(() => "collection_ref"),
  doc: jest.fn(() => "doc_ref"),
  getDoc: jest.fn(async () => ({
    exists: () => true,
    data: () => ({
      verification: { assignedExperts: ["exp1"] }
    }),
  })),
  updateDoc: jest.fn(async () => {}),
}));

// ---- MOCK uploadImage ----
jest.mock("../src/firebase/plant_identify/uploadImage", () => ({
  uploadImage: jest.fn(async () => "https://mockuploaded.com/pic.jpg"),
}));

// ---- MOCK addPlantIdentify ----
jest.mock("../src/firebase/plant_identify/addPlantIdentify", () => ({
  addPlantIdentify: jest.fn(async () => "newPlantID123"),
}));

// ---- MOCK Expert assignment ----
jest.mock("../src/firebase/verification/assignExpertsAndNotify", () =>
  jest.fn(async () => true)
);

// ---- MOCK Notification ----
jest.mock("../src/firebase/notification_user/updateNotificationPayload", () => ({
  updateNotificationPayload: jest.fn(async () => {}),
}));

// ---- MOCK getDisplayName ----
jest.mock("../src/firebase/UserProfile/getDisplayName", () => ({
  getDisplayName: jest.fn(async () => "Test User"),
}));

// ---- MOCK Encryption ----
jest.mock("../src/utils/Encryption", () => ({
  encrypt: jest.fn((x) => x),
}));

// ---- MOCK Expo Location ----
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 1.234, longitude: 5.678 }
  })),
  reverseGeocodeAsync: jest.fn(async () => [
    { city: "Kuching", region: "Sarawak" },
  ]),
}));

// ---- MOCK EXIF ----
jest.mock("expo-image-picker", () => ({
  getExifAsync: jest.fn(async () => ({ GPSLatitude: 1.234, GPSLongitude: 5.678 })),
}));

// ---- MOCK Heatmap API ----
global.fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({ heatmaps: ["https://mockheatmap.com/h1.jpg"] }),
}));

// ---- MOCK Alert ----
jest.spyOn(Alert, "alert");

// ---------------------------------------
// ------------ TEST SUITE ---------------
// ---------------------------------------

describe("ResultScreen FULL FLOW", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  test("renders UI components", () => {
    const { getByText } = render(<ResultScreen />);
    expect(getByText("AI Identification Result")).toBeTruthy();
    expect(getByText("Done")).toBeTruthy();
  });

  test("LOW CONFIDENCE — shows expert review message", () => {
    const { getByText } = render(<ResultScreen />);
    expect(
      getByText(/confidence score is too low/i)
    ).toBeTruthy();
  });

  test("clicking DONE triggers Alert confirmation", async () => {
    const { getByText } = render(<ResultScreen />);
    fireEvent.press(getByText("Done"));

    expect(Alert.alert).toHaveBeenCalled();
  });

  const flushPromises = () => new Promise(setImmediate);

  test("heatmap button triggers fetch and displays heatmap", async () => {
    const { getByTestId } = render(<ResultScreen />);

    // find circle button
    const heatmapButton = getByTestId("heatmap-button");
    fireEvent.press(heatmapButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
