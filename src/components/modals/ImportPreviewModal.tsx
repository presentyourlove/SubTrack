/**
 * ImportPreviewModal
 * 顯示匯入預覽，讓使用者確認後再匯入
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '../../types';
import i18n from '../../i18n';

interface ImportPreviewModalProps {
  visible: boolean;
  data: Partial<Subscription>[];
  errors: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  entertainment: '影音娛樂',
  productivity: '生產力工具',
  lifestyle: '生活服務',
  other: '其他',
};

const CYCLE_LABELS: Record<string, string> = {
  weekly: '每週',
  monthly: '每月',
  quarterly: '每季',
  yearly: '每年',
};

export function ImportPreviewModal({
  visible,
  data,
  errors,
  onConfirm,
  onCancel,
}: ImportPreviewModalProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
      borderRadius: 16,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    closeButton: {
      padding: 4,
    },
    summary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      padding: 12,
      backgroundColor: isDark ? '#2c2c2e' : '#f5f5f5',
      borderRadius: 8,
    },
    summaryText: {
      fontSize: 14,
      color: isDark ? '#ffffff' : '#333333',
    },
    errorContainer: {
      backgroundColor: isDark ? '#3a1c1c' : '#ffe6e6',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ff4444',
      marginBottom: 4,
    },
    errorText: {
      fontSize: 12,
      color: isDark ? '#ffaaaa' : '#cc0000',
    },
    listHeader: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#3c3c3e' : '#e0e0e0',
    },
    listHeaderText: {
      flex: 1,
      fontSize: 12,
      fontWeight: 'bold',
      color: isDark ? '#8e8e93' : '#666666',
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2c2c2e' : '#f0f0f0',
      alignItems: 'center',
    },
    cell: {
      flex: 1,
    },
    nameCell: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      fontSize: 20,
      marginRight: 8,
    },
    name: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#ffffff' : '#000000',
    },
    cellText: {
      fontSize: 13,
      color: isDark ? '#cccccc' : '#333333',
    },
    priceText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#007AFF',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      marginRight: 8,
      borderRadius: 8,
      backgroundColor: isDark ? '#3c3c3e' : '#e0e0e0',
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: isDark ? '#ffffff' : '#333333',
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 12,
      marginLeft: 8,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      alignItems: 'center',
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    emptyText: {
      textAlign: 'center',
      padding: 20,
      color: isDark ? '#8e8e93' : '#999999',
    },
  });

  const renderItem = ({ item }: { item: Partial<Subscription> }) => (
    <View style={styles.row}>
      <View style={styles.nameCell}>
        <Text style={styles.icon}>{item.icon || '📦'}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{CATEGORY_LABELS[item.category || 'other']}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.priceText}>
          {item.currency} {item.price}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{CYCLE_LABELS[item.billingCycle || 'monthly']}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('import.previewTitle')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCancel}
              accessibilityLabel={i18n.t('common.close')}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {i18n.t('import.foundItems', { count: data.length })}
            </Text>
            {errors.length > 0 && (
              <Text style={[styles.summaryText, { color: '#ff4444' }]}>
                {i18n.t('import.errors', { count: errors.length })}
              </Text>
            )}
          </View>

          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>{i18n.t('import.errorTitle')}</Text>
              {errors.slice(0, 3).map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
              {errors.length > 3 && (
                <Text style={styles.errorText}>
                  ...{i18n.t('import.moreErrors', { count: errors.length - 3 })}
                </Text>
              )}
            </View>
          )}

          <View style={styles.listHeader}>
            <Text style={[styles.listHeaderText, { flex: 2 }]}>{i18n.t('subscription.name')}</Text>
            <Text style={styles.listHeaderText}>{i18n.t('subscription.category')}</Text>
            <Text style={styles.listHeaderText}>{i18n.t('subscription.price')}</Text>
            <Text style={styles.listHeaderText}>{i18n.t('subscription.cycle')}</Text>
          </View>

          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(_, index) => String(index)}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>{i18n.t('import.noData')}</Text>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              accessibilityLabel={i18n.t('common.cancel')}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={data.length === 0}
              accessibilityLabel={i18n.t('import.confirm')}
              accessibilityRole="button"
            >
              <Text style={styles.confirmButtonText}>{i18n.t('import.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
