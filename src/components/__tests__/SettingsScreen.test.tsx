import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '../../../app/(tabs)/settings';
import { View, Text } from 'react-native';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
    },
  }),
}));

// Mock child components
const createMock = (name: string) => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>{name}</Text>
    </View>
  );
};

jest.mock('../../components/settings/ThemeSettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>ThemeSettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/LanguageSettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>LanguageSettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/CurrencySettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>CurrencySettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/NotificationSettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>NotificationSettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/ValueConverterSettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>ValueConverterSettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/SyncSettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>SyncSettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/BiometricSettings', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>BiometricSettings</Text>
    </View>
  );
});
jest.mock('../../components/settings/DataManagement', () => {
  const { View, Text } = require('react-native');
  return {
    DataManagement: () => (
      <View>
        <Text>DataManagement</Text>
      </View>
    ),
  };
});
jest.mock('../../components/settings/SyncDashboard', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>SyncDashboard</Text>
    </View>
  );
});
jest.mock('../../components/settings/AboutSection', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>AboutSection</Text>
    </View>
  );
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('SettingsScreen', () => {
  it('renders all settings sections', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('ThemeSettings')).toBeTruthy();
    expect(getByText('LanguageSettings')).toBeTruthy();
    expect(getByText('CurrencySettings')).toBeTruthy();
    expect(getByText('NotificationSettings')).toBeTruthy();
    expect(getByText('ValueConverterSettings')).toBeTruthy();
    expect(getByText('SyncSettings')).toBeTruthy();
    expect(getByText('BiometricSettings')).toBeTruthy();
    expect(getByText('DataManagement')).toBeTruthy();
    expect(getByText('SyncDashboard')).toBeTruthy();
    expect(getByText('AboutSection')).toBeTruthy();
  });
});
