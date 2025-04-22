// pages/userinfo/index.js
Page({
  data: {
    name: '',
    phone: '',
    school: '',
    major: '',
    graduationYear: '',
    isSubmitting: false
  },

  onLoad() {
    // 检查是否已经填写过信息
    const userInfo = getApp().globalData.userInfo
    if (userInfo && userInfo.name && userInfo.phone && userInfo.school && userInfo.major && userInfo.graduationYear) {
      // 如果已经填写过信息，直接跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else if (userInfo) {
      // 如果有部分信息，则填充到表单中
      this.setData({
        name: userInfo.name || '',
        phone: userInfo.phone || '',
        school: userInfo.school || '',
        major: userInfo.major || '',
        graduationYear: userInfo.graduationYear || ''
      })
    }
  },

  handleNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  handleSchoolInput(e) {
    this.setData({
      school: e.detail.value
    })
  },

  handleMajorInput(e) {
    this.setData({
      major: e.detail.value
    })
  },

  handleGraduationYearInput(e) {
    this.setData({
      graduationYear: e.detail.value
    })
  },

  validateForm() {
    const { name, phone, school, major, graduationYear } = this.data
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return false
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }
    if (!school.trim()) {
      wx.showToast({
        title: '请输入学校',
        icon: 'none'
      })
      return false
    }
    if (!major.trim()) {
      wx.showToast({
        title: '请输入专业',
        icon: 'none'
      })
      return false
    }
    if (!graduationYear.trim()) {
      wx.showToast({
        title: '请输入毕业年份',
        icon: 'none'
      })
      return false
    }
    if (!/^\d{4}$/.test(graduationYear)) {
      wx.showToast({
        title: '请输入正确的毕业年份',
        icon: 'none'
      })
      return false
    }
    return true
  },

  async handleSubmit() {
    if (!this.validateForm()) return
    
    this.setData({ isSubmitting: true })
    try {
      const db = wx.cloud.database()
      const userInfo = getApp().globalData.userInfo
      
      // 更新用户信息
      await db.collection('users').doc(userInfo._id).update({
        data: {
          name: this.data.name,
          phone: this.data.phone,
          school: this.data.school,
          major: this.data.major,
          graduationYear: this.data.graduationYear,
          updateTime: db.serverDate()
        }
      })

      // 更新全局数据
      getApp().globalData.userInfo = {
        ...userInfo,
        name: this.data.name,
        phone: this.data.phone,
        school: this.data.school,
        major: this.data.major,
        graduationYear: this.data.graduationYear
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } catch (error) {
      console.error('保存用户信息失败:', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  }
})