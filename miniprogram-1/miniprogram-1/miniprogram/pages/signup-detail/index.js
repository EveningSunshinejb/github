// pages/signup-detail/index.js
const app = getApp()

Page({
  data: {
    activity: {},
    signupStatus: '待提交',
    formData: {
      name: '',
      phone: ''
    }
  },

  onLoad(options) {
    this.activityId = options.id
    this.loadActivityDetail()
  },

  async loadActivityDetail() {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('activities')
        .doc(this.activityId)
        .get()
        
      this.setData({
        activity: res.data,
        'formData.name': app.globalData.userInfo.nickName || ''
      })
    } catch (err) {
      wx.showToast({
        title: '加载活动失败',
        icon: 'none'
      })
      console.error('加载活动详情失败:', err)
    }
  },

  submitForm(e) {
    const formData = e.detail.value
    if (!formData.name || !formData.phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中' })
    
    wx.cloud.callFunction({
      name: 'signup',
      data: {
        activityId: this.activityId,
        userInfo: app.globalData.userInfo,
        formData: formData
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '报名成功',
        icon: 'success'
      })
      this.setData({ signupStatus: '已报名' })
      wx.navigateBack()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '报名失败',
        icon: 'none'
      })
      console.error('报名失败:', err)
    })
  }
})