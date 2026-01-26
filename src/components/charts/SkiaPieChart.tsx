import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

export interface SkiaChartData {
  label: string;
  value: number;
  color: string;
}

interface SkiaPieChartProps {
  data: SkiaChartData[];
  size?: number;
  innerRadius?: number; // 0 for pie, >0 for donut
  showLabels?: boolean;
}

export const SkiaPieChart = ({
  data,
  size = 200,
  innerRadius = 0,
  showLabels: _showLabels = false,
}: SkiaPieChartProps) => {
  const { colors } = useTheme();
  const radius = size / 2;
  const center = { x: size / 2, y: size / 2 };

  // Animation state (0 to 1)
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
  }, [progress]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Pre-calculate paths
  let startAngle = 0;
  const slices = data.map((item) => {
    const value = item.value;
    const sweepAngle = total > 0 ? (value / total) * 360 : 0;

    // Create path for the slice
    const path = Skia.Path.Make();
    path.addArc(
      {
        x: center.x - radius,
        y: center.y - radius,
        width: size,
        height: size,
      },
      startAngle,
      sweepAngle,
    );

    // If it's a donut, we need to subtract the inner circle
    if (innerRadius > 0) {
      // Skia path diff or just drawing arc with stroke?
      // For solid slices in donut, easiest is to draw arc with stroke width if thickness is uniform,
      // but standard pie slices are wedges.
      // Let's use simple approach: Draw arc with center and connect lines.

      // Re-create path specifically for wedge
      path.reset();
      path.moveTo(center.x, center.y);
      path.arcToOval(
        { x: center.x - radius, y: center.y - radius, width: size, height: size },
        startAngle,
        sweepAngle,
        false,
      );
      path.close();

      // We will handle inner radius by drawing a center circle on top (simple mask) or path subtraction
      // Path subtraction is better for transparency but masking is cheaper.
      // Let's rely on path operations if we want perfect transparency.
    } else {
      path.moveTo(center.x, center.y);
      path.arcToOval(
        { x: center.x - radius, y: center.y - radius, width: size, height: size },
        startAngle,
        sweepAngle,
        false,
      );
      path.close();
    }

    const currentStartAngle = startAngle;
    startAngle += sweepAngle;

    return {
      ...item,
      path,
      startAngle: currentStartAngle,
      sweepAngle,
    };
  });

  // Inner circle path for donut hole (subtraction)
  const holePath = Skia.Path.Make();
  if (innerRadius > 0) {
    holePath.addCircle(center.x, center.y, innerRadius);
  }

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ flex: 1 }}>
        {slices.map((slice, index) => {
          // Animation: We can animate the sweep angle or the scale
          // Let's simply scale the path or clip it based on progress?
          // Animating sweep is tricky for all slices at once.
          // A simple circular reveal is easy: Clip with a circle that grows.

          // Or better: animate the end angle.
          // But for now, let's keep it static logic wrapped in progress maybe?
          // Actually, `path` object is static.

          // To animate, let's just use opacity or scale for simplicity in V1
          // or use `start` and `end` trim if we convert these to stroked paths.

          // Let's try drawing without heavy path ops for now.
          // Just draw the slice.
          return (
            <Path
              key={index}
              path={slice.path}
              color={slice.color}
              // Determine if we need to subtract hole
              // Skia typically paints in order. We can paint hole at the end.
            />
          );
        })}
        {innerRadius > 0 && <Path path={holePath} color={colors.card} />}
      </Canvas>
      {/* Overlay Text or Center Info if needed */}
    </View>
  );
};
