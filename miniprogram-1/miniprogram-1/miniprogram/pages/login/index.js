Page({
  data: {
    canIUseGetUserProfile: false,
    userInfo: null,
    hasUserInfo: false
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    // 尝试从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  async handleGetUserInfo() {
    wx.showLoading({ title: '登录中...', mask: true });

    try {
      // 获取用户信息
      const userProfile = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: resolve,
          fail: reject
        });
      });

      const { userInfo } = userProfile;
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
      wx.setStorageSync('userInfo', userInfo);

      // 检查云环境初始化
      const app = getApp();
      if (!app.globalData.cloudInitialized) {
        throw new Error('云环境未初始化');
      }

      // 获取登录 code
      const loginRes = await wx.login();
      if (!loginRes.code) {
        throw new Error('获取 code 失败');
      }

      // 调用云函数
      const cloudRes = await wx.cloud.callFunction({
        name: 'login',
        data: {
          code: loginRes.code,
          userInfo: {
            nickName: userProfile.userInfo.nickName,
            avatarUrl: userProfile.userInfo.avatarUrl
          }
        }
      });
      console.log('云函数返回结果:', cloudRes.result); // 打印云函数返回结果
      if (!cloudRes.result?.code) {
        wx.hideLoading();
        throw new Error(cloudRes.result?.msg || '登录失败');
      }

      // 存储用户信息
      const userData = cloudRes.result.data;
      wx.setStorageSync('userInfo', userData);
      wx.setStorageSync('openid', userData.openid);

      // 更新全局用户信息
      app.globalData.userInfo = userData;
      this.setData({ userInfo: userData, hasUserInfo: true });

      // 执行 app 登录逻辑
      await app.login();

      // 跳转首页
      wx.switchTab({ url: '/pages/index/index' });
    } catch (err) {
      console.error('登录流程错误:', err);
      let errMsg = '登录失败';
      const errorMessage = err.message || err.errMsg;
      if (errorMessage && errorMessage.includes('cloud')) errMsg = '云服务异常';
      if (errorMessage && errorMessage.includes('userInfo')) errMsg = '获取用户信息失败';

      wx.showToast({
        title: errMsg,
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
    }
  }
});