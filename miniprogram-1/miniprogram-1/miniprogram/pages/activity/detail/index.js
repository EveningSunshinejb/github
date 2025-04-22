// pages/activity/detail/index.js
Page({
  data: {
    activity: {},
    isSignedUp: false,
    isOrganizer: false,
    loading: true,
    showQRCodeModal: false
  },

  showQRCode() {
    if (this.data.activity.groupQRCode) {
      this.setData({
        showQRCodeModal: true
      })
    } else {
      wx.showToast({
        title: '暂无群聊二维码',
        icon: 'none'
      })
    }
  },

  hideQRCode() {
    this.setData({
      showQRCodeModal: false
    })
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ activityId: options.id })
      this.loadActivityDetail()
    }
  },

  async loadActivityDetail() {
    try {
      let activityData
      if (this.data.activityId === 'example') {
        // 设置示例活动数据
        activityData = {
          title: '2024年新年登山活动',
          coverImage: '/images/activity-example/mountain.svg',
          startTime: '2025-05-01 08:00',
          endTime: '2025-05-01 17:00',
          location: '黄山风景区',
          locationImage: '/images/activity-example/location.svg',
          organizer: '户外运动俱乐部',
          currentParticipants: 15,
          maxParticipants: 30,
          signUpDeadline: '2025-04-20 18:00',
          description: '迎接2024年的第一缕阳光！\n\n活动亮点：\n1. 专业向导全程带队\n2. 含景区门票和保险\n3. 提供专业登山装备\n4. 新年特别纪念品\n\n行程安排：\n07:30 景区入口集合\n08:00 开始登山\n12:00 山顶午餐\n16:00 下山\n17:00 活动结束\n\n装备要求：\n- 舒适的登山鞋\n- 保暖外套\n- 帽子和手套\n- 水和能量补给\n\n注意事项：\n1. 请确保身体状况良好\n2. 听从向导指挥\n3. 注意保暖防寒\n4. 爱护景区环境',
          galleryImages: [
            '/images/activity-example/gallery1.svg',
            '/images/activity-example/gallery2.svg',
            '/images/activity-example/gallery3.svg'
          ],
          groupQRCode: '/images/qrcode-example.svg'
        }
        wx.setStorageSync('exampleActivity', activityData)
        // 示例活动不需要检查用户状态
        this.setData({
          activity: activityData,
          isSignedUp: false,
          isOrganizer: false,
          loading: false
        })
        return
      }

      const db = wx.cloud.database()
      const activity = await db.collection('activities').doc(this.data.activityId).get()
      
      if (!activity.data) {
        wx.showToast({
          title: '活动不存在',
          icon: 'error'
        })
        return
      }

      // 获取当前用户信息
      const userInfo = await wx.cloud.callFunction({
        name: 'getUserInfo'
      })
      
      const isOrganizer = activity.data.organizerId === userInfo.result.openId
      
      // 检查用户是否已报名
      const signUpRecord = await db.collection('activitySignUps')
        .where({
          activityId: this.data.activityId,
          userId: userInfo.result.openId
        })
        .get()
      
      this.setData({
        activity: activity.data,
        isSignedUp: signUpRecord.data.length > 0,
        isOrganizer,
        loading: false
      })
    } catch (err) {
      console.error('加载活动详情失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  viewSignUpList() {
    if (this.data.activityId === 'example') {
      wx.navigateTo({
        url: '/pages/activity/signup-list/index?id=example'
      })
      return
    }
    wx.navigateTo({
      url: `/pages/activity/signup-list/index?id=${this.data.activityId}`
    })
  },

  async onSignUp() {
    if (this.data.loading) return
    
    try {
      const db = wx.cloud.database()
      
      // 检查活动是否已满
      if (this.data.activity.currentParticipants >= this.data.activity.maxParticipants) {
        wx.showToast({
          title: '活动已满',
          icon: 'error'
        })
        return
      }
      
      // 检查是否超过报名截止时间
      const now = new Date()
      const deadline = new Date(this.data.activity.signUpDeadline)
      if (now > deadline) {
        wx.showToast({
          title: '报名已截止',
          icon: 'error'
        })
        return
      }
      
      // 创建报名记录
      await db.collection('activitySignUps').add({
        data: {
          activityId: this.data.activityId,
          userId: wx.getStorageSync('userId'),
          createTime: db.serverDate()
        }
      })
      
      // 更新活动报名人数
      await db.collection('activities').doc(this.data.activityId).update({
        data: {
          currentParticipants: db.command.inc(1)
        }
      })
      
      wx.showToast({
        title: '报名成功',
        icon: 'success'
      })
      
      this.loadActivityDetail()
    } catch (err) {
      console.error('报名失败：', err)
      wx.showToast({
        title: '报名失败',
        icon: 'error'
      })
    }
  },

  async onCancelSignUp() {
    if (this.data.loading) return
    
    try {
      const db = wx.cloud.database()
      
      // 删除报名记录
      await db.collection('activitySignUps')
        .where({
          activityId: this.data.activityId,
          userId: wx.getStorageSync('userId')
        })
        .remove()
      
      // 更新活动报名人数
      await db.collection('activities').doc(this.data.activityId).update({
        data: {
          currentParticipants: db.command.inc(-1)
        }
      })
      
      wx.showToast({
        title: '已取消报名',
        icon: 'success'
      })
      
      this.loadActivityDetail()
    } catch (err) {
      console.error('取消报名失败：', err)
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  },

  onManageActivity() {
    wx.navigateTo({
      url: `/pages/activity/manage/index?id=${this.data.activityId}`
    })
  }
})