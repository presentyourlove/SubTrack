import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../i18n';

export default function ThemeSettings() {
  const { colors, theme, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.settingItem,
          { backgroundColor: colors.card, borderColor: colors.borderColor },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.settingIcon}>
          <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.accent} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {i18n.t('settings.theme')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
            {theme === 'dark' ? i18n.t('settings.darkMode') : i18n.t('settings.lightMode')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {i18n.t('settings.theme')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: colors.card, borderColor: colors.borderColor },
                ]}
                onPress={() => {
                  if (theme === 'dark') toggleTheme();
                  setModalVisible(false);
                }}
              >
                <Ionicons
                  name="sunny"
                  size={24}
                  color={theme === 'light' ? colors.accent : colors.subtleText}
                />
                <Text style={[styles.themeOptionText, { color: colors.text }]}>
                  {i18n.t('settings.lightMode')}
                </Text>
                {theme === 'light' && <Ionicons name="checkmark" size={24} color={colors.accent} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: colors.card, borderColor: colors.borderColor },
                ]}
                onPress={() => {
                  if (theme === 'light') toggleTheme();
                  setModalVisible(false);
                }}
              >
                <Ionicons
                  name="moon"
                  size={24}
                  color={theme === 'dark' ? colors.accent : colors.subtleText}
                />
                <Text style={[styles.themeOptionText, { color: colors.text }]}>
                  {i18n.t('settings.darkMode')}
                </Text>
                {theme === 'dark' && <Ionicons name="checkmark" size={24} color={colors.accent} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});
