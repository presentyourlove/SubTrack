/**
 * DataManagement
 * 資料管理設定區塊：匯出/匯入訂閱資料
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../../context/DatabaseContext';
import { exportSubscriptionsToCSV, exportSubscriptionsToPDF } from '../../services/exportService';
import { pickImportFile, parseImportFile, ImportResult } from '../../services/importService';
import { ImportPreviewModal } from '../ImportPreviewModal';
import { Subscription } from '../../types';
import i18n from '../../i18n';

export function DataManagement(): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { subscriptions, addSubscription, settings } = useDatabase();

  // 計算每月總支出 (用於 PDF 報表)
  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      const price = sub.price;
      switch (sub.billingCycle) {
        case 'weekly':
          return total + price * 4.33;
        case 'monthly':
          return total + price;
        case 'quarterly':
          return total + price / 3;
        case 'yearly':
          return total + price / 12;
        default:
          return total + price;
      }
    }, 0);
  }, [subscriptions]);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreviewVisible, setImportPreviewVisible] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const styles = StyleSheet.create({
    container: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#8e8e93' : '#6e6e73',
      marginBottom: 8,
      marginLeft: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
      borderRadius: 12,
      marginHorizontal: 16,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2c2c2e' : '#f0f0f0',
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    exportIcon: {
      backgroundColor: '#34c759',
    },
    pdfIcon: {
      backgroundColor: '#ff3b30',
    },
    importIcon: {
      backgroundColor: '#007AFF',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#666666',
      marginTop: 2,
    },
    chevron: {
      marginLeft: 8,
    },
    loader: {
      marginLeft: 8,
    },
  });

  const handleExportCSV = async () => {
    if (subscriptions.length === 0) {
      Alert.alert(i18n.t('export.noData'), i18n.t('export.noDataMessage'));
      return;
    }

    setIsExporting(true);
    try {
      await exportSubscriptionsToCSV(subscriptions);
    } catch (error) {
      console.error('Export CSV error:', error);
      Alert.alert(i18n.t('export.error'), String(error));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (subscriptions.length === 0) {
      Alert.alert(i18n.t('export.noData'), i18n.t('export.noDataMessage'));
      return;
    }

    setIsExporting(true);
    try {
      await exportSubscriptionsToPDF(subscriptions, monthlyTotal, settings?.mainCurrency || 'TWD');
    } catch (error) {
      console.error('Export PDF error:', error);
      Alert.alert(i18n.t('export.error'), String(error));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const fileUri = await pickImportFile();
      if (!fileUri) {
        setIsImporting(false);
        return;
      }

      const result = await parseImportFile(fileUri);
      setImportResult(result);
      setImportPreviewVisible(true);
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(i18n.t('import.error'), String(error));
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult || importResult.data.length === 0) return;

    try {
      let successCount = 0;
      for (const item of importResult.data) {
        await addSubscription(item as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);
        successCount++;
      }

      setImportPreviewVisible(false);
      setImportResult(null);

      Alert.alert(
        i18n.t('import.success'),
        i18n.t('import.successMessage', { count: successCount }),
      );
    } catch (error) {
      console.error('Import confirm error:', error);
      Alert.alert(i18n.t('import.error'), String(error));
    }
  };

  const handleCancelImport = () => {
    setImportPreviewVisible(false);
    setImportResult(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.dataManagement')}</Text>
      <View style={styles.card}>
        {/* Export CSV */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleExportCSV}
          disabled={isExporting}
          accessibilityLabel={i18n.t('export.csv')}
          accessibilityRole="button"
        >
          <View style={[styles.icon, styles.exportIcon]}>
            <Ionicons name="document-text-outline" size={18} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{i18n.t('export.csv')}</Text>
            <Text style={styles.subtitle}>{i18n.t('export.csvDescription')}</Text>
          </View>
          {isExporting ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#48484a' : '#c7c7cc'}
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>

        {/* Export PDF */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleExportPDF}
          disabled={isExporting}
          accessibilityLabel={i18n.t('export.pdf')}
          accessibilityRole="button"
        >
          <View style={[styles.icon, styles.pdfIcon]}>
            <Ionicons name="document-outline" size={18} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{i18n.t('export.pdf')}</Text>
            <Text style={styles.subtitle}>{i18n.t('export.pdfDescription')}</Text>
          </View>
          {isExporting ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#48484a' : '#c7c7cc'}
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>

        {/* Import */}
        <TouchableOpacity
          style={[styles.row, styles.lastRow]}
          onPress={handleImport}
          disabled={isImporting}
          accessibilityLabel={i18n.t('import.title')}
          accessibilityRole="button"
        >
          <View style={[styles.icon, styles.importIcon]}>
            <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{i18n.t('import.title')}</Text>
            <Text style={styles.subtitle}>{i18n.t('import.description')}</Text>
          </View>
          {isImporting ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#48484a' : '#c7c7cc'}
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Import Preview Modal */}
      <ImportPreviewModal
        visible={importPreviewVisible}
        data={importResult?.data || []}
        errors={importResult?.errors || []}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </View>
  );
}
