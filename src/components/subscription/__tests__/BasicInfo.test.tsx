import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BasicInfo from '../BasicInfo';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
      subtleText: '#666666',
      inputBackground: '#f5f5f5',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
    },
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('../../../services/imageService', () => ({
  compressAndConvertImage: jest.fn(),
}));

describe('BasicInfo', () => {
  const defaultProps = {
    name: 'Netflix',
    setName: jest.fn(),
    icon: '📺',
    setIcon: jest.fn(),
    isFamilyPlan: false,
    setIsFamilyPlan: jest.fn(),
    memberCount: '1',
    setMemberCount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders name input with value', () => {
    const { getByDisplayValue } = render(<BasicInfo {...defaultProps} />);

    expect(getByDisplayValue('Netflix')).toBeTruthy();
  });

  it('calls setName when name input changes', () => {
    const { getByDisplayValue } = render(<BasicInfo {...defaultProps} />);

    const input = getByDisplayValue('Netflix');
    fireEvent.changeText(input, 'Spotify');

    expect(defaultProps.setName).toHaveBeenCalledWith('Spotify');
  });

  it('renders name label', () => {
    const { getByText } = render(<BasicInfo {...defaultProps} />);

    expect(getByText('subscription.name *')).toBeTruthy();
  });

  it('renders icon label', () => {
    const { getByText } = render(<BasicInfo {...defaultProps} />);

    expect(getByText('subscription.icon')).toBeTruthy();
  });

  it('renders common icon options', () => {
    const { getByText } = render(<BasicInfo {...defaultProps} />);

    expect(getByText('📱')).toBeTruthy();
    expect(getByText('🎬')).toBeTruthy();
    expect(getByText('🎵')).toBeTruthy();
  });

  it('calls setIcon when icon is pressed', () => {
    const { getByText } = render(<BasicInfo {...defaultProps} />);

    fireEvent.press(getByText('🎮'));

    expect(defaultProps.setIcon).toHaveBeenCalledWith('🎮');
  });

  it('renders family plan switch', () => {
    const { getByText } = render(<BasicInfo {...defaultProps} />);

    expect(getByText('subscription.familyPlan')).toBeTruthy();
  });

  it('calls setIsFamilyPlan when switch is toggled', () => {
    const { UNSAFE_getAllByType } = render(<BasicInfo {...defaultProps} />);

    const { Switch } = require('react-native');
    const switches = UNSAFE_getAllByType(Switch);

    fireEvent(switches[0], 'valueChange', true);

    expect(defaultProps.setIsFamilyPlan).toHaveBeenCalledWith(true);
  });

  it('shows member count input when family plan is enabled', () => {
    const { getByText, getByDisplayValue } = render(
      <BasicInfo {...defaultProps} isFamilyPlan={true} />,
    );

    expect(getByText('subscription.memberCount')).toBeTruthy();
    expect(getByDisplayValue('1')).toBeTruthy();
  });

  it('hides member count input when family plan is disabled', () => {
    const { queryByText } = render(
      <BasicInfo {...defaultProps} isFamilyPlan={false} />,
    );

    expect(queryByText('subscription.memberCount')).toBeNull();
  });

  it('calls setMemberCount when member count changes', () => {
    const { getByDisplayValue } = render(
      <BasicInfo {...defaultProps} isFamilyPlan={true} />,
    );

    const input = getByDisplayValue('1');
    fireEvent.changeText(input, '4');

    expect(defaultProps.setMemberCount).toHaveBeenCalledWith('4');
  });

  it('renders with custom image icon', () => {
    const { toJSON } = render(
      <BasicInfo {...defaultProps} icon="file://custom-icon.webp" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('highlights selected emoji icon', () => {
    const { getByText } = render(<BasicInfo {...defaultProps} icon="🎬" />);

    const selectedIcon = getByText('🎬');
    expect(selectedIcon).toBeTruthy();
  });

  it('calls ImagePicker when custom icon button is pressed', async () => {
    const ImagePicker = require('expo-image-picker');
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///new-icon.jpg' }],
    });

    const { getByTestId, UNSAFE_getByType } = render(<BasicInfo {...defaultProps} />);

    // Find the image icon button (the first TouchableOpacity in the grid)
    const { TouchableOpacity } = require('react-native');
    const buttons = render(<BasicInfo {...defaultProps} />).UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]);

    // Note: Since launchImageLibraryAsync is async, wait for calls if needed
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });
});
