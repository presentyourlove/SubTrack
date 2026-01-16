import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { formatTime } from '../../utils/dateHelper';
import i18n from '../../i18n';

type ReminderSettingsProps = {
  reminderEnabled: boolean;
  setReminderEnabled: (enabled: boolean) => void;
  reminderTime: Date;
  setReminderTime: (time: Date) => void;
  reminderDays: number;
  setReminderDays: (days: number) => void;
};

export default function ReminderSettings({
  reminderEnabled,
  setReminderEnabled,
  reminderTime,
  setReminderTime,
  reminderDays,
  setReminderDays,
}: ReminderSettingsProps) {
  const { colors } = useTheme();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDaysPicker, setShowDaysPicker] = useState(false);

  const REMINDER_DAYS_OPTIONS = Array.from({ length: 15 }, (_, i) => i); // 0-14 days

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || reminderTime;
    setShowTimePicker(Platform.OS === 'ios');
    setReminderTime(currentDate);
  };

  return (
    <>
      <View style={styles.field}>
        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
            {i18n.t('subscription.enableNotification')}
          </Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: colors.borderColor, true: colors.accent }}
            thumbColor={'#ffffff'}
          />
        </View>
        {reminderEnabled ? (
          <View style={styles.reminderContainer}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: colors.subtleText }]}>
                  {i18n.t('subscription.notificationTime')}
                </Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    value={
                      reminderTime instanceof Date && !isNaN(reminderTime.getTime())
                        ? formatTime(reminderTime)
                        : '09:00'
                    }
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date();
                      newDate.setHours(parseInt(hours, 10));
                      newDate.setMinutes(parseInt(minutes, 10));
                      setReminderTime(newDate);
                    }}
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
                  <TouchableOpacity
                    style={[styles.input, { backgroundColor: colors.inputBackground }]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={{ color: colors.text }}>
                      {reminderTime instanceof Date && !isNaN(reminderTime.getTime())
                        ? `${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`
                        : '09:00'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: colors.subtleText }]}>
                  {i18n.t('subscription.reminderDays')}
                </Text>
                <TouchableOpacity
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                  onPress={() => setShowDaysPicker(true)}
                >
                  <Text style={{ color: colors.text }}>
                    {reminderDays} {i18n.t('common.days')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={
            reminderTime instanceof Date && !isNaN(reminderTime.getTime())
              ? reminderTime
              : new Date()
          }
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      <Modal
        visible={showDaysPicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDaysPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDaysPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {i18n.t('subscription.reminderDays')}
            </Text>
            <FlatList
              data={REMINDER_DAYS_OPTIONS}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyOption, // Reusing similar style
                    item === reminderDays && { backgroundColor: colors.inputBackground },
                  ]}
                  onPress={() => {
                    setReminderDays(item);
                    setShowDaysPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.currencyOptionText,
                      { color: colors.text },
                      item === reminderDays && { color: colors.accent, fontWeight: 'bold' },
                    ]}
                  >
                    {i18n.t('subscription.daysBefore', { count: reminderDays })}
                  </Text>
                  {item === reminderDays && (
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
  subLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderContainer: {
    marginTop: 8,
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
