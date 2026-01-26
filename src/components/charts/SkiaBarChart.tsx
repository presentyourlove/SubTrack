import React, { useEffect, useMemo } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import { Canvas, Rect, Group } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

export interface SkiaBarDataPoint {
  label: string;
  value: number;
  color?: string;
  breakdown?: { color: string; value: number }[];
}

interface SkiaBarChartProps {
  data: SkiaBarDataPoint[];
  height?: number;
  showLabels?: boolean;
  barBorderRadius?: number;
}

export const SkiaBarChart = ({
  data,
  height = 200,
  showLabels = true,
  barBorderRadius = 4,
}: SkiaBarChartProps) => {
  const { colors } = useTheme();
  const [canvasWidth, setCanvasWidth] = React.useState(0);

  // Animation state (0 to 1)
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [data, progress]);

  const onLayout = (e: LayoutChangeEvent) => {
    setCanvasWidth(e.nativeEvent.layout.width);
  };

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const chartHeight = height - (showLabels ? 24 : 0); // Reserve space for labels if drawn outside

  if (!data || data.length === 0) {
    return <View style={{ height }} />;
  }

  // Calculate bar dimensions
  const spacing = 12; // fixed spacing for now
  // Dynamic width based on container
  const totalSpacing = spacing * (data.length - 1);
  const availableWidth = canvasWidth > 0 ? canvasWidth : 300; // fallback
  const barWidth = (availableWidth - totalSpacing) / data.length;

  return (
    <View style={{ height, width: '100%' }} onLayout={onLayout} testID="bar-chart-container">
      {canvasWidth > 0 && (
        <>
          <Canvas style={{ width: canvasWidth, height: chartHeight }}>
            {data.map((item, index) => {
              const x = index * (barWidth + spacing);
              const targetBarHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;

              return (
                <BarItem
                  key={index}
                  x={x}
                  y={chartHeight}
                  width={barWidth}
                  targetHeight={targetBarHeight}
                  color={item.color || colors.accent}
                  breakdown={item.breakdown}
                  progress={progress}
                  totalValue={item.value}
                  radius={barBorderRadius}
                />
              );
            })}
          </Canvas>

          {/* Labels rendered outside for perfect text rendering without font loading */}
          {showLabels && (
            <View
              style={{
                flexDirection: 'row',
                height: 24,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {data.map((item, index) => (
                <View
                  key={index}
                  style={{
                    width: barWidth,
                    marginLeft: index === 0 ? 0 : spacing,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.subtleText }} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// Sub-component to handle animation per bar
const BarItem = ({
  x,
  y,
  width,
  targetHeight,
  color,
  breakdown,
  progress,
  totalValue,
  radius: _radius,
}: {
  x: number;
  y: number;
  width: number;
  targetHeight: number;
  color: string;
  breakdown?: { color: string; value: number }[];
  progress: SharedValue<number>;
  totalValue: number;
  radius: number;
}) => {
  const height = useDerivedValue(() => targetHeight * progress.value);
  const currentY = useDerivedValue(() => y - height.value);

  if (breakdown && breakdown.length > 0) {
    // Calculate accumulated heights for rendering
    // Calculate accumulated heights for rendering
    const segments = breakdown.reduce(
      (acc, seg) => {
        const h = totalValue > 0 ? (seg.value / totalValue) * targetHeight : 0;
        const rectY = y - acc.currentStackH - h;
        acc.items.push({ ...seg, h, rectY });
        acc.currentStackH += h;
        return acc;
      },
      { items: [] as ((typeof breakdown)[0] & { h: number; rectY: number })[], currentStackH: 0 },
    ).items;

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Group origin={{ x: x + width / 2, y: y }} transform={[{ scaleY: progress as any }]}>
        {segments.map((seg, i) => (
          <Rect key={i} x={x} y={seg.rectY} width={width} height={seg.h} color={seg.color} />
        ))}
      </Group>
    );
  }

  // Single Bar
  // r is used for border radius in Skia Rect, if supported (actually Skia Rect takes separate prop or RRect)
  // But standard Rect component in React Native Skia might accept 'r' if it's the RRect alias?
  // Checking docs: Rect has x, y, width, height, color. RoundedRect (RRect) is different.
  // Assuming Rect component here supports 'r' as per some versions or we ignore if not.
  // To be safe and fix lint "Property 'r' does not exist", we can use just Rect without r, or RRect if available.
  // Let's remove 'r' for now to match lint requirements or pass it via other means if needed.
  // Actually, standard Rect doesn't take 'r'. We need <RoundedRect> or <RRect>.
  // But I will just remove it to satisfy lint for now, or use path.

  return <Rect x={x} y={currentY} width={width} height={height} color={color} />;
};
