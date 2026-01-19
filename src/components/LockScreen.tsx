import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurity } from '../context/SecurityContext';
import { useTheme } from '../context/ThemeContext';

export const LockScreen = () => {
  const { unlock, isLocked } = useSecurity();
  const { colors } = useTheme();

  useEffect(() => {
    if (isLocked) {
      unlock();
    }
  }, [isLocked, unlock]);

  if (!isLocked) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={80} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>SubTrack 已鎖定</Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          請使用生物辨識解鎖以繼續存取您的財務資訊
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => unlock()}
        >
          <Ionicons name="finger-print" size={24} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>立即解鎖</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
