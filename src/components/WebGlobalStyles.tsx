import { Platform } from 'react-native';

export function WebGlobalStyles() {
    if (Platform.OS !== 'web') return null;

    return (
        <style type="text/css">{`
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url(${require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
      }
      @font-face {
        font-family: 'Ionicons';
        src: url(${require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')}) format('truetype');
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
      
      /* 確保輸入框和按鈕也繼承字體 */
      input, button, select, textarea {
        font-family: inherit;
      }
    `}</style>
    );
}
