import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MailManagementScreen from '../src/admin/screens/MailManagementScreen';
import { useAdminContext } from '../src/admin/AdminContext';

jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
    StarIcon: () => <View testID="StarIcon" />,
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

describe('MailManagementScreen', () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockMails = [
    { id: '1', title: 'Hello', message: 'World', read: false, timeGroup: 'Today', userId: 'u1', createdAt: { seconds: 1600000000 } },
    { id: '2', title: 'Old', message: 'Mail', read: true, timeGroup: 'Older', userId: 'u2', createdAt: { seconds: 1500000000 } },
  ];
  const mockUsers = [
    { id: 'u1', name: 'User One', details: {} },
    { id: 'u2', name: 'User Two', details: {} },
  ];
  const mockHandleToggleMailRead = jest.fn();

  beforeEach(() => {
    useAdminContext.mockReturnValue({
      mails: mockMails,
      users: mockUsers,
      handleToggleMailRead: mockHandleToggleMailRead,
    });
  });

  it('renders mail list grouped by time', () => {
    const { getByText } = render(<MailManagementScreen navigation={mockNavigation} />);
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('Older')).toBeTruthy();
    
    // Expand Older group
    fireEvent.press(getByText('Older'));
    expect(getByText('Old')).toBeTruthy();
  });

  it('filters mails', () => {
    const { getByText, queryByText } = render(<MailManagementScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Unread'));
    expect(queryByText('Hello')).toBeTruthy();
    // Old is read, so it shouldn't be there regardless of group expansion
    expect(queryByText('Old')).toBeNull();

    fireEvent.press(getByText('Read'));
    expect(queryByText('Hello')).toBeNull();
    
    // Expand Older group to see the read mail
    fireEvent.press(getByText('Older'));
    expect(queryByText('Old')).toBeTruthy();
  });

  it('navigates to detail on press', () => {
    const { getByText } = render(<MailManagementScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Hello'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('MailDetail', { mail: mockMails[0] });
  });
});
