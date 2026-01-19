import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import { calendarSyncService } from '../../services/calendarSyncService';
import { hapticFeedback } from '../../utils/haptics';
import i18n from '../../i18n';
import { formatDateLocale } from '../../utils/dateHelper';

export default function SyncDashboard() {
  const { colors } = useTheme();
  const { subscriptions, updateSubscription } = useDatabase();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    hapticFeedback.medium();
    setSyncing(true);
    try {
      const calendarEvents = await calendarSyncService.fetchSubTrackEvents();
      let updatedCount = 0;

      for (const event of calendarEvents) {
        const subId = calendarSyncService.extractSubscriptionId(event.notes);
        if (subId) {
          const subscription = subscriptions.find((s) => s.id === subId);
          if (subscription) {
            const calendarDate = new Date(event.startDate).toISOString().split('T')[0];
            const appDate = subscription.nextBillingDate.split('T')[0];

            if (calendarDate !== appDate) {
              await updateSubscription(subId, {
                nextBillingDate: calendarDate,
              });
              updatedCount++;
            }
          }
        }
      }

      setLastSync(new Date());
      alert(i18n.t('calendar.syncSuccess') + (updatedCount > 0 ? ` (${updatedCount} 項更新)` : ''));
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert(i18n.t('calendar.syncError'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
    >
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={24} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>{i18n.t('calendar.sync')}</Text>
      </View>

      <Text style={[styles.description, { color: colors.subtleText }]}>
        {i18n.t('calendar.direction')}
      </Text>

      {lastSync && (
        <Text style={[styles.lastSync, { color: colors.subtleText }]}>
          {i18n.t('calendar.lastSynced', { time: formatDateLocale(lastSync) })}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.syncButton,
          { backgroundColor: syncing ? colors.borderColor : colors.accent },
        ]}
        onPress={handleSync}
        disabled={syncing}
      >
        {syncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sync" size={20} color="#fff" />
            <Text style={styles.syncButtonText}>{i18n.t('calendar.syncNow')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  lastSync: {
    fontSize: 12,
    marginBottom: 16,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
