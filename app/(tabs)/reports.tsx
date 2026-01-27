import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { CustomReport } from '../../src/types';
import { useTypedTranslation } from '../../src/hooks/useTypedTranslation';
import { Ionicons } from '@expo/vector-icons';
import GenericChart from '../../src/components/charts/GenericChart';
import { executeReport } from '../../src/services/db/reports';
import { useFocusEffect } from 'expo-router';

// 智慧分包：延遲載入報表生成組件 (Bundle Splitting)
const ReportBuilderModal = React.lazy(
  () => import('../../src/components/reports/ReportBuilderModal'),
);

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { t } = useTypedTranslation();
  const { createReport, getReports, deleteReport, subscriptions, settings } = useDatabase();

  const [reports, setReports] = useState<CustomReport[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    const data = await getReports();
    setReports(data || []);
  }, [getReports]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleCreate = async (reportData: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createReport(reportData);
    await loadReports();
  };

  const handleDelete = (id: number) => {
    Alert.alert(t('common.delete'), t('reports.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteReport(id);
          await loadReports();
        },
      },
    ]);
  };

  const currency = settings?.mainCurrency || 'TWD';
  const rates = settings?.exchangeRates ? JSON.parse(settings.exchangeRates) : {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.borderColor },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t('reports.title')}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="stats-chart"
              size={64}
              color={colors.subtleText}
              style={{ opacity: 0.5 }}
            />
            <Text style={[styles.emptyText, { color: colors.subtleText }]}>
              {t('reports.noReports')}
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.accent }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.createButtonText}>{t('reports.addFirst')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.map((report) => {
            const chartData = executeReport(report, subscriptions, currency, rates);
            return (
              <View key={report.id} style={styles.chartWrapper}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>{report.title}</Text>
                  <TouchableOpacity onPress={() => handleDelete(report.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.expense} />
                  </TouchableOpacity>
                </View>
                <GenericChart data={chartData} type={report.chartType} />
              </View>
            );
          })
        )}
      </ScrollView>

      <React.Suspense fallback={null}>
        {modalVisible && (
          <ReportBuilderModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSave={handleCreate}
          />
        )}
      </React.Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for tab bar
  },
  chartWrapper: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
