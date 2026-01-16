/**
 * ServiceCard Component
 * 服務卡片元件
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { ServiceTemplate } from '../constants/serviceCatalog';
import i18n from '../i18n';

interface ServiceCardProps {
  service: ServiceTemplate;
  onPress: (service: ServiceTemplate) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  entertainment: '影音娛樂',
  productivity: '生產力',
  lifestyle: '生活',
  other: '其他',
};

export function ServiceCard({ service, onPress }: ServiceCardProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      width: '30%',
      aspectRatio: 1,
      backgroundColor: isDark ? '#2c2c2e' : '#f5f5f5',
      borderRadius: 12,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    icon: {
      fontSize: 32,
      marginBottom: 4,
    },
    name: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#333333',
      textAlign: 'center',
    },
    category: {
      fontSize: 9,
      color: isDark ? '#8e8e93' : '#999999',
      marginTop: 2,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(service)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${i18n.t('serviceCatalog.select')} ${service.name}`}
    >
      <Text style={styles.icon}>{service.icon}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {service.name}
      </Text>
      <Text style={styles.category}>{CATEGORY_LABELS[service.category]}</Text>
    </TouchableOpacity>
  );
}

export default ServiceCard;
