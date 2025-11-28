import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AlertHistoryScreen from '../src/admin/screens/AlertHistory';
import { getDocs, deleteDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock('../src/firebase/FirebaseConfig', () => ({
  db: {},
}));

jest.mock('../src/utils/Encryption', () => ({
  decrypt: jest.fn(() => ({ latitude: 1.23, longitude: 4.56 })),
}));

// Mock Swipeable (just render children)
jest.mock('react-native-gesture-handler/Swipeable', () => {
  const { View } = require('react-native');
  return ({ children, renderRightActions }) => (
    <View testID="Swipeable">
      {children}
      {renderRightActions && renderRightActions()}
    </View>
  );
});

describe('AlertHistoryScreen', () => {
  const mockAlerts = [
    { id: 'a1', type: 'fire', message: 'Fire detected', timestamp: { seconds: 1600000000 }, coordinate: 'enc' },
    { id: 'a2', type: 'rain', message: 'Rain detected', timestamp: { seconds: 1500000000 } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: mockAlerts.map(a => ({ id: a.id, data: () => a })),
    });
  });

  it('renders alerts list', async () => {
    const { getByText } = render(<AlertHistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('🚨 FIRE')).toBeTruthy();
      expect(getByText('Fire detected')).toBeTruthy();
      expect(getByText('🚨 RAIN')).toBeTruthy();
    });
  });

  it('filters alerts', async () => {
    const { getByText, queryByText } = render(<AlertHistoryScreen />);
    
    await waitFor(() => expect(getByText('🚨 FIRE')).toBeTruthy());

    fireEvent.press(getByText('RAIN')); // Filter tab

    expect(queryByText('🚨 FIRE')).toBeNull();
    expect(getByText('🚨 RAIN')).toBeTruthy();
  });

  it('deletes an alert', async () => {
    const { getAllByText } = render(<AlertHistoryScreen />);
    
    await waitFor(() => expect(getAllByText('Delete').length).toBeGreaterThan(0)); // Swipeable mock renders actions

    fireEvent.press(getAllByText('Delete')[0]); // Press the delete action from the mock

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      // In a real app, state update removes it. 
      // Since we mocked deleteDoc but not the state update logic deeply (it relies on promise resolution),
      // we mainly check if the delete function was called.
    });
  });
});
