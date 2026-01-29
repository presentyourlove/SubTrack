import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { ChartData } from '../../../services/db/reports';
import { SkiaPieChart, SkiaChartData } from './SkiaPieChart';
import { SkiaBarChart, SkiaBarDataPoint } from './SkiaBarChart';
import { useSkiaWeb } from '../../../hooks/useSkiaWeb';

type GenericChartProps = {
  data: ChartData[];
  type: 'pie' | 'bar';
  title?: string;
  height?: number;
};

export default function GenericChart({ data, type, title, height = 200 }: GenericChartProps) {
  const { colors } = useTheme();
  // Ensure Skia is loaded before rendering charts to prevent crash on Web
  const { ready: skiaReady, error: skiaError } = useSkiaWeb();

  if (!skiaReady) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, height, alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <Text style={{ color: colors.text }}>
          {skiaError ? 'Failed to load chart engine.' : 'Loading charts...'}
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, height }]}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
        <View style={styles.center}>
          <Text style={{ color: colors.subtleText }}>No data available</Text>
        </View>
      </View>
    );
  }

  // == PIE CHART ==
  if (type === 'pie') {
    const pieData: SkiaChartData[] = data.map((d) => ({
      label: d.label,
      value: d.value,
      color: d.color || colors.accent,
    }));
    const total = pieData.reduce((sum, d) => sum + d.value, 0);

    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

        <View style={styles.contentRow}>
          <SkiaPieChart data={pieData} size={160} innerRadius={60} />

          {/* Legend */}
          <View style={styles.legendContainer}>
            {pieData.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <View>
                    <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.subtleText }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // == BAR CHART ==
  const barData: SkiaBarDataPoint[] = data.map((d) => ({
    label: d.label,
    value: d.value,
    color: d.color || colors.accent,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <View style={{ height: height - 40, width: '100%' }}>
        <SkiaBarChart data={barData} height={height - 40} showLabels={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 20,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 12,
  },
});
