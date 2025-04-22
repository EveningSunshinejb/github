// pages/activity/joined/index.js
Page({
  data: {
    activities: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadActivities();
  },

  onPullDownRefresh() {
    this.setData({
      activities: [],
      page: 1,
      hasMore: true
    });
    this.loadActivities().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities();
    }
  },

  async loadActivities() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      // 模拟API调用，实际项目中应替换为真实的API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const newActivities = [
        {
          id: this.data.page,
          title: `活动${this.data.page}`,
          date: '2024-01-20',
          location: '活动地点',
          organizer: '活动发起人',
          status: '报名成功'
        }
      ];

      this.setData({
        activities: [...this.data.activities, ...newActivities],
        page: this.data.page + 1,
        hasMore: this.data.page < 5 // 模拟只有5页数据
      });
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 查看活动详情
  viewActivityDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/activity/detail/index?id=${id}`
    });
  }
});