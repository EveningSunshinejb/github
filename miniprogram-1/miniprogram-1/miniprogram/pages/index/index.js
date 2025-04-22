// pages/index/index.js
const app = getApp()
const activityTypes = require('../../utils/activityTypes')

Page({
  data: {
    activities: [],
    searchValue: '',
    loading: true,
    hasMore: true,
    pageSize: 10,
    currentPage: 0,
    currentCity: '全国',
    activityTypes: [],
    selectedMainType: '',
    selectedSubType: '',
    sortOptions: ['最新发布', '最多报名'],
    selectedSort: '最新发布'
  },

  onLoad() {
    // 加载活动类型数据
    const activityTypes = require('../../utils/activityTypes')
    this.setData({ activityTypes })

    // 监听活动发布事件
    if (!app.globalData.eventChannel) {
      app.globalData.eventChannel = {
        listeners: {},
        emit(event) {
          const listeners = this.listeners[event] || []
          listeners.forEach(callback => callback())
        },
        on(event, callback) {
          if (!this.listeners[event]) {
            this.listeners[event] = []
          }
          this.listeners[event].push(callback)
        }
      }
    }
    
    app.globalData.eventChannel.on('activityPublished', () => {
      this.setData({
        activities: [],
        currentPage: 0,
        hasMore: true
      })
      this.loadActivities()
    })

    if (app.globalData.cloudInitialized) {
      this.loadActivities()
    } else {
      // 等待云环境初始化完成
      const checkCloudInit = () => {
        if (app.globalData.cloudInitialized) {
          this.loadActivities()
        } else {
          setTimeout(checkCloudInit, 1000)
        }
      }
      checkCloudInit()
    }
  },

  onPullDownRefresh() {
    this.setData({
      activities: [],
      currentPage: 0,
      hasMore: true
    })
    this.loadActivities()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities()
    }
  },
  
  // 城市选择点击事件
  onCityTap() {
    wx.navigateTo({
      url: '/pages/city/index'
    })
  },

  // 加载活动列表
  async loadActivities() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const _ = db.command
      const query = {}

      // 添加城市筛选
      if (this.data.currentCity && this.data.currentCity !== '全国') {
        query.city = this.data.currentCity
      }

      // 添加活动类型筛选
      if (this.data.selectedMainType) {
        query.mainType = this.data.selectedMainType
        if (this.data.selectedSubType) {
          query.subType = this.data.selectedSubType
        }
      }

      // 添加搜索关键词筛选
      if (this.data.searchValue) {
        query.title = db.RegExp({
          regexp: this.data.searchValue,
          options: 'i'
        })
      }

      // 设置排序
      let orderBy = 'createTime'
      let orderDirection = this.data.selectedSort === '最新发布' ? 'desc' : 'asc'
      
      if (this.data.selectedSort === '最多报名') {
        orderBy = 'participantsCount'
        orderDirection = 'desc'
      }

      const activities = await db.collection('activities')
        .where(query)
        .orderBy(orderBy, orderDirection)
        .skip(this.data.currentPage * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      this.setData({
        activities: [...this.data.activities, ...activities.data],
        currentPage: this.data.currentPage + 1,
        hasMore: activities.data.length === this.data.pageSize
      })
    } catch (err) {
      console.error('加载活动列表失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },
  // 主类型选择事件
  onMainTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    // 如果点击已选中的类型，则取消选择
    const selectedMainType = this.data.selectedMainType === type ? '' : type
    this.setData({
      selectedMainType,
      selectedSubType: '',
      activities: [],
      currentPage: 0,
      hasMore: true
    })
    this.loadActivities()
  },

  // 子类型选择事件
  onSubTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    // 如果点击已选中的类型，则取消选择
    const selectedSubType = this.data.selectedSubType === type ? '' : type
    this.setData({
      selectedSubType,
      activities: [],
      currentPage: 0,
      hasMore: true
    })
    this.loadActivities()
  },

  // 排序方式选择事件
  onSortSelect(e) {
    const sort = e.currentTarget.dataset.sort
    if (sort !== this.data.selectedSort) {
      this.setData({
        selectedSort: sort,
        activities: [],
        currentPage: 0,
        hasMore: true
      })
      this.loadActivities()
    }
  },
  // 跳转到活动详情页面
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/detail/index?id=${id}`
    });
  },
})