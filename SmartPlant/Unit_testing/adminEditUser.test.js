import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditUserScreen from '../src/admin/screens/EditUserScreen';
import { useAdminContext } from '../src/admin/AdminContext';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('http://new.pic/url')),
  getStorage: jest.fn(),
}));

jest.mock('../src/firebase/FirebaseConfig', () => ({
  storage: {},
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
  };
});

jest.spyOn(Alert, 'alert');

describe('EditUserScreen', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockUser = {
    id: 'u1',
    status: 'active',
    details: {
      full_name: 'Old Name',
      email: 'old@example.com',
      role: 'User',
      profile_pic: 'http://old.pic',
    },
  };
  const mockHandleUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminContext.mockReturnValue({
      handleUpdateUser: mockHandleUpdateUser,
    });
  });

  it('renders initial values', () => {
    const { getByDisplayValue } = render(<EditUserScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    expect(getByDisplayValue('Old Name')).toBeTruthy();
    expect(getByDisplayValue('old@example.com')).toBeTruthy();
  });

  it('updates user details successfully', async () => {
    const { getByText, getByDisplayValue } = render(<EditUserScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    
    fireEvent.changeText(getByDisplayValue('Old Name'), 'New Name');
    fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockHandleUpdateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
        full_name: 'New Name',
        email: 'old@example.com',
      }));
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('handles image picking and upload', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://new_image.jpg' }],
    });

    const { getByText } = render(<EditUserScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Change Picture'));
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockHandleUpdateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
        profile_pic: 'http://new.pic/url',
      }));
    });
  });

  it('validates required fields', () => {
    const { getByText, getByDisplayValue } = render(<EditUserScreen route={{ params: { user: mockUser } }} navigation={mockNavigation} />);
    
    fireEvent.changeText(getByDisplayValue('Old Name'), ''); // Clear name
    fireEvent.press(getByText('Save Changes'));

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Name and email are required.");
    expect(mockHandleUpdateUser).not.toHaveBeenCalled();
  });
});
