import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import i18n from '../../i18n';

export default function NotificationSettings() {
  const { colors } = useTheme();
  const { settings, updateSettings, subscriptions, updateSubscription } = useDatabase();
  const { showToast } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('undetermined');

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      setNotificationPermission('unsupported');
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    checkNotificationPermission();
  }, []);

  // 開啟系統設定
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  // 處理訂閱通知開關
  const handleToggleSubscriptionNotification = async (id: number, enabled: boolean) => {
    try {
      await updateSubscription(id, { reminderEnabled: enabled });
      showToast(enabled ? '通知已開啟' : '通知已關閉', 'success');
    } catch {
      showToast('更新失敗', 'error');
    }
  };

  // 篩選已開啟通知的訂閱
  const notificationEnabledSubscriptions = subscriptions.filter((sub) => sub.reminderEnabled);

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        style={[
          styles.settingItem,
          { backgroundColor: colors.card, borderColor: colors.borderColor },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.settingIcon}>
          <Ionicons name="notifications" size={24} color={colors.accent} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {i18n.t('settings.notifications')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
            {i18n.t('settings.notifications')}
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
                {i18n.t('settings.notifications')}
              </Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* 權限狀態 */}
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>權限狀態</Text>
              <View
                style={[
                  styles.permissionCard,
                  { backgroundColor: colors.card, borderColor: colors.borderColor },
                ]}
              >
                {notificationPermission === 'granted' ? (
                  <>
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                    <Text style={[styles.permissionText, { color: colors.text }]}>
                      通知權限已授予
                    </Text>
                  </>
                ) : notificationPermission === 'denied' ? (
                  <>
                    <Ionicons name="close-circle" size={32} color="#ef4444" />
                    <Text style={[styles.permissionText, { color: colors.text }]}>
                      通知權限已拒絕
                    </Text>
                    <TouchableOpacity
                      accessibilityRole="button"
                      style={[styles.button, { backgroundColor: colors.accent, marginTop: 12 }]}
                      onPress={openSettings}
                    >
                      <Text style={styles.buttonText}>開啟系統設定</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Ionicons name="alert-circle" size={32} color="#f59e0b" />
                    <Text style={[styles.permissionText, { color: colors.text }]}>
                      尚未設定通知權限
                    </Text>
                  </>
                )}
              </View>

              {/* 全域通知開關 */}
              <Text style={[styles.modalSectionTitle, { color: colors.text, marginTop: 24 }]}>
                全域通知
              </Text>
              <View
                style={[
                  styles.switchRow,
                  { backgroundColor: colors.card, borderColor: colors.borderColor },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>啟用所有訂閱通知</Text>
                  <Text style={[styles.switchHint, { color: colors.subtleText }]}>
                    關閉後將不會收到任何訂閱提醒
                  </Text>
                </View>
                <Switch
                  value={!!settings?.notificationsEnabled}
                  onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                  trackColor={{ false: '#767577', true: colors.accent }}
                  thumbColor={Platform.OS !== 'ios' ? '#f4f3f4' : undefined}
                />
              </View>

              <Text style={[styles.modalSectionTitle, { color: colors.text, marginTop: 24 }]}>
                已開啟通知的訂閱
              </Text>
              {notificationEnabledSubscriptions.length > 0 ? (
                notificationEnabledSubscriptions.map((sub) => (
                  <View
                    key={sub.id}
                    style={[
                      styles.subscriptionItem,
                      { backgroundColor: colors.card, borderColor: colors.borderColor },
                    ]}
                  >
                    <View>
                      <Text style={[styles.subscriptionName, { color: colors.text }]}>
                        {sub.name}
                      </Text>
                      <Text style={[styles.subscriptionDate, { color: colors.subtleText }]}>
                        下次: {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <Switch
                      value={sub.reminderEnabled}
                      onValueChange={(value) => handleToggleSubscriptionNotification(sub.id, value)}
                      trackColor={{ false: '#767577', true: colors.accent }}
                      thumbColor={Platform.OS !== 'ios' ? '#f4f3f4' : undefined}
                    />
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.subtleText }]}>
                  目前沒有開啟通知的訂閱
                </Text>
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
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
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
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionDate: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchHint: {
    fontSize: 12,
    marginTop: 4,
  },
});
