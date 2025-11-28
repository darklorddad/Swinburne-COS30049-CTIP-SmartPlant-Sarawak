import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccountManagementScreen from '../src/admin/screens/AccountManagementScreen';
import { useAdminContext } from '../src/admin/AdminContext';

// Mock AdminContext
jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

// Mock Icons
jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
    PlusIcon: () => <View testID="PlusIcon" />,
    StarIcon: ({ filled }) => <View testID={filled ? "StarIconFilled" : "StarIconEmpty"} />,
  };
});

// Mock SearchBar
jest.mock('../src/admin/components/SearchBar', () => {
  const { TextInput } = require('react-native');
  return ({ value, onChange }) => (
    <TextInput testID="SearchBar" value={value} onChangeText={onChange} />
  );
});

// Mock BottomNavBar
jest.mock('../src/admin/components/AdminBottomNavBar', () => {
  const { View } = require('react-native');
  return () => <View testID="AdminBottomNavBar" />;
});

describe('AccountManagementScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockUsers = [
    { id: '1', name: 'Alice', status: 'active', favourite: false, details: {}, color: '#fff' },
    { id: '2', name: 'Bob', status: 'inactive', favourite: true, details: { profile_pic: 'http://pic.url' }, color: '#000' },
  ];

  const mockHandleToggleUserFavourite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminContext.mockReturnValue({
      users: mockUsers,
      handleToggleUserFavourite: mockHandleToggleUserFavourite,
    });
  });

  it('renders user list', () => {
    const { getByText } = render(<AccountManagementScreen navigation={mockNavigation} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('filters users by search', () => {
    const { getByTestId, queryByText } = render(<AccountManagementScreen navigation={mockNavigation} />);
    const searchBar = getByTestId('SearchBar');
    
    fireEvent.changeText(searchBar, 'Alice');
    
    expect(queryByText('Alice')).toBeTruthy();
    expect(queryByText('Bob')).toBeNull();
  });

  it('filters users by status tabs', () => {
    const { getByText, queryByText } = render(<AccountManagementScreen navigation={mockNavigation} />);
    
    // Filter Active
    fireEvent.press(getByText('Active'));
    expect(queryByText('Alice')).toBeTruthy();
    expect(queryByText('Bob')).toBeNull();

    // Filter Inactive
    fireEvent.press(getByText('Inactive'));
    expect(queryByText('Alice')).toBeNull();
    expect(queryByText('Bob')).toBeTruthy();

    // Filter Favourite
    fireEvent.press(getByText('Favourite'));
    expect(queryByText('Alice')).toBeNull();
    expect(queryByText('Bob')).toBeTruthy();
    
    // Filter All
    fireEvent.press(getByText('All'));
    expect(queryByText('Alice')).toBeTruthy();
    expect(queryByText('Bob')).toBeTruthy();
  });

  it('navigates to UserProfile on user press', () => {
    const { getByText } = render(<AccountManagementScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Alice'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('UserProfile', { user: mockUsers[0] });
  });

  it('toggles favourite on star press', () => {
    const { getAllByTestId } = render(<AccountManagementScreen navigation={mockNavigation} />);
    // Find the empty star icon (Alice)
    const emptyStar = getAllByTestId('StarIconEmpty')[0];
    
    // Fire press on the icon (RNTL propagates to parent TouchableOpacity)
    // Pass event with stopPropagation mock
    fireEvent.press(emptyStar, { stopPropagation: jest.fn() });
    
    expect(mockHandleToggleUserFavourite).toHaveBeenCalledWith('1');
  });

  it('navigates to AddUser', () => {
    const { getByTestId } = render(<AccountManagementScreen navigation={mockNavigation} />);
    fireEvent.press(getByTestId('PlusIcon'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddUser', undefined);
  });
});
