import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditProfile from "../src/pages/EditProfile";
import { Alert } from "react-native";

// ---- MOCK NAVIGATION + ROUTE ----
const mockNavigateReplace = jest.fn();
const mockSetOptions = jest.fn();

const createNavigation = () => ({
  replace: mockNavigateReplace,
  setOptions: mockSetOptions,
});

// mock route.params
const mockRoute = {
  params: { email: "test@example.com" },
};

// ---- MOCK SAFE AREA ----
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

// ---- MOCK REACT NAVIGATION HOOKS ----
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => mockRoute,
  useNavigation: () => createNavigation(),
}));

// ---- MOCK FIREBASE PROFILE FETCH ----
jest.mock("../src/firebase/UserProfile/UserUpdate", () => ({
  getFullProfile: jest.fn(() =>
    Promise.resolve({
      full_name: "John Doe",
      phone_number: "0123456789",
      address: "Test Street",
      gender: "Male",
      date_of_birth: "2000-01-01",
      nric: "123456-12-1234",
      division: "Test District",
      postcode: "93000",
      race: "Test Race",
      occupation: "Tester",
      profile_pic: null,
      user_id: "abc123",
    })
  ),
}));

// ---- MOCK FIREBASE PROFILE UPDATE ----
jest.mock("../src/firebase/UserProfile/ProfileUpdate", () => ({
  updateUserProfile: jest.fn(() => Promise.resolve()),
}));

// ---- MOCK FIREBASE STORAGE ----
jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve("https://fake-url.com/image.jpg")),
}));

// ---- MOCK FIREBASE CONFIG ----
jest.mock("../src/firebase/FirebaseConfig", () => ({
  storage: {},
  auth: {
    currentUser: { uid: "123", email: "test@example.com" },
  },
}));

// ---- MOCK PASSWORD UPDATE ----
jest.mock("firebase/auth", () => ({
  updatePassword: jest.fn(() => Promise.resolve()),
}));

// ---- MOCK IMAGE PICKER ----
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "mock-image.jpg" }],
    })
  ),
  MediaTypeOptions: { Images: "Images" },
}));

// ---- MOCK ALERT ----
jest.spyOn(Alert, "alert");

describe("EditProfile Screen Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders profile information", async () => {
  const navigation = createNavigation();

  const { getByDisplayValue } = render(
    <EditProfile navigation={navigation} route={mockRoute} />
  );

  await waitFor(() => {
    expect(getByDisplayValue("John Doe")).toBeTruthy();
    expect(getByDisplayValue("0123456789")).toBeTruthy();
    expect(getByDisplayValue("Test Street")).toBeTruthy();
    expect(getByDisplayValue("93000")).toBeTruthy();
  });
});


  test("clicking change picture opens gallery", async () => {
    const navigation = createNavigation();
    const { getByText } = render(
      <EditProfile navigation={navigation} route={mockRoute} />
    );

    await waitFor(() => {
      fireEvent.press(getByText("Change Profile Picture"));
    });

    expect(
      require("expo-image-picker").launchImageLibraryAsync
    ).toHaveBeenCalled();
  });

  test("shows alert on invalid full name", async () => {
    const navigation = createNavigation();

    const { getByDisplayValue, getByText } = render(
      <EditProfile navigation={navigation} route={mockRoute} />
    );

    await waitFor(() => {});

    const input = getByDisplayValue("John Doe");

    fireEvent.changeText(input, "A"); // too short name
    fireEvent.press(getByText("Save Changes"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Invalid Name",
      "Full name must be at least 3 characters long."
    );
  });

  test("successful save updates profile & navigates", async () => {
    const navigation = createNavigation();
    const { getByText } = render(
      <EditProfile navigation={navigation} route={mockRoute} />
    );

    await waitFor(() => {});

    fireEvent.press(getByText("Save Changes"));

    await waitFor(() => {
      expect(
        require("../src/firebase/UserProfile/ProfileUpdate").updateUserProfile
      ).toHaveBeenCalled();
      expect(mockNavigateReplace).toHaveBeenCalledWith("Profile", {
        userEmail: "test@example.com",
      });
    });
  });

  test("password mismatch shows alert", async () => {
    const navigation = createNavigation();
    const { getByText, getAllByDisplayValue, getByPlaceholderText } = render(
      <EditProfile navigation={navigation} route={mockRoute} />
    );

    await waitFor(() => {});

    const newPass = getAllByDisplayValue("")[0];
    const confirmPass = getAllByDisplayValue("")[1];

    fireEvent.changeText(newPass, "abc123");
    fireEvent.changeText(confirmPass, "wrongpass");

    fireEvent.press(getByText("Save Changes"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Passwords do not match"
    );
  });
});
