import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import IoTDashboard from "../src/pages/iot_dashboard";

// -------------------------------------
// GLOBAL FIX — STOP TIMER LEAK AFTER TESTS
// -------------------------------------
jest.useFakeTimers();

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
});

// -------------------------------------
// MOCKS
// -------------------------------------

// ---- Mock Expo Audio ----
jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            unloadAsync: jest.fn(),
            replayAsync: jest.fn(),
          },
        })
      ),
    },
  },
}));

// ---- Mock Expo Haptics ----
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Error: "error" },
}));

// ---- Mock Circular Progress ----
jest.mock("react-native-circular-progress", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return {
    AnimatedCircularProgress: ({ children }) =>
      React.createElement(
        View,
        null,
        children ? children({ fill: 100 }) : null
      ),
  };
});

// ---- Mock ChartKit ----
jest.mock("react-native-chart-kit", () => ({
  LineChart: () => null,
}));

// ---- Mock Firebase Config ----
jest.mock("../src/firebase/FirebaseConfig", () => ({
  db: {},
}));

// ---- Firestore mock data store ----
let mockLiveData = {
  temperature: 25,
  humidity: 60,
  soil: 40,
  rainPercent: 10,
};

// ---- Mock Firestore ----
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),

  onSnapshot: jest.fn((ref, callback) => {
    // simulate async Firestore update but controlled
    Promise.resolve().then(() => {
      callback({
        exists: () => true,
        data: () => mockLiveData,
        docs: [],
      });
    });

    // cleanup
    return jest.fn();
  }),
}));

// -------------------------------------
// TESTS
// -------------------------------------

describe("IoTDashboard — Basic Rendering", () => {
  it("shows loading screen initially", () => {
    const screen = render(<IoTDashboard />);
    expect(screen.getByText("Loading IoT data...")).toBeTruthy();
  });

  it("renders the SmartPlant Dashboard title after data loads", async () => {
    const screen = render(<IoTDashboard />);

    await waitFor(() =>
      expect(screen.getByText("🌿 SmartPlant Dashboard")).toBeTruthy()
    );
  });
});

describe("IoTDashboard — Firestore Tests", () => {
  it("renders loading screen initially", () => {
    const screen = render(<IoTDashboard />);
    expect(screen.getByText("Loading IoT data...")).toBeTruthy();
  });

  it("loads dashboard title after Firestore snapshot", async () => {
    const screen = render(<IoTDashboard />);

    await waitFor(() => {
      expect(screen.getByText("🌿 SmartPlant Dashboard")).toBeTruthy();
    });
  });

  it("updates UI when Firestore sends new live readings", async () => {
    mockLiveData = {
      temperature: 28,
      humidity: 55,
      soil: 35,
      rainPercent: 5,
    };

    const screen = render(<IoTDashboard />);

    await waitFor(() => {
      expect(screen.getByText("28.0°C")).toBeTruthy();
      expect(screen.getByText("55.0%")).toBeTruthy();
      expect(screen.getByText("35.0%")).toBeTruthy();
      expect(screen.getByText("5.0%")).toBeTruthy();
    });
  });
});

jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

