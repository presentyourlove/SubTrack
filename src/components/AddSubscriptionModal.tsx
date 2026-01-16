import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { SubscriptionCategory, BillingCycle, Subscription } from '../types';
import { parseTime, formatTime, getDefaultReminderTime } from '../utils/dateHelper';
import i18n from '../i18n';
import { hapticFeedback } from '../utils/haptics';

import BasicInfo from './subscription/BasicInfo';
import CategorySelector from './subscription/CategorySelector';
import PaymentInfo from './subscription/PaymentInfo';
import ReminderSettings from './subscription/ReminderSettings';
import { TagSelector } from './TagSelector';

type AddSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  initialData?: Subscription | null;
  onSubmit: (
    data: {
      name: string;
      icon: string;
      category: SubscriptionCategory;
      price: number;
      currency: string;
      billingCycle: BillingCycle;
      startDate: string;
      reminderEnabled: boolean;
      reminderTime?: string;
      reminderDays?: number;
      isFamilyPlan?: boolean;
      memberCount?: number;
    },
    tagIds: number[],
  ) => void;
};

export default function AddSubscriptionModal({
  visible,
  onClose,
  initialData,
  onSubmit,
}: AddSubscriptionModalProps) {
  const { colors } = useTheme();
  const { tags, createTag, deleteTag, getTagsForSubscription } = useDatabase();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📱');
  const [category, setCategory] = useState<SubscriptionCategory>('entertainment');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TWD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => getDefaultReminderTime());
  const [reminderDays, setReminderDays] = useState(0);
  const [isFamilyPlan, setIsFamilyPlan] = useState(false);
  const [memberCount, setMemberCount] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name);
        setIcon(initialData.icon);
        setCategory(initialData.category);
        setPrice(initialData.price.toString());
        setCurrency(initialData.currency);
        setBillingCycle(initialData.billingCycle);
        setStartDate(
          typeof initialData.startDate === 'string'
            ? new Date(initialData.startDate)
            : initialData.startDate,
        );
        setReminderEnabled(initialData.reminderEnabled);

        if (initialData.reminderTime) {
          setReminderTime(parseTime(initialData.reminderTime));
        } else {
          setReminderTime(getDefaultReminderTime());
        }

        setReminderDays(initialData.reminderDays || 0);
        setIsFamilyPlan(initialData.isFamilyPlan || false);
        setMemberCount(initialData.memberCount ? initialData.memberCount.toString() : '');

        // 載入現有標籤
        getTagsForSubscription(initialData.id).then((existingTags) => {
          setSelectedTagIds(existingTags.map((t) => t.id));
        });
      } else {
        setName('');
        setIcon('📱');
        setCategory('entertainment');
        setPrice('');
        setCurrency('TWD');
        setBillingCycle('monthly');
        setStartDate(new Date());
        setReminderEnabled(false);
        setReminderTime(getDefaultReminderTime());
        setReminderDays(0);
        setIsFamilyPlan(false);
        setMemberCount('');
        setSelectedTagIds([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!name || !price || !startDate) {
      hapticFeedback.error();
      Alert.alert(i18n.t('common.error'), i18n.t('validation.requiredFields'));
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      hapticFeedback.error();
      Alert.alert(i18n.t('common.error'), i18n.t('validation.invalidAmount'));
      return;
    }

    const formattedTime = formatTime(reminderTime);

    hapticFeedback.success();
    onSubmit(
      {
        name,
        icon,
        category,
        price: numericPrice,
        currency,
        billingCycle,
        startDate:
          typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
        reminderEnabled,
        reminderTime: reminderEnabled ? formattedTime : undefined,
        reminderDays: reminderEnabled ? reminderDays : undefined,
        isFamilyPlan,
        memberCount: isFamilyPlan && memberCount ? parseInt(memberCount, 10) : undefined,
      },
      selectedTagIds,
    );

    // Reset form handled by parent closing modal or next open
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {initialData ? i18n.t('subscription.editTitle') : i18n.t('subscription.addTitle')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.close')}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <BasicInfo
              name={name}
              setName={setName}
              icon={icon}
              setIcon={setIcon}
              isFamilyPlan={isFamilyPlan}
              setIsFamilyPlan={setIsFamilyPlan}
              memberCount={memberCount}
              setMemberCount={setMemberCount}
            />
            <CategorySelector category={category} setCategory={setCategory} />
            <PaymentInfo
              price={price}
              setPrice={setPrice}
              currency={currency}
              setCurrency={setCurrency}
              billingCycle={billingCycle}
              setBillingCycle={setBillingCycle}
              startDate={startDate}
              setStartDate={setStartDate}
            />
            <ReminderSettings
              reminderEnabled={reminderEnabled}
              setReminderEnabled={setReminderEnabled}
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
              reminderDays={reminderDays}
              setReminderDays={setReminderDays}
            />
            <TagSelector
              tags={tags}
              selectedTagIds={selectedTagIds}
              onSelectionChange={setSelectedTagIds}
              onCreateTag={createTag}
              onDeleteTag={deleteTag}
            />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.cancel')}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                {i18n.t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              accessibilityRole="button"
              accessibilityLabel={initialData ? i18n.t('common.save') : i18n.t('common.confirm')}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                {initialData ? i18n.t('common.save') : i18n.t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
