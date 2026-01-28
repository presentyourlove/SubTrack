import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../../context/DatabaseContext';
import { getDaysUntil } from '../../utils/dateHelper';
import i18n from '../../i18n';

export default function AlertCard() {
  const { subscriptions } = useDatabase();
  // 計算3天內即將到期的訂閱數量
  const upcomingCount = subscriptions.filter((sub) => {
    const days = getDaysUntil(sub.nextBillingDate);
    return days >= 0 && days <= 3;
  }).length;

  // 根據數量決定樣式
  const hasUpcoming = upcomingCount > 0;
  const backgroundColor = hasUpcoming ? '#fef3c7' : '#e0f2fe';
  const iconColor = hasUpcoming ? '#f59e0b' : '#0ea5e9';
  const titleColor = hasUpcoming ? '#92400e' : '#075985';
  const messageColor = hasUpcoming ? '#78350f' : '#0c4a6e';
  const hintColor = hasUpcoming ? '#a16207' : '#0369a1';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={hasUpcoming ? 'warning' : 'checkmark-circle'} size={24} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]}>
          {hasUpcoming ? i18n.t('alert.upcomingTitle') : i18n.t('alert.statusTitle')}
        </Text>
        <Text style={[styles.message, { color: messageColor }]}>
          {i18n.t('alert.upcomingMessage', { count: upcomingCount })}
        </Text>
        {hasUpcoming && (
          <Text style={[styles.hint, { color: hintColor }]}>{i18n.t('alert.balanceHint')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 2,
  },
  hint: {
    fontSize: 12,
    opacity: 0.8,
  },
});
