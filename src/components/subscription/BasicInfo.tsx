import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { compressAndConvertImage } from '../../services/imageService';
import i18n from '../../i18n';
import { Ionicons } from '@expo/vector-icons';

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
          {/* 自定義圖片按鈕 */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.inputBackground },
              icon.startsWith('file://') && { backgroundColor: colors.accent },
            ]}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                try {
                  const processed = await compressAndConvertImage(result.assets[0].uri);
                  setIcon(processed.uri);
                } catch (error) {
                  console.error('Failed to process image:', error);
                }
              }
            }}
          >
            {icon.startsWith('file://') ? (
              <Image source={{ uri: icon }} style={styles.customIconPreview} />
            ) : (
              <Ionicons
                name="image-outline"
                size={24}
                color={icon.startsWith('file://') ? '#fff' : colors.text}
              />
            )}
          </TouchableOpacity>

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
  customIconPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
});
