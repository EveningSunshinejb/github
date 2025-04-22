// pages/activity/signup-list/index.js
Page({
  data: {
    activityId: '',
    signUpList: [],
    loading: false,
    refreshing: false,
    pageSize: 20,
    currentPage: 1,
    hasMore: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ activityId: options.id })
      this.loadSignUpList()
    }
  },

  async loadSignUpList(isRefresh = false) {
    if (this.data.loading || (!this.data.hasMore && !isRefresh)) return

    try {
      this.setData({ loading: true })
      
      // 处理示例活动
      if (this.data.activityId === 'example') {
        const exampleSignUps = [
          {
            _id: 'example1',
            signUpTime: '2023-12-25 10:30',
            avatarUrl: '/images/default-avatar.png',
            nickName: '张三'
          },
          {
            _id: 'example2',
            signUpTime: '2023-12-25 11:15',
            avatarUrl: '/images/default-avatar.png',
            nickName: '李四'
          },
          {
            _id: 'example3',
            signUpTime: '2023-12-25 14:20',
            avatarUrl: '/images/default-avatar.png',
            nickName: '王五'
          }
        ]
        
        this.setData({
          signUpList: exampleSignUps,
          hasMore: false,
          loading: false,
          refreshing: false
        })
        return
      }

      const db = wx.cloud.database()
      const skip = isRefresh ? 0 : (this.data.currentPage - 1) * this.data.pageSize

      const signUpsRes = await db.collection('activitySignUps')
        .where({ activityId: this.data.activityId })
        .skip(skip)
        .limit(this.data.pageSize)
        .orderBy('signUpTime', 'desc')
        .get()

      // 获取用户信息
      const userIds = signUpsRes.data.map(item => item.userId)
      const usersRes = await db.collection('users')
        .where({ _openid: db.command.in(userIds) })
        .get()

      // 合并用户信息
      const userMap = {}
      usersRes.data.forEach(user => {
        userMap[user._openid] = user
      })

      const signUpList = signUpsRes.data.map(signUp => ({
        _id: signUp._id,
        signUpTime: this.formatTime(signUp.signUpTime),
        avatarUrl: userMap[signUp.userId]?.avatarUrl,
        nickName: userMap[signUp.userId]?.nickName
      }))

      this.setData({
        signUpList: isRefresh ? signUpList : [...this.data.signUpList, ...signUpList],
        currentPage: isRefresh ? 2 : this.data.currentPage + 1,
        hasMore: signUpList.length === this.data.pageSize,
        loading: false,
        refreshing: false
      })
    } catch (err) {
      console.error('加载报名名单失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({
        loading: false,
        refreshing: false
      })
    }
  },

  onLoadMore() {
    if (this.data.hasMore) {
      this.loadSignUpList()
    }
  },

  async onRefresh() {
    this.setData({
      refreshing: true,
      currentPage: 1,
      hasMore: true
    })
    await this.loadSignUpList(true)
  },

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
})