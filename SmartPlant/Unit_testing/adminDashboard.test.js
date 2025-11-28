import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../src/admin/screens/DashboardScreen';
import { useAdminContext } from '../src/admin/AdminContext';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { Alert, View } from 'react-native';

// Mock AdminContext
jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock('../src/firebase/FirebaseConfig', () => ({
  db: {},
}));

// Mock Icons
jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    UserIcon: () => <View testID="UserIcon" />,
    MailIcon: () => <View testID="MailIcon" />,
    FeedbackIcon: () => <View testID="FeedbackIcon" />,
    LogoutIcon: () => <View testID="LogoutIcon" />,
  };
});

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: ({ name }) => <View testID={`Ionicons-${name}`} />,
  };
});

// Mock BottomNavBar
jest.mock('../src/admin/components/AdminBottomNavBar', () => {
  const { View } = require('react-native');
  return () => <View testID="AdminBottomNavBar" />;
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('DashboardScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockUsers = [
    { firebase_uid: 'uid1', name: 'Admin User', details: { profile_pic: 'http://pic.url' }, color: '#fff' },
    { firebase_uid: 'uid2', name: 'User 2', details: {}, color: '#000' },
  ];
  const mockMails = [
    { read: false }, { read: true }, { read: false }
  ];
  const mockFeedbacks = [
    { admin_notes: '' }, { admin_notes: 'Replied' }, { admin_notes: null }
  ];
  const mockHandleLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useAdminContext.mockReturnValue({
      users: mockUsers,
      mails: mockMails,
      feedbacks: mockFeedbacks,
      handleLogout: mockHandleLogout,
    });

    getAuth.mockReturnValue({
      currentUser: { uid: 'uid1' },
    });

    // Default onSnapshot mock (no alert)
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({ exists: () => false, data: () => null });
      return jest.fn();
    });
  });

  it('renders correctly with user data', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('Admin User')).toBeTruthy();
  });

  it('displays correct greeting based on time', () => {
    const realDate = Date;
    
    // Morning
    global.Date = class extends Date { getHours() { return 9; } };
    const { getByText, unmount } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('Good morning!')).toBeTruthy();
    unmount();

    // Afternoon
    global.Date = class extends Date { getHours() { return 14; } };
    const { getByText: getByText2, unmount: unmount2 } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText2('Good afternoon!')).toBeTruthy();
    unmount2();

    // Evening
    global.Date = class extends Date { getHours() { return 20; } };
    const { getByText: getByText3 } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText3('Good evening!')).toBeTruthy();

    global.Date = realDate;
  });

  it('calculates and displays correct counts', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('2 users')).toBeTruthy();
    expect(getByText('2 unread')).toBeTruthy();
    expect(getByText('2 pending')).toBeTruthy();
  });

  it('navigates to EditUser when profile is pressed', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Admin User'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditUser', { user: mockUsers[0] });
  });

  it('shows alert if user data not found on profile press', () => {
    getAuth.mockReturnValue({ currentUser: { uid: 'unknown_uid' } });
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Admin'));
    expect(Alert.alert).toHaveBeenCalledWith("Error", "Could not find your user data to edit.");
  });

  it('handles logout', () => {
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByTestId('LogoutIcon'));
    expect(mockHandleLogout).toHaveBeenCalledWith(mockNavigation);
  });

  it('renders alert card when alert exists', async () => {
    const mockAlert = {
      type: 'fire',
      message: 'Fire detected!',
      timestamp: { seconds: 1600000000 }
    };

    onSnapshot.mockImplementation((docRef, callback) => {
      callback({ exists: () => true, data: () => mockAlert });
      return jest.fn();
    });

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(getByText('FIRE')).toBeTruthy();
      expect(getByText('Fire detected!')).toBeTruthy();
    });
  });

  it('navigates to AlertHistory on alert press', async () => {
    const mockAlert = { type: 'fire', message: 'Fire detected!' };
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({ exists: () => true, data: () => mockAlert });
      return jest.fn();
    });

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('FIRE'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AlertHistory');
  });

  it('navigates to Accounts on menu press', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Accounts'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AccountManagement');
  });

  it('navigates to Mailbox on menu press', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Mailbox'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('MailManagement');
  });

  it('navigates to Feedback on menu press', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Feedback'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FeedbackManagement');
  });

  it('navigates to IoT Dashboard', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Open IoT Dashboard'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Back');
  });

  it('navigates to AI Chat', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Chat With AI Agent'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AIChatScreen');
  });
});
