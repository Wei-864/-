// pages/statistics/statistics.js
Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    statistics: [],
    total: '0.00',
    count: 0,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F39C12', '#2ECC71', '#E74C3C', '#3498DB']
  },

  onLoad() {
    this.loadStatistics();
  },

  onShow() {
    this.loadStatistics();
  },

  // 加载统计数据
  loadStatistics() {
    const { currentYear, currentMonth } = this.data;
    wx.showLoading({ title: '加载中...' });
    
    wx.request({
      url: `http://localhost:3000/api/statistics/${currentYear}/${currentMonth}`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const data = res.data;
          // 计算总金额
          const total = data.reduce((sum, item) => sum + parseFloat(item.total), 0);
          // 计算每个分类的百分比
          const statistics = data.map((item, index) => {
            const percent = total > 0 ? (item.total / total * 100).toFixed(1) : 0;
            return {
              ...item,
              total: parseFloat(item.total).toFixed(2),
              percent: Math.min(percent, 100),
              count: item.count
            };
          });
          
          this.setData({
            statistics: statistics,
            total: total.toFixed(2),
            count: statistics.reduce((sum, item) => sum + item.count, 0)
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败，请检查后端服务', icon: 'none' });
      }
    });
  },

  // 上个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentYear -= 1;
      currentMonth = 12;
    } else {
      currentMonth -= 1;
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.loadStatistics();
    });
  },

  // 下个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    const now = new Date();
    const maxYear = now.getFullYear();
    const maxMonth = now.getMonth() + 1;
    
    if (currentYear === maxYear && currentMonth === maxMonth) {
      wx.showToast({ title: '不能查看未来月份', icon: 'none' });
      return;
    }
    if (currentMonth === 12) {
      currentYear += 1;
      currentMonth = 1;
    } else {
      currentMonth += 1;
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.loadStatistics();
    });
  }
});