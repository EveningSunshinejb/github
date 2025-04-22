// pages/activity/my/index.js
Page({
  data: {
    selectedDate: '',
    activeDates: [],
    organizedActivities: [],
    joinedActivities: [],
    loading: false,
    page: 1,
    hasMore: true,
    activeTab: 'organized'
  },

  onLoad() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.setData({ selectedDate: dateStr });
    this.loadActiveDates(today.getFullYear(), today.getMonth() + 1);
    this.loadActivities(dateStr);
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      organizedActivities: [],
      joinedActivities: [],
      page: 1,
      hasMore: true
    });
    this.loadActivities(this.data.selectedDate);
  },

  onPullDownRefresh() {
    this.setData({
      organizedActivities: [],
      joinedActivities: [],
      page: 1,
      hasMore: true
    });
    this.loadActivities(this.data.selectedDate).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities(this.data.selectedDate);
    }
  },

  async loadActiveDates(year, month) {
    try {
      wx.showLoading({
        title: '加载中...'
      });
      
      const db = wx.cloud.database();
      const _ = db.command;
      
      // 如果没有传入年月，使用当前选择的日期
      if (!year || !month) {
        const selectedDate = new Date(this.data.selectedDate);
        year = selectedDate.getFullYear();
        month = selectedDate.getMonth() + 1;
      }
      
      const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
      const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
      
      const activities = await db.collection('activities')
        .where({
          date: _.gte(startOfMonth).and(_.lte(endOfMonth)),
          organizerId: wx.getStorageSync('openid')
        })
        .field({ date: true })
        .get();
      
      const dates = [...new Set(activities.data.map(activity => activity.date))];
      this.setData({ activeDates: dates });
    } catch (error) {
      console.error('加载活动日期失败:', error);
      // 静默处理错误，设置空数组保持页面可用
      this.setData({ activeDates: [] });
    } finally {
      wx.hideLoading();
    }
  },

  onMonthChange(e) {
    const { year, month } = e.detail;
    this.loadActiveDates(year, month);
  },

  onDateSelect(e) {
    const { date } = e.detail;
    if (!date) return;
    
    this.setData({
      selectedDate: date,
      organizedActivities: [],
      joinedActivities: [],
      page: 1,
      hasMore: true
    });
    wx.showLoading({
      title: '加载中...'
    });
    this.loadActivities(date)
      .catch(error => {
        console.error('加载活动失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  async loadActivities(date) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const db = wx.cloud.database();
      const _ = db.command;
      const openid = wx.getStorageSync('openid');

      // 获取我组织的活动
      const organizedResult = await db.collection('activities')
        .where({
          date: date,
          organizerId: openid
        })
        .orderBy('createTime', 'desc')
        .skip((this.data.page - 1) * 10)
        .limit(10)
        .get();

      // 获取我参加的活动
      const signUps = await db.collection('activitySignUps')
        .where({
          userId: openid
        })
        .get();

      const activityIds = signUps.data.map(signup => signup.activityId);
      
      let joinedResult = { data: [] };
      if (activityIds.length > 0) {
        joinedResult = await db.collection('activities')
          .where({
            _id: _.in(activityIds),
            date: date
          })
          .orderBy('createTime', 'desc')
          .skip((this.data.page - 1) * 10)
          .limit(10)
          .get();
      }

      const hasMoreOrganized = organizedResult.data.length === 10;
      const hasMoreJoined = joinedResult.data.length === 10;

      this.setData({
        organizedActivities: this.data.page === 1 
          ? organizedResult.data 
          : [...this.data.organizedActivities, ...organizedResult.data],
        joinedActivities: this.data.page === 1
          ? joinedResult.data
          : [...this.data.joinedActivities, ...joinedResult.data],
        page: this.data.page + 1,
        hasMore: hasMoreOrganized || hasMoreJoined,
        loading: false
      });

      if (this.data.page === 1 && organizedResult.data.length === 0 && joinedResult.data.length === 0) {
        // 首次加载时，如果没有数据，不显示提示，让页面自然展示空状态
      }
    } catch (error) {
      console.error('加载活动列表失败:', error);
      // 静默处理错误，保持页面可用性
      this.setData({
        organizedActivities: this.data.page === 1 ? [] : this.data.organizedActivities,
        joinedActivities: this.data.page === 1 ? [] : this.data.joinedActivities,
        hasMore: false
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