/**
 * ServiceCatalogModal Component
 * 服務選擇彈窗
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ServiceTemplate,
  getServicesByCategory,
  searchServices,
} from '../constants/serviceCatalog';
import { SubscriptionCategory } from '../types';
import { ServiceCard } from './ServiceCard';
import i18n from '../i18n';

interface ServiceCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (service: ServiceTemplate) => void;
}

type CategoryFilter = SubscriptionCategory | 'all';

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'entertainment', label: '影音' },
  { key: 'productivity', label: '工具' },
  { key: 'lifestyle', label: '生活' },
  { key: 'other', label: '其他' },
];

export function ServiceCatalogModal({
  visible,
  onClose,
  onSelect,
}: ServiceCatalogModalProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    let services: ServiceTemplate[];

    if (searchQuery.trim()) {
      services = searchServices(searchQuery);
    } else {
      services = getServicesByCategory(selectedCategory);
    }

    return services;
  }, [selectedCategory, searchQuery]);

  const handleSelect = (service: ServiceTemplate) => {
    onSelect(service);
    onClose();
    // Reset state
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      height: '80%',
      backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    closeButton: {
      padding: 4,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
      borderRadius: 10,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 15,
      color: isDark ? '#ffffff' : '#000000',
    },
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
    },
    tabSelected: {
      backgroundColor: '#007AFF',
    },
    tabText: {
      fontSize: 13,
      fontWeight: '500',
      color: isDark ? '#ffffff' : '#333333',
    },
    tabTextSelected: {
      color: '#ffffff',
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 15,
      color: isDark ? '#8e8e93' : '#999999',
    },
  });

  const renderItem = ({ item }: { item: ServiceTemplate }) => (
    <ServiceCard service={item} onPress={handleSelect} />
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('serviceCatalog.title')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.close')}
            >
              <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={isDark ? '#8e8e93' : '#999999'}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={i18n.t('serviceCatalog.search')}
              placeholderTextColor={isDark ? '#8e8e93' : '#999999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={isDark ? '#8e8e93' : '#999999'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsContainer}>
            {CATEGORY_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selectedCategory === tab.key && styles.tabSelected]}
                onPress={() => {
                  setSelectedCategory(tab.key);
                  setSearchQuery('');
                }}
              >
                <Text
                  style={[styles.tabText, selectedCategory === tab.key && styles.tabTextSelected]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Service List */}
          {filteredServices.length > 0 ? (
            <FlatList
              data={filteredServices}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: 'flex-start', gap: 12 }}
              showsVerticalScrollIndicator={false}
              style={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{i18n.t('serviceCatalog.noResults')}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default ServiceCatalogModal;
