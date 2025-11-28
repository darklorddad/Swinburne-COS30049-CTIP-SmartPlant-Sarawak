import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FeedbackManagementScreen from '../src/admin/screens/FeedbackManagementScreen';
import { useAdminContext } from '../src/admin/AdminContext';

jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
  };
});

jest.mock('../src/admin/components/SearchBar', () => {
  const { TextInput } = require('react-native');
  return ({ value, onChange }) => (
    <TextInput testID="SearchBar" value={value} onChangeText={onChange} />
  );
});

jest.mock('../src/admin/components/AdminBottomNavBar', () => {
  const { View } = require('react-native');
  return () => <View testID="AdminBottomNavBar" />;
});

describe('FeedbackManagementScreen', () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockFeedbacks = [
    { id: '1', title: 'Bug', details: 'Fix it', admin_notes: '', user_id: 'u1', createdAt: { seconds: 1600000000 } },
    { id: '2', title: 'Feature', details: 'Add it', admin_notes: 'Done', user_id: 'u2', createdAt: { seconds: 1500000000 } },
  ];
  const mockUsers = [
    { firebase_uid: 'u1', name: 'User One', details: {} },
    { firebase_uid: 'u2', name: 'User Two', details: {} },
  ];

  beforeEach(() => {
    useAdminContext.mockReturnValue({
      feedbacks: mockFeedbacks,
      users: mockUsers,
    });
  });

  it('renders feedback list', () => {
    const { getByText } = render(<FeedbackManagementScreen navigation={mockNavigation} />);
    expect(getByText('Bug')).toBeTruthy();
    expect(getByText('Feature')).toBeTruthy();
  });

  it('filters feedbacks', () => {
    const { getByText, queryByText } = render(<FeedbackManagementScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Unreplied'));
    expect(queryByText('Bug')).toBeTruthy();
    expect(queryByText('Feature')).toBeNull();

    fireEvent.press(getByText('Replied'));
    expect(queryByText('Bug')).toBeNull();
    expect(queryByText('Feature')).toBeTruthy();
  });

  it('navigates to detail on press', () => {
    const { getByText } = render(<FeedbackManagementScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Bug'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FeedbackDetail', { feedback: mockFeedbacks[0] });
  });
});
