import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';
import { UserSettings } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import { calculateHourlyRate } from '../../utils/valueConverter';
import i18n from '../../i18n';

export default function ValueConverterSettings() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useDatabase();

  // Local state for immediate UI feedback
  const [conversionEnabled, setConversionEnabled] = useState(false);
  const [salaryType, setSalaryType] = useState<'hourly' | 'monthly'>('hourly');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState('22');
  const [workHoursPerDay, setWorkHoursPerDay] = useState('8');

  useEffect(() => {
    if (settings) {
      setConversionEnabled(settings.conversionEnabled || false);
      setSalaryType(settings.salaryType || 'hourly');
      setSalaryAmount(settings.salaryAmount ? settings.salaryAmount.toString() : '');
      setWorkDaysPerMonth(settings.workDaysPerMonth ? settings.workDaysPerMonth.toString() : '22');
      setWorkHoursPerDay(settings.workHoursPerDay ? settings.workHoursPerDay.toString() : '8');
    }
  }, [settings]);

  const handleSave = async (updates: Partial<UserSettings>) => {
    // 立即更新 Context
    await updateSettings(updates);
  };

  const handleToggle = (value: boolean) => {
    setConversionEnabled(value);
    handleSave({ conversionEnabled: value });
  };

  const handleTypeChange = (type: 'hourly' | 'monthly') => {
    setSalaryType(type);
    handleSave({ salaryType: type });
  };

  const handleAmountChange = (text: string) => {
    setSalaryAmount(text);
    const amount = parseFloat(text);
    if (!isNaN(amount)) {
      handleSave({ salaryAmount: amount });
    }
  };

  const handleDaysChange = (text: string) => {
    setWorkDaysPerMonth(text);
    const days = parseInt(text, 10);
    if (!isNaN(days)) {
      handleSave({ workDaysPerMonth: days });
    }
  };

  const handleHoursChange = (text: string) => {
    setWorkHoursPerDay(text);
    const hours = parseInt(text, 10);
    if (!isNaN(hours)) {
      handleSave({ workHoursPerDay: hours });
    }
  };

  // Preview calculated rate
  const currentSettings: UserSettings = {
    ...settings!,
    conversionEnabled,
    salaryType,
    salaryAmount: parseFloat(salaryAmount) || 0,
    workDaysPerMonth: parseInt(workDaysPerMonth, 10) || 22,
    workHoursPerDay: parseInt(workHoursPerDay, 10) || 8,
  };

  const hourlyRate = calculateHourlyRate(currentSettings);

  if (!settings) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {i18n.t('settings.valueConverter.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtleText }]}>
            {i18n.t('settings.valueConverter.description')}
          </Text>
        </View>
        <Switch
          value={conversionEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#767577', true: colors.accent }}
          thumbColor={'#f4f3f4'}
        />
      </View>

      {conversionEnabled && (
        <View style={[styles.content, { borderTopColor: colors.borderColor }]}>
          {/* Mode Selection */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                salaryType === 'hourly' && { backgroundColor: colors.accent },
                { borderColor: colors.borderColor },
              ]}
              onPress={() => handleTypeChange('hourly')}
            >
              <Text
                style={[styles.typeText, { color: salaryType === 'hourly' ? '#fff' : colors.text }]}
              >
                {i18n.t('settings.valueConverter.hourly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                salaryType === 'monthly' && { backgroundColor: colors.accent },
                { borderColor: colors.borderColor },
              ]}
              onPress={() => handleTypeChange('monthly')}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: salaryType === 'monthly' ? '#fff' : colors.text },
                ]}
              >
                {i18n.t('settings.valueConverter.monthly')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {salaryType === 'hourly'
                ? i18n.t('settings.valueConverter.hourlyWage')
                : i18n.t('settings.valueConverter.monthlySalary')}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.currencyPrefix, { color: colors.subtleText }]}>$</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={salaryAmount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.subtleText}
              />
            </View>
          </View>

          {/* Monthly Details */}
          {salaryType === 'monthly' && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {i18n.t('settings.valueConverter.daysPerMonth')}
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={workDaysPerMonth}
                    onChangeText={handleDaysChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {i18n.t('settings.valueConverter.hoursPerDay')}
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={workHoursPerDay}
                    onChangeText={handleHoursChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Result Preview */}
          <View style={[styles.preview, { backgroundColor: colors.background }]}>
            <Text style={[styles.previewLabel, { color: colors.subtleText }]}>
              {i18n.t('settings.valueConverter.calculatedRate')}:
            </Text>
            <Text style={[styles.previewValue, { color: colors.text }]}>
              ${hourlyRate.toFixed(0)} / {i18n.t('settings.valueConverter.hr')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
  },
  currencyPrefix: {
    marginRight: 8,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  preview: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
