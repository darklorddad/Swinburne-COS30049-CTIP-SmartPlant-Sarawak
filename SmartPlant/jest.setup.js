import "@testing-library/jest-native/extend-expect";

const originalConsoleError = console.error;

jest.spyOn(console, "error").mockImplementation((message, ...args) => {
  if (
    typeof message === "string" &&
    (message.includes("act(") || message.includes("not wrapped in act"))
  ) {
    return;
  }
  return originalConsoleError(message, ...args);
});


global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ reply: "Mocked AI reply" }),
});

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "mock-img.jpg" }],
    })
  ),
  MediaTypeOptions: { Images: "Images" },
  getMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
}));

jest.mock("@react-navigation/native", () => {
  const React = require("react");
  
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({ params: { mode: "single" } }),
    useIsFocused: () => true,
    NavigationContainer: ({ children }) =>
      React.createElement("View", null, children),
  };
});



jest.mock("./src/components/PermissionManager", () => {
  const React = require("react");

  const PermissionContext = React.createContext({
    cameraGranted: true,
    photosGranted: true,
    requestCameraPermission: jest.fn(),
    requestPhotosPermission: jest.fn(),
  });

  const PermissionProvider = ({ children }) =>
    React.createElement(PermissionContext.Provider, {
      value: {
        cameraGranted: true,
        photosGranted: true,
        requestCameraPermission: jest.fn(),
        requestPhotosPermission: jest.fn(),
      },
      children,
    });

  return {
    PermissionContext,
    PermissionProvider,
  };
});



jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) =>
      React.createElement("View", null, children),
    SafeAreaView: ({ children }) =>
      React.createElement("View", null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
  };
});


jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function MockDateTimePicker() {
    return React.createElement(
      View,
      null,
      React.createElement(Text, null, "Mock DateTimePicker")
    );
  };
});


jest.mock("react-native-get-random-values", () => ({}));

jest.mock(
  "react-native/Libraries/Animated/NativeAnimatedHelper",
  () => ({}),
  { virtual: true }
);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => null),
  clear: jest.fn(async () => null),
}));


jest.mock(
  "react-native/Libraries/EventEmitter/NativeEventEmitter",
  () => {
    return class MockNativeEventEmitter {
      addListener = jest.fn();
      removeAllListeners = jest.fn();
      removeListener = jest.fn();
    };
  },
  { virtual: true }
);


jest.mock("./src/components/Navigation.js", () => () => null);

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: ({ name, size, color }) =>
      React.createElement("Icon", { name, size, color }),
    MaterialIcons: ({ name, size, color }) =>
      React.createElement("Icon", { name, size, color }),
    Entypo: ({ name, size, color }) =>
      React.createElement("Icon", { name, size, color }),
  };
});

jest.mock("react-native/Libraries/Modal/Modal", () => ({
  ...jest.requireActual("react-native/Libraries/Modal/Modal"),
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: jest.fn(),
  default: () => null,
}));

jest.mock("expo-modules-core", () => ({
  Platform: { OS: "android" },
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(),
  createModuleProxy: jest.fn(),
  requireNativeViewManager: jest.fn(() => "MockedViewManager"),
  LegacyEventEmitter: class LegacyEventEmitter {},   
  CodedError: class CodedError extends Error {},
}));


jest.mock("expo-camera", () => ({
  CameraView: jest.fn().mockImplementation(({ children }) => children),
  useCameraPermissions: () => [true, jest.fn()],
  Camera: {
    getCameraPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
  },
}));

jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  MediaType: { photo: "photo" },
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestBackgroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 0, longitude: 0 },
    })
  ),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([])),
  hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: jest.fn(),
}));

jest.mock("./src/firebase/notification_user/addNotification", () => ({
  addNotification: jest.fn(() => Promise.resolve("mock_noti_id")),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        label: "Fern",
        confidence: 0.88,
        top3: [
          { class: "Fern", confidence: 0.88 },
          { class: "PlantB", confidence: 0.40 },
          { class: "PlantC", confidence: 0.30 },
        ],
      }),
  })
);

jest.mock("./src/components/Navigation.js", () => () => null);

jest.mock("./src/firebase/FirebaseConfig", () => ({
  auth: { currentUser: null },
  db: {},
}));
