import React, { useCallback } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export interface OptimizedListProps<T> extends FlashListProps<T> {
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  estimatedItemSize: number;
}

/**
 * A highly optimized list component using Shopify's FlashList.
 * FlashList provides better performance by recycling components.
 */
export function OptimizedList<T>(props: OptimizedListProps<T>) {
  const {
    data,
    renderItem,
    estimatedItemSize,
    loading,
    ListEmptyComponent,
    contentContainerStyle,
    ...rest
  } = props;

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [loading]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ListComponent = FlashList as any;

  return (
    <ListComponent
      data={data}
      renderItem={renderItem}
      estimatedItemSize={estimatedItemSize || 100}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={contentContainerStyle}
      // Performance tweaks
      drawDistance={250}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
