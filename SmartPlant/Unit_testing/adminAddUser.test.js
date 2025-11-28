import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddUserScreen from '../src/admin/screens/AddUserScreen';
import { useAdminContext } from '../src/admin/AdminContext';
import { Alert } from 'react-native';

jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
  };
});

jest.spyOn(Alert, 'alert');

describe('AddUserScreen', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockHandleAddNewUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminContext.mockReturnValue({
      handleAddNewUser: mockHandleAddNewUser,
    });
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<AddUserScreen navigation={mockNavigation} />);
    expect(getByPlaceholderText('Enter full name')).toBeTruthy();
  });

  it('adds a new user successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<AddUserScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Enter full name'), 'New User');
    fireEvent.changeText(getByPlaceholderText('user@example.com'), 'new@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter a strong password'), 'password123');
    
    fireEvent.press(getByText('Save User'));

    await waitFor(() => {
      expect(mockHandleAddNewUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New User' }),
        'password123'
      );
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('shows error if fields are missing', () => {
    const { getByText } = render(<AddUserScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Save User'));
    expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in Name, Email, and Password.");
  });

  it('handles errors from context', async () => {
    mockHandleAddNewUser.mockRejectedValue(new Error('Firebase Error'));
    const { getByPlaceholderText, getByText } = render(<AddUserScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Enter full name'), 'User');
    fireEvent.changeText(getByPlaceholderText('user@example.com'), 'email');
    fireEvent.changeText(getByPlaceholderText('Enter a strong password'), 'pass');
    
    fireEvent.press(getByText('Save User'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Firebase Error");
    });
  });
});
