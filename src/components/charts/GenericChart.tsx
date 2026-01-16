import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ChartData } from '../../services/db/reports';

type GenericChartProps = {
  data: ChartData[];
  type: 'pie' | 'bar';
  title?: string;
  height?: number;
};

export default function GenericChart({ data, type, title, height = 200 }: GenericChartProps) {
  const { colors } = useTheme();

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
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
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
        <View style={styles.pieContainer}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <View key={index} style={styles.pieItem}>
                <View style={styles.pieRow}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.pieLabel, { color: colors.text }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[styles.pieValue, { color: colors.text }]}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.pieBar}>
                  <View
                    style={[
                      styles.pieBarFill,
                      { backgroundColor: item.color, width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // == BAR CHART ==
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <View style={[styles.barContainer, { height }]}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height * 0.8) : 0;
          return (
            <View key={index} style={styles.barItem}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: item.color || colors.accent,
                      height: barHeight,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.subtleText }]} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={[styles.barValue, { color: colors.text }]}>
                {Math.round(item.value)}
              </Text>
            </View>
          );
        })}
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
  // PIE
  pieContainer: { gap: 12 },
  pieItem: { gap: 4 },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  pieLabel: { flex: 1, fontSize: 14 },
  pieValue: { fontSize: 14, fontWeight: '600' },
  pieBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  pieBarFill: { height: '100%', borderRadius: 4 },
  // BAR
  barContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barItem: { flex: 1, alignItems: 'center', gap: 4 },
  barWrapper: { width: '80%', flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { fontSize: 10, maxWidth: 40 },
  barValue: { fontSize: 10, fontWeight: '600' },
});
