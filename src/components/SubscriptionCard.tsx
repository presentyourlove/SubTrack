import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { useTheme } from '../context/ThemeContext';
import { Subscription } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import { calculateHourlyRate, convertToWorkHours } from '../utils/valueConverter';
import { formatCurrency } from '../utils/currencyHelper';
import { formatDateLocale, getDaysUntil, getUrgencyLevel } from '../utils/dateHelper';
import i18n from '../i18n';
import { TagChip } from './TagChip';
import SplitBillModal from './SplitBillModal';
import { usePrivacy } from '../hooks/usePrivacy';
import { hapticFeedback } from '../utils/haptics';
import { calendarSyncService } from '../services/calendarSyncService';

type SubscriptionCardProps = {
  subscription: Subscription;
  onEdit?: () => void;
  onDelete?: () => void;
  onSyncToCalendar?: () => void;
  onUpdateCalendarId?: (eventId: string | null) => void;
};

export default function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onSyncToCalendar,
  onUpdateCalendarId,
}: SubscriptionCardProps) {
  const { colors } = useTheme();
  const { settings } = useDatabase();
  const { maskValue } = usePrivacy();

  // 計算工時換算
  const hourlyRate = settings ? calculateHourlyRate(settings) : 0;
  const workHours = settings?.conversionEnabled
    ? convertToWorkHours(subscription.price, hourlyRate)
    : null;

  const daysUntil = getDaysUntil(subscription.nextBillingDate);
  const urgency = getUrgencyLevel(subscription.nextBillingDate);

  // 同步到日曆
  const handleSyncToCalendar = async () => {
    if (Platform.OS === 'web') {
      alert(i18n.t('calendar.webNotSupported'));
      return;
    }

    try {
      // 如果已經同步過,則刪除
      if (subscription.calendarEventId) {
        try {
          await Calendar.deleteEventAsync(subscription.calendarEventId);

          // 清除資料庫中的 eventId
          if (onUpdateCalendarId) {
            onUpdateCalendarId(null);
          }

          alert(i18n.t('calendar.removed'));
          // 通知父組件重新載入資料
          if (onSyncToCalendar) {
            onSyncToCalendar();
          }
        } catch (error) {
          console.error('刪除日曆事件失敗:', error);
          alert(i18n.t('calendar.removeFailed'));
        }
        return;
      }

      const eventId = await calendarSyncService.upsertEvent(subscription);

      if (!eventId) {
        alert(i18n.t('calendar.noCalendar'));
        return;
      }

      // 儲存 eventId 到資料庫
      if (onUpdateCalendarId) {
        onUpdateCalendarId(eventId);
      }

      alert(i18n.t('calendar.syncSuccess'));
      // 通知父組件重新載入資料
      if (onSyncToCalendar) {
        onSyncToCalendar();
      }
    } catch (error) {
      console.error('同步日曆失敗:', error);
      alert(i18n.t('calendar.syncFailed'));
    }
  };

  // 緊急程度顏色
  const urgencyColors = {
    urgent: '#ef4444', // 紅色
    warning: '#f59e0b', // 橘色
    safe: '#10b981', // 綠色
  };

  const urgencyLabels = {
    urgent: i18n.t('card.remainingDays', { days: daysUntil }),
    warning: i18n.t('card.remainingDays', { days: daysUntil }),
    safe: i18n.t('card.remainingDays', { days: daysUntil }),
  };

  const [showSplitBill, setShowSplitBill] = useState(false);

  return (
    <>
      <SplitBillModal
        visible={showSplitBill}
        onClose={() => setShowSplitBill(false)}
        subscription={subscription}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.borderColor },
        ]}
      >
        {/* 頂部資訊 */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {subscription.icon.startsWith('file://') ? (
              <Image source={{ uri: subscription.icon }} style={styles.iconImage} />
            ) : (
              <Text style={styles.icon}>{subscription.icon}</Text>
            )}
          </View>

          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{subscription.name}</Text>
            <Text style={[styles.category, { color: colors.subtleText }]}>
              {i18n.t(`categories.${subscription.category}`)}
            </Text>
          </View>

          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColors[urgency] }]}>
            <Text style={styles.urgencyText}>{urgencyLabels[urgency]}</Text>
          </View>
        </View>

        {/* 價格和日期 */}
        <View style={styles.details}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.text }]}>
              {maskValue(formatCurrency(subscription.price, subscription.currency))} /{' '}
              {subscription.billingCycle === 'monthly'
                ? i18n.t('card.perMonth')
                : i18n.t('card.perYear')}
            </Text>
            {subscription.isFamilyPlan && subscription.memberCount && (
              <TouchableOpacity onPress={() => setShowSplitBill(true)}>
                <Text
                  style={[
                    styles.perPersonPrice,
                    { color: colors.accent, textDecorationLine: 'underline' },
                  ]}
                >
                  (
                  {maskValue(
                    formatCurrency(
                      subscription.price / subscription.memberCount,
                      subscription.currency,
                    ),
                  )}{' '}
                  / {i18n.t('card.person')})
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {workHours && (
            <Text style={[styles.date, { color: colors.subtleText, marginTop: 2, fontSize: 12 }]}>
              {workHours}
            </Text>
          )}
          <Text style={[styles.date, { color: colors.subtleText }]}>
            {i18n.t('card.nextBilling')}{' '}
            {subscription.nextBillingDate
              ? formatDateLocale(subscription.nextBillingDate)
              : i18n.t('card.notSet')}
          </Text>
        </View>

        {/* 標籤 */}
        {subscription.tags && subscription.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {subscription.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} size="small" />
            ))}
          </View>
        )}

        {/* 操作按鈕 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.borderColor }]}
            onPress={() => {
              if (onEdit) {
                hapticFeedback.selection();
                onEdit();
              }
            }}
          >
            <Ionicons name="pencil" size={18} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>{i18n.t('common.edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.borderColor }]}
            onPress={() => {
              if (onDelete) {
                hapticFeedback.error();
                onDelete();
              }
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.expense} />
            <Text style={[styles.actionText, { color: colors.expense }]}>
              {i18n.t('common.delete')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 日曆同步開關 */}
        <View style={[styles.calendarSync, { borderTopColor: colors.borderColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.calendarLabel, { color: colors.text }]}>
              {i18n.t('calendar.syncLabel')}
            </Text>
            <Text style={[styles.calendarHint, { color: colors.subtleText }]}>
              {i18n.t('calendar.syncHint')}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.calendarToggle,
              subscription.calendarEventId
                ? { backgroundColor: colors.accent }
                : { backgroundColor: colors.borderColor },
            ]}
            onPress={() => {
              hapticFeedback.light();
              handleSyncToCalendar();
            }}
          >
            <View
              style={[
                styles.calendarToggleThumb,
                subscription.calendarEventId && styles.calendarToggleThumbActive,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  iconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
  },
  perPersonPrice: {
    fontSize: 14,
  },
  date: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarSync: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  calendarLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarHint: {
    fontSize: 12,
    marginTop: 2,
  },
  calendarToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  calendarToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  calendarToggleThumbActive: {
    marginLeft: 22,
  },
});
