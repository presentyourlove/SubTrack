import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_EXCHANGE_RATES } from '../../constants/AppConfig';
import i18n from '../../i18n';

export default function CurrencySettings() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useDatabase();
  const { showToast } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [exchangeRateModalVisible, setExchangeRateModalVisible] = useState(false);

  const [editingRates, setEditingRates] = useState<{ [key: string]: string }>({});
  const [newCurrencyCode, setNewCurrencyCode] = useState('');
  const [newCurrencyRate, setNewCurrencyRate] = useState('');

  // 取得所有可用幣別列表 (包含自訂)
  const getAvailableCurrencies = () => {
    const storedRates = settings?.exchangeRates ? JSON.parse(settings.exchangeRates) : {};
    const mergedRates = { ...DEFAULT_EXCHANGE_RATES, ...storedRates };
    return Object.keys(mergedRates).sort();
  };

  const availableCurrencies = getAvailableCurrencies();

  // 處理幣別變更
  const handleCurrencyChange = async (currency: string) => {
    await updateSettings({ mainCurrency: currency });
  };

  // 開啟匯率編輯器
  const handleOpenExchangeRateEditor = () => {
    const storedRates = settings?.exchangeRates ? JSON.parse(settings.exchangeRates) : {};
    const mergedRates = { ...DEFAULT_EXCHANGE_RATES, ...storedRates };

    const ratesAsStrings: { [key: string]: string } = {};
    Object.keys(mergedRates).forEach((key) => {
      ratesAsStrings[key] = (mergedRates as Record<string, number>)[key].toString();
    });

    setEditingRates(ratesAsStrings);
    setExchangeRateModalVisible(true);
  };

  // 儲存匯率
  const handleSaveExchangeRates = async () => {
    try {
      const ratesAsNumbers: { [key: string]: number } = {};
      Object.keys(editingRates).forEach((key) => {
        const value = parseFloat(editingRates[key]);
        if (isNaN(value) || value <= 0) {
          throw new Error(`${key} 的匯率格式不正確`);
        }
        ratesAsNumbers[key] = value;
      });

      await updateSettings({
        exchangeRates: JSON.stringify(ratesAsNumbers),
      });

      setExchangeRateModalVisible(false);
      showToast('匯率已更新', 'success');
      setModalVisible(false); // Close parent modal too if desired, or keep open. Keeping open is better UX usually, but original closed it.
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      }
    }
  };

  // 重置為預設匯率
  const handleResetExchangeRates = () => {
    const ratesAsStrings: { [key: string]: string } = {};
    Object.keys(DEFAULT_EXCHANGE_RATES).forEach((key) => {
      ratesAsStrings[key] = (DEFAULT_EXCHANGE_RATES as Record<string, number>)[key].toString();
    });
    setEditingRates(ratesAsStrings);
  };

  // 新增自訂幣別
  const handleAddCurrency = () => {
    if (!newCurrencyCode || !newCurrencyRate) {
      showToast('請輸入幣別代碼與匯率', 'error');
      return;
    }

    const code = newCurrencyCode.toUpperCase();
    if (editingRates[code]) {
      showToast('此幣別已存在', 'error');
      return;
    }

    setEditingRates((prev) => ({
      ...prev,
      [code]: newCurrencyRate,
    }));
    setNewCurrencyCode('');
    setNewCurrencyRate('');
    showToast(`已新增 ${code}`, 'success');
  };

  // 刪除幣別
  const handleDeleteCurrency = (code: string) => {
    if (Object.prototype.hasOwnProperty.call(DEFAULT_EXCHANGE_RATES, code)) {
      showToast('無法刪除預設幣別', 'error');
      return;
    }

    const newRates = { ...editingRates };
    delete newRates[code];
    setEditingRates(newRates);
    showToast(`已刪除 ${code}`, 'success');
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.settingItem,
          { backgroundColor: colors.card, borderColor: colors.borderColor },
        ]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('settings.currency')}
        accessibilityHint={i18n.t('settings.mainCurrency', {
          currency: settings?.mainCurrency || 'TWD',
        })}
      >
        <View style={styles.settingIcon}>
          <Ionicons name="cash" size={24} color={colors.accent} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {i18n.t('settings.currency')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
            {i18n.t('settings.mainCurrency', {
              currency: settings?.mainCurrency || 'TWD',
            })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
      </TouchableOpacity>

      {/* 幣別選擇 Modal */}
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
                {i18n.t('settings.currency')}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('common.close')}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>主要幣別</Text>
              <View style={styles.currencyGrid}>
                {availableCurrencies.map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.currencyButton,
                      { backgroundColor: colors.card, borderColor: colors.borderColor },
                      settings?.mainCurrency === code && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() => handleCurrencyChange(code)}
                    accessibilityRole="button"
                    accessibilityLabel={code}
                    accessibilityState={{ selected: settings?.mainCurrency === code }}
                  >
                    <Text
                      style={[
                        styles.currencyCode,
                        { color: colors.text },
                        settings?.mainCurrency === code && { color: '#ffffff' },
                      ]}
                    >
                      {code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.exchangeRateButton,
                  { backgroundColor: colors.card, borderColor: colors.borderColor },
                ]}
                onPress={handleOpenExchangeRateEditor}
                accessibilityRole="button"
                accessibilityLabel="編輯匯率與新增幣別"
              >
                <Ionicons name="swap-horizontal" size={20} color={colors.accent} />
                <Text style={[styles.exchangeRateButtonText, { color: colors.text }]}>
                  編輯匯率與新增幣別
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 匯率編輯 Modal */}
      <Modal
        visible={exchangeRateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExchangeRateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>編輯匯率</Text>
              <TouchableOpacity
                onPress={() => setExchangeRateModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('common.close')}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={[styles.modalHint, { color: colors.subtleText }]}>
                匯率相對於 TWD (新台幣 = 1)
              </Text>

              {/* 新增幣別區塊 */}
              <View
                style={[
                  styles.addCurrencySection,
                  { borderColor: colors.borderColor, backgroundColor: colors.card },
                ]}
              >
                <Text style={[styles.sectionSubtitle, { color: colors.text }]}>新增幣別</Text>
                <View style={styles.addCurrencyRow}>
                  <TextInput
                    accessibilityLabel="Text input field"
                    style={[
                      styles.smallInput,
                      { color: colors.text, borderColor: colors.borderColor },
                    ]}
                    placeholder="代碼 (Ex: EUR)"
                    placeholderTextColor={colors.subtleText}
                    value={newCurrencyCode}
                    onChangeText={setNewCurrencyCode}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                  <TextInput
                    accessibilityLabel="Text input field"
                    style={[
                      styles.smallInput,
                      { color: colors.text, borderColor: colors.borderColor },
                    ]}
                    placeholder="匯率"
                    placeholderTextColor={colors.subtleText}
                    value={newCurrencyRate}
                    onChangeText={setNewCurrencyRate}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity
                    testID="add-currency-button"
                    style={[styles.addButton, { backgroundColor: colors.accent }]}
                    onPress={handleAddCurrency}
                    accessibilityRole="button"
                    accessibilityLabel={i18n.t('common.add')}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.text, marginTop: 16, marginBottom: 8 },
                ]}
              >
                現有匯率
              </Text>
              {Object.keys(editingRates)
                .sort()
                .map((code) => (
                  <View key={code} style={styles.rateRow}>
                    <View style={styles.rateLabel}>
                      <Text style={[styles.rateCurrency, { color: colors.text }]}>{code}</Text>
                      {!Object.prototype.hasOwnProperty.call(DEFAULT_EXCHANGE_RATES, code) && (
                        <Text style={[styles.customBadge, { color: colors.accent }]}>自訂</Text>
                      )}
                    </View>
                    <TextInput
                      accessibilityLabel="Text input field"
                      style={[
                        styles.rateInput,
                        {
                          backgroundColor: colors.card,
                          color: colors.text,
                          borderColor: colors.borderColor,
                        },
                      ]}
                      value={editingRates[code] || ''}
                      onChangeText={(text) =>
                        setEditingRates({
                          ...editingRates,
                          [code]: text,
                        })
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.subtleText}
                    />
                    {!Object.prototype.hasOwnProperty.call(DEFAULT_EXCHANGE_RATES, code) && (
                      <TouchableOpacity
                        testID={`delete-currency-${code}`}
                        style={[styles.deleteButton, { backgroundColor: colors.expense }]}
                        onPress={() => handleDeleteCurrency(code)}
                        accessibilityRole="button"
                        accessibilityLabel={i18n.t('common.delete')}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                testID="reset-rates-button"
                style={[styles.modalButton, { borderColor: colors.borderColor }]}
                onPress={handleResetExchangeRates}
                accessibilityRole="button"
                accessibilityLabel="重置為預設"
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>重置為預設</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="save-rates-button"
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={handleSaveExchangeRates}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('common.save')}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>儲存</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
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
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  currencyButton: {
    width: '30%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  exchangeRateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  exchangeRateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalHint: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  addCurrencySection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  addCurrencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  rateLabel: {
    width: 60,
  },
  rateCurrency: {
    fontSize: 16,
    fontWeight: '600',
  },
  customBadge: {
    fontSize: 10,
    marginTop: 2,
  },
  rateInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
  },
  modalButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
