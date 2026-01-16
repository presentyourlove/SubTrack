import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../i18n';

type BasicInfoProps = {
  name: string;
  setName: (name: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
  isFamilyPlan: boolean;
  setIsFamilyPlan: (value: boolean) => void;
  memberCount: string;
  setMemberCount: (value: string) => void;
};

export default function BasicInfo({
  name,
  setName,
  icon,
  setIcon,
  isFamilyPlan,
  setIsFamilyPlan,
  memberCount,
  setMemberCount,
}: BasicInfoProps) {
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

      <View style={styles.field}>
        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
            {i18n.t('subscription.familyPlan')}
          </Text>
          <Switch
            value={isFamilyPlan}
            onValueChange={setIsFamilyPlan}
            trackColor={{ false: colors.borderColor, true: colors.accent }}
          />
        </View>

        {isFamilyPlan && (
          <View style={styles.subField}>
            <Text style={[styles.subLabel, { color: colors.subtleText }]}>
              {i18n.t('subscription.memberCount')}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, color: colors.text },
              ]}
              value={memberCount}
              onChangeText={setMemberCount}
              placeholder="e.g. 4"
              placeholderTextColor={colors.subtleText}
              keyboardType="number-pad"
            />
          </View>
        )}
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subField: {
    marginTop: 8,
    paddingLeft: 4,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
});
