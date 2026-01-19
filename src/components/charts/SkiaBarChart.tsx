import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Rect, Skia, Path, LinearGradient, vec } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
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
  }, [data]);

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
    <View style={{ height, width: '100%' }} onLayout={onLayout}>
      {canvasWidth > 0 && (
        <>
          <Canvas style={{ width: canvasWidth, height: chartHeight }}>
            {data.map((item, index) => {
              const x = index * (barWidth + spacing);
              const targetBarHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;

              // We need to animate the height.
              // Since we are mapping inside Canvas, we can't easily use hooks per item if we don't extract components.
              // But we can derive values if we have a global progress.

              // Note: In Reanimated + Skia, simple values can be calculated in the render if they depend on sharedValue.
              // However, `targetBarHeight * progress.value` needs to be reactive.
              // Skia components accept derived values.

              // Let's create a wrapper or just use inline derived value?
              // Derived values hook rules apply.
              // Easier approach: Pass progress as prop to a sub-component, or use simple re-render for now (less perf)
              // OR best practice: Use `useDerivedValue` outside loop? No, can't vary hooks length.

              // Correct approach for list items:
              // Create a <BarItem> component that takes `progress` shared value

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
  radius,
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
    // Stacked Bar
    let accumulatedHeight = 0;
    return (
      <>
        {breakdown.map((seg, i) => {
          const segHeightFull = totalValue > 0 ? (seg.value / totalValue) * targetHeight : 0;
          // We animate the total stack, so each segment grows proportionally
          // The top of this segment depends on previous segments.

          // To keep it simple in shared value logic:
          // We can just calculate the static proportions and apply the same scale factor (progress) to all.

          // But we need derived values for each Rect?
          // Yes. To avoid hook violation in loop, we can just use the fact that Skia `Rect`
          // accepts numbers too, but then it won't animate on UI thread?
          // Skia components accept SharedValues for x, y, width, height.

          // It's tricky to create dynamic hooks in a loop.
          // Alternative: Use a Group with a transform scaleY?
          // Yes! Scale content from the bottom.

          const segHeight = segHeightFull;
          const segY = accumulatedHeight; // relative to bottom of stack (conceptually)

          accumulatedHeight += segHeight;

          // Determine color
          const c = seg.color;

          // We need to invert Y because screen coords
          // Let's render the stack at 0,0 (bottom-left) and transform the Group.

          return null; // Logic complex, handled below in Group
        })}
        <Group origin={{ x: x + width / 2, y: y }} transform={[{ scaleY: progress }]}>
          {/* Re-calculate stack for rendering inside Group */}
          {(() => {
            let currentStackH = 0;
            return breakdown.map((seg, i) => {
              const h = totalValue > 0 ? (seg.value / totalValue) * targetHeight : 0;
              const rectY = y - currentStackH - h;
              currentStackH += h;

              // Top radius only for top segment
              // Skia doesn't support disparate radii easily in Rect, need Path or RRect.
              // Let's use Rect for now.

              return <Rect key={i} x={x} y={rectY} width={width} height={h} color={seg.color} />;
            });
          })()}
        </Group>
      </>
    );
  }

  // Single Bar
  return (
    <Rect
      x={x}
      y={currentY}
      width={width}
      height={height}
      color={color}
      r={radius} // border radius
    />
  );
};
import { Group } from '@shopify/react-native-skia';

const styles = StyleSheet.create({});
