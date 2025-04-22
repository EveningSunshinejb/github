// app.js
App({
  globalData: {
    cloudInitialized: false,
    eventChannel: null
  },

  onLaunch: function() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 尝试初始化云环境
      const initCloud = (retryCount = 0) => {
        // 最多重试3次
        if (retryCount >= 3) {
          wx.showToast({
            title: '系统初始化失败，请重启小程序',
            icon: 'none',
            duration: 3000
          })
          return
        }

        wx.cloud.init({
          env: 'cloud1-8g1w7r28e2de3747', // 云开发环境ID
          traceUser: true
        }).then(() => {
          console.log('云开发环境初始化成功')
          this.globalData.cloudInitialized = true
          // 触发回调
          if (this.cloudInitCallback) {
            this.cloudInitCallback()
          }
        }).catch(err => {
          console.error(`云开发环境初始化失败（第${retryCount + 1}次尝试）：`, err)
          wx.showToast({
            title: `云环境连接失败，正在重试（${retryCount + 1}/3）`,
            icon: 'none',
            duration: 2000
          })
          // 3秒后重试
          setTimeout(() => {
            initCloud(retryCount + 1)
          }, 3000)
        })
      }
      initCloud()
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              this.globalData.isAuthenticated = true
              
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  // 用户登录
  login() {
    return new Promise(async (resolve, reject) => {
      if (!this.globalData.cloudInitialized) {
        reject(new Error('云环境未初始化'))
        return
      }
      
      try {
        // 确保用户信息中已包含openid
        if (!this.globalData.userInfo || !this.globalData.userInfo.openid) {
          reject(new Error('用户信息不完整'))
          return
        }
        
        const openid = this.globalData.userInfo.openid
        const db = wx.cloud.database()
        
        // 查询用户是否已存在
        const userCollection = db.collection('users')
        const userQuery = await userCollection.where({
          openid: openid
        }).get()

        if (userQuery.data.length === 0) {
          // 用户不存在，创建新用户记录
          const userInfo = this.globalData.userInfo
          if (!userInfo) {
            throw new Error('用户信息不存在')
          }
          const userDoc = await userCollection.add({
            data: {
              openid: openid,
              avatarUrl: userInfo.avatarUrl,
              nickName: userInfo.nickName,
              name: userInfo.nickName, // 直接使用昵称作为用户名
              phone: '', // 手机号可以为空
              createTime: db.serverDate(),
              updateTime: db.serverDate()
            }
          })
          this.globalData.userInfo = { ...this.globalData.userInfo, _id: userDoc._id }
        } else {
          // 用户已存在，更新用户信息
          const userDoc = userQuery.data[0]
          // 更新用户头像和昵称
          await userCollection.doc(userDoc._id).update({
            data: {
              avatarUrl: this.globalData.userInfo.avatarUrl,
              nickName: this.globalData.userInfo.nickName,
              updateTime: db.serverDate()
            }
          })
          this.globalData.userInfo = { ...this.globalData.userInfo, _id: userDoc._id }
        }
        
        this.globalData.isAuthenticated = true
        resolve({ openid })
      } catch (err) {
        console.error('处理用户数据失败', err)
        reject(err)
      }
    })
  }
})