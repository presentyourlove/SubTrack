import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { formatCurrency, convertCurrency } from '../utils/currencyHelper';
import i18n from '../i18n';
import { usePrivacy } from '../hooks/usePrivacy';

export default function SummaryCard() {
  const { colors } = useTheme();
  const { subscriptions, settings } = useDatabase();
  const { maskValue } = usePrivacy();

  // 計算總金額
  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    const mainCurrency = settings?.mainCurrency || 'TWD';
    const exchangeRates = settings?.exchangeRates ? JSON.parse(settings.exchangeRates) : {};
    let monthly = 0;

    subscriptions.forEach((sub) => {
      // 轉換為主要幣別
      const convertedPrice = convertCurrency(sub.price, sub.currency, mainCurrency, exchangeRates);

      // 計算月費用
      if (sub.billingCycle === 'monthly') {
        monthly += convertedPrice;
      } else if (sub.billingCycle === 'yearly') {
        monthly += convertedPrice / 12;
      } else if (sub.billingCycle === 'weekly') {
        monthly += convertedPrice * 4; // 近似值
      } else if (sub.billingCycle === 'quarterly') {
        monthly += convertedPrice / 3;
      }
    });

    return {
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
    };
  }, [subscriptions, settings]);

  const activeCount = subscriptions.length;
  const mainCurrency = settings?.mainCurrency || 'TWD';

  return (
    <View style={[styles.container, { backgroundColor: colors.accent }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#ffffff' }]}>{i18n.t('summary.monthlyTitle')}</Text>
        <Text style={[styles.amount, { color: '#ffffff' }]}>
          {maskValue(formatCurrency(monthlyTotal, mainCurrency))}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
            {i18n.t('summary.activeCount')}
          </Text>
          <Text style={[styles.statValue, { color: '#ffffff' }]}>{activeCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
            {i18n.t('summary.yearlyTitle')}
          </Text>
          <Text style={[styles.statValue, { color: '#ffffff' }]}>
            {maskValue(formatCurrency(yearlyTotal, mainCurrency))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.9,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
});
