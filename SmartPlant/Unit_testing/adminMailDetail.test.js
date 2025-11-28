import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MailDetailScreen from '../src/admin/screens/MailDetailScreen';
import { useAdminContext } from '../src/admin/AdminContext';

jest.mock('../src/admin/AdminContext', () => ({
  useAdminContext: jest.fn(),
}));

jest.mock('../src/admin/Icons', () => {
  const { View } = require('react-native');
  return {
    BackIcon: () => <View testID="BackIcon" />,
    TrashIcon: () => <View testID="TrashIcon" />,
  };
});

describe('MailDetailScreen', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockMail = {
    id: 'm1',
    title: 'Subject',
    message: 'Body',
    userId: 'u1',
    read: false,
    createdAt: { seconds: 1600000000 },
  };
  const mockUsers = [{ id: 'u1', name: 'Sender', details: {} }];
  
  const mockHandleDeleteMail = jest.fn();
  const mockHandleReplyMail = jest.fn();
  const mockHandleToggleMailRead = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminContext.mockReturnValue({
      users: mockUsers,
      handleDeleteMail: mockHandleDeleteMail,
      handleReplyMail: mockHandleReplyMail,
      handleToggleMailRead: mockHandleToggleMailRead,
    });
  });

  it('marks mail as read on mount', () => {
    render(<MailDetailScreen route={{ params: { mail: mockMail } }} navigation={mockNavigation} />);
    expect(mockHandleToggleMailRead).toHaveBeenCalledWith('m1', false);
  });

  it('renders mail content', () => {
    const { getByText } = render(<MailDetailScreen route={{ params: { mail: mockMail } }} navigation={mockNavigation} />);
    expect(getByText('Subject')).toBeTruthy();
    expect(getByText('Body')).toBeTruthy();
    expect(getByText('Sender')).toBeTruthy();
  });

  it('sends a reply', () => {
    const { getByPlaceholderText, getByText } = render(<MailDetailScreen route={{ params: { mail: mockMail } }} navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Type your reply...'), 'My Reply');
    fireEvent.press(getByText('Send'));

    expect(mockHandleReplyMail).toHaveBeenCalledWith('m1', 'My Reply');
  });

  it('deletes mail', () => {
    const { getByTestId } = render(<MailDetailScreen route={{ params: { mail: mockMail } }} navigation={mockNavigation} />);
    fireEvent.press(getByTestId('TrashIcon'));
    expect(mockHandleDeleteMail).toHaveBeenCalledWith('m1');
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
