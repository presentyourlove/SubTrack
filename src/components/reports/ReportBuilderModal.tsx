import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // Fix import path
import { CustomReport } from '../../types'; // Fix import path
import i18n from '../../i18n'; // Fix import path
import { Ionicons } from '@expo/vector-icons';

type ReportBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
};

export default function ReportBuilderModal({ visible, onClose, onSave }: ReportBuilderModalProps) {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [dimension, setDimension] = useState<'category' | 'tag' | 'cycle'>('category');
  const [metric, setMetric] = useState<'cost_monthly' | 'cost_yearly' | 'count'>('cost_monthly');

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSave({ title, chartType, dimension, metric });
    setTitle('');
    onClose();
  };

  const renderOption = (
    label: string,
    selected: boolean,
    onPress: () => void,
    icon?: keyof typeof Ionicons.glyphMap,
  ) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected && { backgroundColor: colors.accent },
        { borderColor: colors.borderColor },
      ]}
      onPress={onPress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={selected ? '#fff' : colors.text}
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={[styles.optionText, { color: selected ? '#fff' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContext, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {i18n.t('reports.createTitle')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Title */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t('reports.reportTitle')}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: colors.background, borderColor: colors.borderColor },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={i18n.t('reports.reportTitlePlaceholder')}
                  placeholderTextColor={colors.subtleText}
                />
              </View>
            </View>

            {/* Chart Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t('reports.chartType')}
              </Text>
              <View style={styles.row}>
                {renderOption(
                  i18n.t('reports.pie'),
                  chartType === 'pie',
                  () => setChartType('pie'),
                  'pie-chart',
                )}
                {renderOption(
                  i18n.t('reports.bar'),
                  chartType === 'bar',
                  () => setChartType('bar'),
                  'bar-chart',
                )}
              </View>
            </View>

            {/* Dimension */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t('reports.dimension')}
              </Text>
              <View style={styles.row}>
                {renderOption(i18n.t('reports.category'), dimension === 'category', () =>
                  setDimension('category'),
                )}
                {renderOption(i18n.t('reports.tag'), dimension === 'tag', () =>
                  setDimension('tag'),
                )}
                {renderOption(i18n.t('reports.cycle'), dimension === 'cycle', () =>
                  setDimension('cycle'),
                )}
              </View>
            </View>

            {/* Metric */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{i18n.t('reports.metric')}</Text>
              <View style={styles.blockRow}>
                {renderOption(i18n.t('reports.costMonthly'), metric === 'cost_monthly', () =>
                  setMetric('cost_monthly'),
                )}
                {renderOption(i18n.t('reports.costYearly'), metric === 'cost_yearly', () =>
                  setMetric('cost_yearly'),
                )}
                {renderOption(i18n.t('reports.count'), metric === 'count', () =>
                  setMetric('count'),
                )}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{i18n.t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContext: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  blockRow: {
    flexDirection: 'column',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
