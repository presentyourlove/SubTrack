export default {
  // 通用
  common: {
    cancel: '取消',
    confirm: '確認',
    save: '儲存',
    edit: '編輯',
    delete: '刪除',
    back: '返回',
    loading: '載入中...',
    error: '發生錯誤',
    success: '成功',
  },
  // 錯誤訊息
  error: {
    emailInUse: '此 Email 已被註冊',
    registerFailed: '註冊失敗，請稍後再試',
    invalidCredentials: '帳號或密碼錯誤',
    loginFailed: '登入失敗，請稍後再試',
    logoutFailed: '登出失敗',
  },
  // 提醒卡片
  alert: {
    upcomingTitle: '即將扣款提醒',
    statusTitle: '扣款狀態',
    upcomingMessage: '有 {{count}} 筆款項將在 3 天內到期',
    balanceHint: '請確認您的戶頭餘額是否足夠',
  },
  // 總覽卡片
  summary: {
    monthlyTitle: '每月總支出',
    activeCount: '活躍訂閱',
    yearlyTitle: '預估年支出',
  },
  // 訂閱明細
  breakdown: {
    title: '訂閱明細',
    empty: '尚無訂閱資料',
    monthly: '月費用',
    yearly: '年費用',
    percentage: '占比',
  },
  // 圖表
  chart: {
    categoryTitle: '分類占比',
    expenseTitle: '費用統計',
  },
  // 畫面標題
  screen: {
    subscriptions: '訂閱管理',
  },
  // 訂閱相關
  subscription: {
    addTitle: '新增訂閱',
    editTitle: '編輯訂閱',
    name: '訂閱名稱',
    namePlaceholder: '例: Netflix Premium',
    price: '價格',
    pricePlaceholder: '390',
    category: '分類',
    cycle: '扣款週期',
    startDate: '訂閱開始日期',
    enableNotification: '啟用通知',
    notificationTime: '通知時間',
    reminderDays: '提前提醒 (天)',
    daysBefore: '{{count}} 天前',
    emptyList: '尚無訂閱',
    emptyCategory: '此分類尚無訂閱',
    addFirst: '新增第一筆訂閱',
  },
  // 日曆
  calendar: {
    webNotSupported: '日曆功能在 Web 平台不支援',
    removed: '已從日曆移除',
    removeFailed: '從日曆移除失敗',
    permissionRequired: '需要日曆權限才能同步',
    noCalendar: '找不到可用的日曆',
    eventTitle: '{{icon}} {{name}} 扣款',
    syncSuccess: '已成功同步到日曆！',
    syncFailed: '同步日曆失敗，請稍後再試',
    syncLabel: '同步到日曆',
    syncHint: '自動將扣款日期加入手機日曆',
    addFailed: '新增到日曆失敗',
    recurringFailed: '新增重複事件失敗',
    eventNotes: '金額: {{price}} {{currency}}\n週期: {{cycle}}',
  },
  // 通知
  notification: {
    upcomingTitle: '訂閱即將到期 📅',
    upcomingBody: '{{name}} 將在 {{days}} 天後扣款 {{price}} {{currency}}',
    testTitle: '測試通知 ✅',
    testBody: '通知功能運作正常！',
    permissionRequired: '未授予通知權限',
  },
  // 卡片
  card: {
    remainingDays: '剩餘 {{days}} 天',
    nextBilling: '下次扣款:',
    notSet: '未設定',
    perMonth: '月',
    perYear: '年',
  },
  // 分類
  categories: {
    all: '全部',
    entertainment: '娛樂',
    productivity: '生產力',
    lifestyle: '生活',
    other: '其他',
  },
  // 週期
  cycles: {
    weekly: '每週',
    monthly: '每月',
    quarterly: '每季',
    yearly: '每年',
  },
  // 設定
  settings: {
    title: '設定',
    theme: '主題管理',
    currency: '幣別管理',
    notifications: '通知設定',
    sync: '同步管理',
    about: '關於',
    lightMode: '淺色模式',
    darkMode: '深色模式',
    mainCurrency: '主要幣別: {{currency}}',
    authStatus: '已登入: {{email}}',
    loginToSync: '登入以啟用雲端同步',
  },
  // 日期工具
  date: {
    expired: '已過期',
    today: '今天',
    tomorrow: '明天',
    daysLater: '{{days}}天後',
    weeksLater: '{{weeks}}週後',
    monthsLater: '{{months}}個月後',
  },
  // 幣別名稱
  currencyNames: {
    TWD: '新台幣',
    USD: '美金',
    JPY: '日圓',
    CNY: '人民幣',
    HKD: '港幣',
    MOP: '澳門幣',
    GBP: '英鎊',
    KRW: '韓元',
    EUR: '歐元',
  },
  // 驗證與錯誤訊息
  validation: {
    requiredFields: '請填寫所有必填欄位',
    invalidEmail: '電子郵件格式不正確',
    passwordTooShort: '密碼至少需要6個字元',
    loginSuccess: '登入成功！',
    registerSuccess: '註冊成功！',
    logoutSuccess: '已登出',
    syncUploadSuccess: '資料已上傳到雲端',
    syncDownloadSuccess: '資料已從雲端下載',
    saveFailed: '儲存失敗，請稍後再試',
    deleteFailed: '刪除訂閱失敗，請稍後再試',
  },
};
