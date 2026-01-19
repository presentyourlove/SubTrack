try {
  const path = require.resolve('react-native-worklets/plugin');
  console.log('Successfully resolved:', path);
} catch (error) {
  console.error('Failed to resolve:', error.message);
}
