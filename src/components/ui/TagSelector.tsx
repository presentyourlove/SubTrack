/**
 * TagSelector Component
 * 標籤選擇器 (用於新增/編輯訂閱)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tag, TAG_COLORS } from '../../types';
import { TagChip } from './TagChip';
import i18n from '../../i18n';

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: number[];
  onSelectionChange: (tagIds: number[]) => void;
  onCreateTag: (name: string, color: string) => Promise<number | null>;
  onDeleteTag?: (tagId: number) => Promise<void>;
}

export function TagSelector({
  tags,
  selectedTagIds,
  onSelectionChange,
  onCreateTag,
  onDeleteTag,
}: TagSelectorProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? '#48484a' : '#c7c7cc',
    },
    addButtonText: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#666666',
      marginLeft: 4,
    },
    createContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: isDark ? '#2c2c2e' : '#f5f5f5',
      borderRadius: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    input: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: isDark ? '#48484a' : '#c7c7cc',
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      color: isDark ? '#ffffff' : '#000000',
      backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
    },
    colorPicker: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 8,
    },
    colorOption: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorOptionSelected: {
      borderWidth: 2,
      borderColor: isDark ? '#ffffff' : '#333333',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      gap: 8,
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    cancelButtonText: {
      fontSize: 14,
      color: isDark ? '#8e8e93' : '#666666',
    },
    createButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#007AFF',
      borderRadius: 6,
    },
    createButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    emptyText: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#999999',
      fontStyle: 'italic',
    },
  });

  const handleTagPress = useCallback(
    (tag: Tag) => {
      const isSelected = selectedTagIds.includes(tag.id);
      if (isSelected) {
        onSelectionChange(selectedTagIds.filter((id) => id !== tag.id));
      } else {
        onSelectionChange([...selectedTagIds, tag.id]);
      }
    },
    [selectedTagIds, onSelectionChange],
  );

  const handleTagLongPress = useCallback(
    (tag: Tag) => {
      if (!onDeleteTag) return;

      Alert.alert(i18n.t('tags.delete'), i18n.t('tags.deleteConfirm', { name: tag.name }), [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await onDeleteTag(tag.id);
            // 從選擇中移除
            if (selectedTagIds.includes(tag.id)) {
              onSelectionChange(selectedTagIds.filter((id) => id !== tag.id));
            }
          },
        },
      ]);
    },
    [onDeleteTag, selectedTagIds, onSelectionChange],
  );

  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    const color = TAG_COLORS[selectedColorIndex];
    const newTagId = await onCreateTag(trimmedName, color);

    if (newTagId) {
      // 自動選取新建立的標籤
      onSelectionChange([...selectedTagIds, newTagId]);
      setNewTagName('');
      setShowCreateInput(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{i18n.t('tags.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tagsContainer}>
          {tags.length === 0 && !showCreateInput && (
            <Text style={styles.emptyText}>{i18n.t('tags.noTags')}</Text>
          )}

          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              selected={selectedTagIds.includes(tag.id)}
              onPress={handleTagPress}
              onLongPress={handleTagLongPress}
            />
          ))}

          {!showCreateInput && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateInput(true)}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('tags.add')}
            >
              <Ionicons name="add" size={16} color={isDark ? '#8e8e93' : '#666666'} />
              <Text style={styles.addButtonText}>{i18n.t('tags.add')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {showCreateInput && (
        <View style={styles.createContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder={i18n.t('tags.placeholder')}
              accessibilityLabel={i18n.t('tags.placeholder')}
              placeholderTextColor={isDark ? '#8e8e93' : '#999999'}
              autoFocus
              maxLength={20}
            />
          </View>

          <View style={styles.colorPicker}>
            {TAG_COLORS.map((color, index) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColorIndex === index && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColorIndex(index)}
                accessibilityRole="button"
                accessibilityLabel={`顏色選項 ${index + 1}`}
              >
                {selectedColorIndex === index && (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.cancel')}
              onPress={() => {
                setShowCreateInput(false);
                setNewTagName('');
              }}
            >
              <Text style={styles.cancelButtonText}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('tags.add')}
              onPress={handleCreateTag}
              disabled={!newTagName.trim()}
            >
              <Text style={styles.createButtonText}>{i18n.t('tags.add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default TagSelector;
