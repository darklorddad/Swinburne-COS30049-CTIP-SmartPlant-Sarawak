import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UserProfileScreen from '../src/admin/screens/UserProfileScreen';
import { useAdminContext } from '../src/admin/AdminContext';

jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
    EditIcon: () => <View testID="EditIcon" />,
    TrashIcon: () => <View testID="TrashIcon" />,
  };
});

describe('UserProfileScreen', () => {
  const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
  const mockUser = {
    id: 'u1',
    name: 'John Doe',
    status: 'active',
    color: '#fff',
    details: {
      role: 'User',
      email: 'john@example.com',
      contact: '123456',
      created_at: { seconds: 1600000000 },
    },
  };

  const mockHandleDeleteUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminContext.mockReturnValue({
      handleDeleteUser: mockHandleDeleteUser,
      plantIdentities: [
        { user_id: 'u1' }, { user_id: 'u1' }, { user_id: 'u2' }
      ],
      feedbacks: [
        { user_id: 'u1' }
      ],
    });
  });

  it('renders user details correctly', () => {
    const { getByText } = render(<UserProfileScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByText('active')).toBeTruthy();
  });

  it('calculates activity stats correctly', () => {
    const { getByText } = render(<UserProfileScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    
    // 2 plants for u1
    expect(getByText('2')).toBeTruthy(); 
    // 1 feedback for u1
    expect(getByText('1')).toBeTruthy();
  });

  it('navigates to EditUser', () => {
    const { getByTestId } = render(<UserProfileScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    fireEvent.press(getByTestId('EditIcon'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditUser', { user: mockUser });
  });

  it('handles delete user', () => {
    const { getByTestId } = render(<UserProfileScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    fireEvent.press(getByTestId('TrashIcon'));
    expect(mockHandleDeleteUser).toHaveBeenCalledWith('u1');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AccountManagement');
  });

  it('handles missing user param gracefully', () => {
    const { getByText } = render(<UserProfileScreen route={{ params: { user: null } }} navigation={mockNavigation} />);
    expect(getByText('User not found.')).toBeTruthy();
  });
});
