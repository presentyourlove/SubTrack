import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import {
  loginUser as login,
  registerUser as register,
  logoutUser as logout,
} from '../../services/authService';
import i18n from '../../i18n';

export default function SyncSettings() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { syncToCloud, syncFromCloud } = useDatabase();
  const { showToast } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 處理登入
  const handleLogin = async () => {
    try {
      await login(email, password);
      showToast(i18n.t('validation.loginSuccess'), 'success');
      setEmail('');
      setPassword('');
      setModalVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      }
    }
  };

  // 處理註冊
  const handleRegister = async () => {
    try {
      await register(email, password);
      showToast(i18n.t('validation.registerSuccess'), 'success');
      setEmail('');
      setPassword('');
      setModalVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      }
    }
  };

  // 處理登出
  const handleLogout = async () => {
    try {
      await logout();
      showToast(i18n.t('validation.logoutSuccess'), 'success');
      setModalVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      }
    }
  };

  // 處理雲端同步
  const handleSyncToCloud = async () => {
    try {
      await syncToCloud();
      showToast(i18n.t('validation.syncUploadSuccess'), 'success');
      setModalVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      }
    }
  };

  const handleSyncFromCloud = async () => {
    try {
      await syncFromCloud();
      showToast(i18n.t('validation.syncDownloadSuccess'), 'success');
      setModalVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      }
    }
  };

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
          <Ionicons name="cloud" size={24} color={colors.accent} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {i18n.t('settings.sync')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
            {isAuthenticated
              ? i18n.t('settings.authStatus', { email: user?.email })
              : i18n.t('settings.loginToSync')}
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
                {i18n.t('settings.sync')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {!isAuthenticated ? (
                <View>
                  <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                    {i18n.t('validation.loginSuccess').replace('成功', '').replace('！', '')} /{' '}
                    {i18n.t('validation.registerSuccess').replace('成功', '').replace('！', '')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.borderColor,
                      },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={colors.subtleText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.borderColor,
                      },
                    ]}
                    placeholder="密碼"
                    placeholderTextColor={colors.subtleText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <View style={{ gap: 16, marginTop: 8 }}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: colors.accent,
                          width: '100%',
                        },
                      ]}
                      onPress={handleLogin}
                    >
                      <Text style={styles.buttonText}>登入</Text>
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: colors.subtleText, fontSize: 14 }}>
                        {i18n.t('settings.noAccount')}
                      </Text>
                      <TouchableOpacity onPress={handleRegister}>
                        <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 14 }}>
                          {i18n.t('settings.registerNow')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={[styles.userInfo, { color: colors.text }]}>
                    {i18n.t('settings.authStatus', { email: user?.email })}
                  </Text>

                  <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                    {i18n.t('settings.cloudSync')}
                  </Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.accent }]}
                      onPress={handleSyncToCloud}
                    >
                      <Ionicons name="cloud-upload" size={20} color="#fff" />
                      <Text style={styles.buttonText}>{i18n.t('settings.upload')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.accent }]}
                      onPress={handleSyncFromCloud}
                    >
                      <Ionicons name="cloud-download" size={20} color="#fff" />
                      <Text style={styles.buttonText}>{i18n.t('settings.download')}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.expense, marginTop: 24 }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.buttonText}>{i18n.t('settings.logout')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
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
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
