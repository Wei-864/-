// pages/index/index.js
Page({
  data: {
    records: [],
    monthTotal: '0.00',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    showModal: false,
    newAmount: '',
    newCategory: '',
    newNote: '',
    newDate: '',
    categories: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '服饰', '通讯', '其他']
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    // 每次页面显示时刷新数据
    this.loadRecords();
  },

  // 加载账单数据
  loadRecords() {
    const { currentYear, currentMonth } = this.data;
    wx.showLoading({ title: '加载中...' });
    
    wx.request({
      url: `http://localhost:3000/api/records/${currentYear}/${currentMonth}`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const records = res.data;
          // 给每个记录添加颜色
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F39C12', '#2ECC71', '#E74C3C', '#3498DB'];
          records.forEach((item, index) => {
            item.color = colors[index % colors.length];
          });
          const total = records.reduce((sum, item) => sum + parseFloat(item.amount), 0);
          this.setData({
            records: records,
            monthTotal: total.toFixed(2)
          });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ 
          title: '请确保后端服务已启动', 
          icon: 'none',
          duration: 3000
        });
        console.error('请求失败:', err);
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
      this.loadRecords();
    });
  },

  // 下个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    const now = new Date();
    const maxYear = now.getFullYear();
    const maxMonth = now.getMonth() + 1;
    // 不能超过当前月
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
      this.loadRecords();
    });
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      newAmount: '',
      newCategory: '',
      newNote: '',
      newDate: new Date().toISOString().split('T')[0]
    });
  },

  // 隐藏添加弹窗
  hideAddModal() {
    this.setData({ showModal: false });
  },

  // 阻止冒泡
  stopPropagation() {},

  // 金额输入
  onAmountInput(e) {
    this.setData({ newAmount: e.detail.value });
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({ newNote: e.detail.value });
  },

  // 选择类别
  selectCategory(e) {
    this.setData({ newCategory: e.currentTarget.dataset.cat });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({ newDate: e.detail.value });
  },

  // 添加记录
  addRecord() {
    const { newAmount, newCategory, newNote, newDate } = this.data;
    
    if (!newAmount || parseFloat(newAmount) <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }
    if (!newCategory) {
      wx.showToast({ title: '请选择类别', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    
    wx.request({
      url: 'http://localhost:3000/api/records',
      method: 'POST',
      data: {
        amount: parseFloat(newAmount),
        category: newCategory,
        note: newNote || '',
        record_date: newDate
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          wx.showToast({ title: '✅ 添加成功' });
          this.hideAddModal();
          this.loadRecords(); // 刷新列表
        } else {
          wx.showToast({ title: res.data.error || '添加失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '提交失败，请检查网络', icon: 'none' });
        console.error('提交失败:', err);
      }
    });
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '⚠️ 确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          wx.request({
            url: `http://localhost:3000/api/records/${id}`,
            method: 'DELETE',
            success: (result) => {
              wx.hideLoading();
              if (result.data.success) {
                wx.showToast({ title: '✅ 删除成功' });
                this.loadRecords();
              } else {
                wx.showToast({ title: result.data.error || '删除失败', icon: 'none' });
              }
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  }
});