import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { BillingCycle } from '../../types';
import { DEFAULT_EXCHANGE_RATES } from '../../constants/AppConfig';
import i18n from '../../i18n';

type PaymentInfoProps = {
  price: string;
  setPrice: (price: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
  startDate: Date | string;
  setStartDate: (date: Date) => void;
};

export default function PaymentInfo({
  price,
  setPrice,
  currency,
  setCurrency,
  billingCycle,
  setBillingCycle,
  startDate,
  setStartDate,
}: PaymentInfoProps) {
  const { colors } = useTheme();

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const SUPPORTED_CURRENCIES = Object.keys(DEFAULT_EXCHANGE_RATES);

  return (
    <>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{i18n.t('subscription.price')} *</Text>
        <View style={styles.row}>
          <TextInput
            accessibilityLabel="Text input field"
            style={[
              styles.input,
              styles.priceInput,
              { backgroundColor: colors.inputBackground, color: colors.text },
            ]}
            value={price}
            onChangeText={setPrice}
            placeholder={i18n.t('subscription.pricePlaceholder')}
            placeholderTextColor={colors.subtleText}
            keyboardType="numeric"
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.currencyButton, { backgroundColor: colors.inputBackground }]}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <Text style={[styles.currencyText, { color: colors.text }]}>
              {String(currency || 'TWD')}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{i18n.t('subscription.cycle')} *</Text>
        <View style={styles.cycleContainer}>
          {(['weekly', 'monthly', 'quarterly', 'yearly'] as BillingCycle[]).map((cycle) => (
            <TouchableOpacity
              accessibilityRole="button"
              key={cycle}
              style={[
                styles.cycleButton,
                { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
                billingCycle === cycle && {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
              onPress={() => setBillingCycle(cycle)}
            >
              <Text
                style={[
                  styles.cycleText,
                  { color: colors.text },
                  billingCycle === cycle && { color: '#ffffff' },
                ]}
              >
                {i18n.t(`cycles.${cycle}`) || cycle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          {i18n.t('subscription.startDate')} *
        </Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={
              typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0]
            }
            onChange={(e) => setStartDate(new Date(e.target.value))}
            style={{
              height: 50,
              borderRadius: 12,
              paddingLeft: 16,
              paddingRight: 16,
              fontSize: 16,
              backgroundColor: colors.inputBackground,
              color: colors.text,
              border: 'none',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'system-ui',
            }}
          />
        ) : (
          <>
            <TouchableOpacity
              accessibilityRole="button"
              style={[
                styles.input,
                { backgroundColor: colors.inputBackground, justifyContent: 'center' },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {String(
                  (typeof startDate === 'string'
                    ? new Date(startDate)
                    : startDate
                  ).toLocaleDateString(i18n.locale),
                )}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={typeof startDate === 'string' ? new Date(startDate) : startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}
          </>
        )}
      </View>

      <Modal
        visible={currencyModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {i18n.t('settings.currency')}
            </Text>
            <FlatList
              data={SUPPORTED_CURRENCIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[
                    styles.currencyOption,
                    item === currency && { backgroundColor: colors.inputBackground },
                  ]}
                  onPress={() => {
                    setCurrency(item);
                    setCurrencyModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.currencyOptionText,
                      { color: colors.text },
                      item === currency && { color: colors.accent, fontWeight: 'bold' },
                    ]}
                  >
                    {item}
                  </Text>
                  {item === currency && (
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  priceInput: {
    flex: 1,
  },
  currencyButton: {
    width: 100,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cycleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  cycleText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  currencyOptionText: {
    fontSize: 16,
  },
});
