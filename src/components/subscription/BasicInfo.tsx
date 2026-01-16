import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../i18n';

type BasicInfoProps = {
  name: string;
  setName: (name: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
};

export default function BasicInfo({ name, setName, icon, setIcon }: BasicInfoProps) {
  const { colors } = useTheme();

  const commonIcons = ['📱', '🎬', '🎵', '📺', '💼', '📚', '🏋️', '🍔', '☁️', '🎮'];

  return (
    <>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{i18n.t('subscription.name')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder={i18n.t('subscription.namePlaceholder')}
          placeholderTextColor={colors.subtleText}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{i18n.t('subscription.icon')}</Text>
        <View style={styles.iconGrid}>
          {commonIcons.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.iconButton,
                { backgroundColor: colors.inputBackground },
                icon === emoji && { backgroundColor: colors.accent },
              ]}
              onPress={() => setIcon(emoji)}
            >
              <Text style={styles.iconEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
});
