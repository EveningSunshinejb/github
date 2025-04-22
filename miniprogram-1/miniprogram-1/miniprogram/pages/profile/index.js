// pages/profile/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    isLoading: false,
    initialized: false
  },

  onLoad() {
    const app = getApp()
    if (!app.globalData.cloudInitialized) {
      wx.showLoading({
        title: '正在连接服务...',
        mask: true
      })
      let retryCount = 0
      const maxRetries = 10
      let isTimeout = false
      const checkCloudInit = () => {
        if (app.globalData.cloudInitialized) {
          wx.hideLoading()
          this.loadUserInfo()
        } else if (retryCount >= maxRetries) {
          isTimeout = true
          wx.hideLoading()
          wx.showToast({
            title: '连接服务失败，请重试',
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        } else {
          retryCount++
          setTimeout(checkCloudInit, 1000)
        }
      }
      app.cloudInitCallback = () => {
        if (!isTimeout) {
          wx.hideLoading()
          this.loadUserInfo()
        }
      }
      checkCloudInit()
    } else {
      this.loadUserInfo()
    }
  },

  async loadUserInfo() {
    try {
      this.setData({ isLoading: true })
      
      // 首先尝试从本地存储获取用户信息
      const localUserInfo = wx.getStorageSync('userInfo')
      if (localUserInfo) {
        this.setData({
          userInfo: localUserInfo,
          isLoading: false,
          initialized: true
        })
        return
      }
      
      // 如果本地没有，则从数据库获取
      const db = wx.cloud.database()
      const openid = wx.getStorageSync('openid')
      if (!openid) {
        throw new Error('未找到用户openid')
      }
      
      const userInfo = await db.collection('users').where({
        openid: openid
      }).get()
      
      if (userInfo.data.length > 0) {
        this.setData({
          userInfo: userInfo.data[0],
          isLoading: false,
          initialized: true
        })
        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo.data[0])
      } else {
        this.setData({
          isLoading: false,
          initialized: true
        })
      }
    } catch (error) {
      console.error('获取用户信息失败：', error)
      this.setData({ 
        isLoading: false,
        initialized: true
      })
      wx.showToast({
        title: '获取用户信息失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 编辑资料
  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.isAuthenticated = false;
          // 清除存储的token和用户信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          // 确保页面存在后再跳转
          const pages = getCurrentPages();
          if (pages.length > 0) {
            // 跳转到登录页面
            wx.reLaunch({
              url: '/pages/login/index',
              success: () => {
                console.log('成功跳转到登录页面');
              },
              fail: (error) => {
                console.error('跳转失败:', error);
                wx.showToast({
                  title: '跳转失败，请重试',
                  icon: 'none'
                });
              }
            });
          }
        }
      }
    });
  },

  editProfile() {
    wx.showActionSheet({
      itemList: ['修改头像', '修改昵称'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseAvatar();
        } else if (res.tapIndex === 1) {
          this.editNickname();
        }
      }
    });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseAvatar({
      success: async (res) => {
        const tempFilePath = res.avatarUrl;
        this.setData({
          isLoading: true
        });
        
        try {
          // 上传头像到云存储
          const cloudPath = `avatars/${wx.getStorageSync('openid')}_${Date.now()}.jpg`;
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath,
            filePath: tempFilePath
          });

          // 更新用户信息到数据库
          const db = wx.cloud.database();
          await db.collection('users').doc(this.data.userInfo._id).update({
            data: {
              avatarUrl: uploadResult.fileID,
              updateTime: db.serverDate()
            }
          });

          // 更新页面显示
          this.setData({
            'userInfo.avatarUrl': uploadResult.fileID,
            isLoading: false
          });

          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
        } catch (error) {
          console.error('更新头像失败：', error);
          this.setData({ isLoading: false });
          wx.showToast({
            title: '头像更新失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 修改昵称
  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新的昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickName': res.content,
            isLoading: true
          });
          
          // 这里可以添加更新昵称到数据库的逻辑
          setTimeout(() => {
            this.setData({ isLoading: false });
            wx.showToast({
              title: '昵称更新成功',
              icon: 'success'
            });
          }, 1000);
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 已在上面实现了onLoad逻辑
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  // 导航到我的活动页面
  navigateToMyActivities() {
    wx.navigateTo({
      url: '/pages/activity/my/index'
    });
  },

  // 导航到基本信息页面
  navigateToUserInfo() {
    wx.navigateTo({
      url: '/pages/userinfo/index'
    });
  },

  // 导航到已报名活动页面
  navigateToJoinedActivities() {
    wx.navigateTo({
      url: '/pages/activity/joined/index'
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})