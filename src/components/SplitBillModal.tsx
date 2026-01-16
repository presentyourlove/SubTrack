import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Member, Subscription } from '../types';
import * as MemberService from '../services/db/members';
import { useDatabase } from '../context/DatabaseContext';
import { formatCurrency } from '../utils/currencyHelper';
import i18n from '../i18n';

type SplitBillModalProps = {
  visible: boolean;
  onClose: () => void;
  subscription: Subscription;
  onUpdate?: () => void;
};

export default function SplitBillModal({
  visible,
  onClose,
  subscription,
  onUpdate,
}: SplitBillModalProps) {
  const { colors } = useTheme();
  const { database: db } = useDatabase();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!db) return;
      try {
        // 確保成員數量符合
        if (subscription.memberCount && subscription.memberCount > 0) {
          await MemberService.syncMemberCount(db, subscription.id, subscription.memberCount);
        }
        const data = await MemberService.getMembers(db, subscription.id);
        setMembers(data);
      } catch (error) {
        console.error('Failed to load members:', error);
        Alert.alert(i18n.t('common.error'), 'Failed to load members');
      }
    };

    if (visible && db) {
      loadMembers();
    }
  }, [visible, db, subscription.memberCount, subscription.id]);

  const handleToggleStatus = async (member: Member) => {
    if (!db) return;
    const newStatus = member.status === 'paid' ? 'unpaid' : 'paid';
    await MemberService.updateMemberStatus(db, member.id, newStatus);

    // Reload members
    const data = await MemberService.getMembers(db, subscription.id);
    setMembers(data);

    if (onUpdate) onUpdate();
  };

  const perPersonAmount =
    subscription.memberCount && subscription.memberCount > 0
      ? subscription.price / subscription.memberCount
      : 0;

  const unpaidCount = members.filter((m) => m.status === 'unpaid').length;
  const totalUnpaid = perPersonAmount * unpaidCount;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {i18n.t('splitBill.title', { defaultValue: 'Split Bill' })}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.summary, { backgroundColor: colors.card }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.subtleText }]}>Per Person</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(perPersonAmount, subscription.currency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.subtleText }]}>Total Unpaid</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                {formatCurrency(totalUnpaid, subscription.currency)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberItem,
                  { backgroundColor: colors.card, borderColor: colors.borderColor },
                ]}
                onPress={() => handleToggleStatus(member)}
              >
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                  <Text
                    style={[
                      styles.memberStatus,
                      { color: member.status === 'paid' ? colors.income : colors.expense },
                    ]}
                  >
                    {member.status === 'paid' ? 'PAID' : 'UNPAID'}
                  </Text>
                </View>
                <Ionicons
                  name={member.status === 'paid' ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={member.status === 'paid' ? colors.income : colors.subtleText}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    height: '70%',
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
  summary: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
