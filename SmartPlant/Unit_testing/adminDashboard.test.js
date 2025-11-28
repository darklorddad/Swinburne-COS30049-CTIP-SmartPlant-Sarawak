import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../src/admin/screens/DashboardScreen';
import { useAdminContext } from '../src/admin/AdminContext';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';

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
  const { Text } = require('react-native');
  return {
    UserIcon: () => <Text>UserIcon</Text>,
    MailIcon: () => <Text>MailIcon</Text>,
    FeedbackIcon: () => <Text>FeedbackIcon</Text>,
    LogoutIcon: () => <Text>LogoutIcon</Text>,
  };
});

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }) => <Text>Ionicons-{name}</Text>,
  };
});

// Mock BottomNavBar
jest.mock('../src/admin/components/AdminBottomNavBar', () => {
  const { Text } = require('react-native');
  return () => <Text>AdminBottomNavBar</Text>;
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('DashboardScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockUsers = [
    { firebase_uid: 'uid1', name: 'Admin User', details: { profile_pic: 'http://pic.com' }, color: '#fff' },
    { firebase_uid: 'uid2', name: 'User 2', details: {}, color: '#000' },
  ];
  const mockMails = [
    { read: false }, { read: true }, { read: false }
  ]; // 2 unread
  const mockFeedbacks = [
    { admin_notes: '' }, { admin_notes: 'Replied' }, { admin_notes: null }
  ]; // 2 pending

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

    // Default snapshot mock for alerts (no alert)
    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        exists: () => false,
        data: () => ({}),
      });
      return jest.fn(); // unsubscribe
    });
  });

  test('renders correctly with user data and stats', async () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);

    expect(getByText('Admin User')).toBeTruthy();
    expect(getByText('2 users')).toBeTruthy(); // users.length
    expect(getByText('2 unread')).toBeTruthy(); // unread mails
    expect(getByText('2 pending')).toBeTruthy(); // pending feedbacks
  });

  test('handles greeting based on time (morning)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 1, 1, 9, 0, 0)); // 9 AM

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('Good morning!')).toBeTruthy();

    jest.useRealTimers();
  });

  test('handles greeting based on time (afternoon)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 1, 1, 14, 0, 0)); // 2 PM

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('Good afternoon!')).toBeTruthy();

    jest.useRealTimers();
  });

  test('handles greeting based on time (evening)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 1, 1, 20, 0, 0)); // 8 PM

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('Good evening!')).toBeTruthy();

    jest.useRealTimers();
  });

  test('navigates to EditUser when profile is pressed', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Admin User'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditUser', { user: mockUsers[0] });
  });

  test('shows alert if user data not found for edit', () => {
    getAuth.mockReturnValue({ currentUser: { uid: 'unknown' } });

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    
    // When user is not found, name defaults to 'Admin' (initial state)
    fireEvent.press(getByText('Admin')); 
    
    expect(Alert.alert).toHaveBeenCalledWith("Error", "Could not find your user data to edit.");
  });

  test('calls handleLogout when logout icon is pressed', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('LogoutIcon'));
    expect(mockHandleLogout).toHaveBeenCalledWith(mockNavigation);
  });
  
  test('displays latest alert and navigates to AlertHistory', async () => {
    const mockAlert = {
      type: 'fire',
      message: 'Fire detected!',
      timestamp: { seconds: 1672531200 }, // 2023-01-01
    };

    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        exists: () => true,
        data: () => mockAlert,
      });
      return jest.fn();
    });

    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('FIRE')).toBeTruthy();
      expect(getByText('Fire detected!')).toBeTruthy();
    });

    fireEvent.press(getByText('FIRE'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AlertHistory');
  });

  test('navigates to AccountManagement', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Accounts'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AccountManagement');
  });

  test('navigates to MailManagement', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Mailbox'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('MailManagement');
  });

  test('navigates to FeedbackManagement', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Feedback'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FeedbackManagement');
  });

  test('navigates to IoT Dashboard (Back)', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Open IoT Dashboard'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Back');
  });

  test('navigates to AI Chat', () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Chat With AI Agent'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AIChatScreen');
  });

  test('renders default avatar if no profile pic', () => {
     useAdminContext.mockReturnValue({
      users: [{ firebase_uid: 'uid1', name: 'No Pic User', details: { profile_pic: null }, color: '#123456' }],
      mails: [],
      feedbacks: [],
      handleLogout: mockHandleLogout,
    });
    
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />);
    expect(getByText('N')).toBeTruthy(); // First char of 'No Pic User'
  });
});
