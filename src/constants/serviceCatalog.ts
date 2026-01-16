/**
 * Service Catalog
 * 熱門訂閱服務預設資料
 */

import { SubscriptionCategory, BillingCycle } from '../types';

/**
 * 服務範本介面
 */
export interface ServiceTemplate {
  id: string;
  name: string;
  icon: string;
  category: SubscriptionCategory;
  defaultCurrency: string;
  defaultBillingCycle: BillingCycle;
  website?: string;
}

/**
 * 熱門訂閱服務清單
 */
export const SERVICE_CATALOG: ServiceTemplate[] = [
  // ========== 影音娛樂 ==========
  {
    id: 'netflix',
    name: 'Netflix',
    icon: '🎬',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.netflix.com',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.spotify.com',
  },
  {
    id: 'youtube_premium',
    name: 'YouTube Premium',
    icon: '▶️',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.youtube.com/premium',
  },
  {
    id: 'disney_plus',
    name: 'Disney+',
    icon: '🏰',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.disneyplus.com',
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    icon: '🍎',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.apple.com/apple-music/',
  },
  {
    id: 'hbo_max',
    name: 'HBO Max',
    icon: '📺',
    category: 'entertainment',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.max.com',
  },
  {
    id: 'amazon_prime',
    name: 'Amazon Prime',
    icon: '📦',
    category: 'entertainment',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'yearly',
    website: 'https://www.amazon.com/prime',
  },
  {
    id: 'apple_tv_plus',
    name: 'Apple TV+',
    icon: '📱',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.apple.com/apple-tv-plus/',
  },
  {
    id: 'kkbox',
    name: 'KKBOX',
    icon: '🎧',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.kkbox.com',
  },
  {
    id: 'nintendo_switch_online',
    name: 'Nintendo Switch Online',
    icon: '🎮',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'yearly',
    website: 'https://www.nintendo.com',
  },
  {
    id: 'playstation_plus',
    name: 'PlayStation Plus',
    icon: '🎮',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'yearly',
    website: 'https://www.playstation.com',
  },
  {
    id: 'xbox_game_pass',
    name: 'Xbox Game Pass',
    icon: '🎮',
    category: 'entertainment',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.xbox.com/game-pass',
  },

  // ========== 生產力工具 ==========
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.notion.so',
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: '🎨',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.figma.com',
  },
  {
    id: 'github',
    name: 'GitHub Pro',
    icon: '🐙',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://github.com',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    icon: '🤖',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://chat.openai.com',
  },
  {
    id: 'claude',
    name: 'Claude Pro',
    icon: '🧠',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://claude.ai',
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    icon: '📊',
    category: 'productivity',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'yearly',
    website: 'https://www.microsoft.com/microsoft-365',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📁',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.dropbox.com',
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    icon: '☁️',
    category: 'productivity',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.apple.com/icloud/',
  },
  {
    id: 'google_one',
    name: 'Google One',
    icon: '🔵',
    category: 'productivity',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://one.google.com',
  },
  {
    id: 'adobe_cc',
    name: 'Adobe Creative Cloud',
    icon: '🔴',
    category: 'productivity',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.adobe.com/creativecloud.html',
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    icon: '🖼️',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.canva.com',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://slack.com',
  },
  {
    id: 'todoist',
    name: 'Todoist Pro',
    icon: '✅',
    category: 'productivity',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'yearly',
    website: 'https://todoist.com',
  },

  // ========== 生活服務 ==========
  {
    id: 'uber_one',
    name: 'Uber One',
    icon: '🚗',
    category: 'lifestyle',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.uber.com',
  },
  {
    id: 'foodpanda_pro',
    name: 'foodpanda Pro',
    icon: '🐼',
    category: 'lifestyle',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.foodpanda.com',
  },
  {
    id: 'gym',
    name: '健身房會員',
    icon: '🏋️',
    category: 'lifestyle',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'kindle_unlimited',
    name: 'Kindle Unlimited',
    icon: '📚',
    category: 'lifestyle',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.amazon.com/kindle-dbs/hz/subscribe/ku',
  },
  {
    id: 'audible',
    name: 'Audible',
    icon: '🎧',
    category: 'lifestyle',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
    website: 'https://www.audible.com',
  },
  {
    id: 'newspaper',
    name: '報刊雜誌',
    icon: '📰',
    category: 'lifestyle',
    defaultCurrency: 'TWD',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'vpn',
    name: 'VPN 服務',
    icon: '🔐',
    category: 'lifestyle',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'yearly',
  },
  {
    id: 'domain',
    name: '網域名稱',
    icon: '🌐',
    category: 'other',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'yearly',
  },
  {
    id: 'hosting',
    name: '網頁代管',
    icon: '🖥️',
    category: 'other',
    defaultCurrency: 'USD',
    defaultBillingCycle: 'monthly',
  },
];

/**
 * 依分類取得服務清單
 */
export function getServicesByCategory(category: SubscriptionCategory | 'all'): ServiceTemplate[] {
  if (category === 'all') {
    return SERVICE_CATALOG;
  }
  return SERVICE_CATALOG.filter((service) => service.category === category);
}

/**
 * 搜尋服務
 */
export function searchServices(query: string): ServiceTemplate[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return SERVICE_CATALOG;

  return SERVICE_CATALOG.filter(
    (service) =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.id.toLowerCase().includes(lowerQuery),
  );
}

/**
 * 根據 ID 取得服務
 */
export function getServiceById(id: string): ServiceTemplate | undefined {
  return SERVICE_CATALOG.find((service) => service.id === id);
}
