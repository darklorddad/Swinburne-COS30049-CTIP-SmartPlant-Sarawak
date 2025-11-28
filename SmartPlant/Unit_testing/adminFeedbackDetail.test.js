import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FeedbackDetailScreen from '../src/admin/screens/FeedbackDetailScreen';
import { useAdminContext } from '../src/admin/AdminContext';
import { onSnapshot, addDoc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { auth } from '../src/firebase/FirebaseConfig';

// Mock Context
jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'mock-collection-ref'),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock('../src/firebase/FirebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'admin1', displayName: 'Admin' } },
}));

jest.mock('../src/firebase/notification_user/addNotification', () => ({
  addNotification: jest.fn(),
}));

jest.mock('../src/firebase/UserProfile/getDisplayName', () => ({
  getDisplayName: jest.fn().mockResolvedValue('Admin'),
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
    TrashIcon: () => <View testID="TrashIcon" />,
  };
});

jest.mock('../src/admin/components/AdminBottomNavBar', () => {
    const { View } = require('react-native');
    return () => <View testID="AdminBottomNavBar" />;
});

describe('FeedbackDetailScreen', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockFeedback = {
    id: 'f1',
    title: 'Issue',
    details: 'Details',
    user_id: 'u1',
  };
  const mockHandleDeleteFeedback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminContext.mockReturnValue({
      feedbacks: [mockFeedback],
      users: [],
      handleDeleteFeedback: mockHandleDeleteFeedback,
    });

    // Mock onSnapshot to return some messages
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        docs: [
          { id: 'msg1', data: () => ({ text: 'User msg', senderId: 'u1', createdAt: { seconds: 1000 } }) },
          { id: 'msg2', data: () => ({ text: 'Admin reply', senderId: 'admin1', createdAt: { seconds: 2000 } }) },
        ],
      });
      return jest.fn(); // unsubscribe
    });
  });

  it('renders feedback details and messages', async () => {
    const { getByText } = render(<FeedbackDetailScreen route={{ params: { feedback: mockFeedback } }} navigation={mockNavigation} />);
    
    expect(getByText('Issue')).toBeTruthy();
    expect(getByText('Details')).toBeTruthy();
    
    await waitFor(() => {
      expect(getByText('User msg')).toBeTruthy();
      expect(getByText('Admin reply')).toBeTruthy();
    });
  });

  it('sends a reply', async () => {
    // Mock parent doc fetch for notification logic
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ user_id: 'u1' }),
    });

    const { getByPlaceholderText, getByText } = render(<FeedbackDetailScreen route={{ params: { feedback: mockFeedback } }} navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Type your reply...'), 'New Reply');
    fireEvent.press(getByText('Send'));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(), // collection ref
        expect.objectContaining({ text: 'New Reply', senderId: 'admin1' })
      );
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  it('deletes feedback', () => {
    const { getByTestId } = render(<FeedbackDetailScreen route={{ params: { feedback: mockFeedback } }} navigation={mockNavigation} />);
    fireEvent.press(getByTestId('TrashIcon'));
    expect(mockHandleDeleteFeedback).toHaveBeenCalledWith('f1');
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
