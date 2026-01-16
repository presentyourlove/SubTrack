/**
 * TagChip Component
 * 標籤顯示元件 (膠囊樣式)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Tag } from '../types';

interface TagChipProps {
  tag: Tag;
  selected?: boolean;
  onPress?: (tag: Tag) => void;
  onLongPress?: (tag: Tag) => void;
  size?: 'small' | 'medium';
}

export function TagChip({
  tag,
  selected = false,
  onPress,
  onLongPress,
  size = 'medium',
}: TagChipProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isSmall = size === 'small';

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isSmall ? 8 : 12,
      paddingVertical: isSmall ? 4 : 6,
      borderRadius: isSmall ? 10 : 14,
      backgroundColor: selected ? tag.color : isDark ? `${tag.color}30` : `${tag.color}20`,
      borderWidth: 1,
      borderColor: tag.color,
    },
    hash: {
      fontSize: isSmall ? 10 : 12,
      fontWeight: '600',
      color: selected ? '#ffffff' : tag.color,
      marginRight: 2,
    },
    text: {
      fontSize: isSmall ? 11 : 13,
      fontWeight: '500',
      color: selected ? '#ffffff' : isDark ? '#ffffff' : '#333333',
    },
  });

  const content = (
    <View style={styles.container}>
      <Text style={styles.hash}>#</Text>
      <Text style={styles.text}>{tag.name}</Text>
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(tag)}
        onLongPress={() => onLongPress?.(tag)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`標籤: ${tag.name}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default TagChip;
