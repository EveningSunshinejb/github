// pages/activity/publish/index.js
Page({
  data: {
    formData: {
      title: '',
      titleError: '',
      type: '',
      typeError: '',
      typeIndex: 0,
      subTypeIndex: 0,
      activityType: '',
      activitySubType: '',
      description: '',
      cover: '',
      coverError: '',
      richDescription: '',
      startTime: '',
      endTime: '',
      locationType: 'offline',
      location: '',
      locationError: '',
      maxParticipants: '',
      registrationDeadline: '',
      qrcode: '',
      qrcodeError: ''
    },
    activityTypes: [],
    startTimeArray: [],
    endTimeArray: [],
    deadlineArray: [],
    startTimeIndex: [0, 0, 0, 0, 0],
    endTimeIndex: [0, 0, 0, 0, 0],
    deadlineIndex: [0, 0, 0, 0, 0],
    history: [],
    canUndo: false
  },

  onLoad() {
    const app = getApp()
    // 检查云环境是否初始化
    if (!app.globalData.cloudInitialized) {
      wx.showLoading({
        title: '正在连接服务...',
        mask: true
      })
      // 设置最大等待时间
      let retryCount = 0
      const maxRetries = 10
      let isTimeout = false
      // 等待云环境初始化
      const checkCloudInit = () => {
        if (app.globalData.cloudInitialized) {
          wx.hideLoading()
          this.initPageData()
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
      // 注册回调函数
      app.cloudInitCallback = () => {
        if (!isTimeout) {
          wx.hideLoading()
          this.initPageData()
        }
      }
      checkCloudInit()
    } else {
      this.initPageData()
    }
  },

  initPageData() {
    try {
      const activityTypes = require('../../../utils/activityTypes.js')
      this.setData({ activityTypes })
      this.initTimeArrays()
      // 初始化编辑器上下文
      this.editorCtx = null
    } catch (error) {
      console.error('初始化页面数据失败：', error)
      wx.showToast({
        title: '加载页面数据失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 编辑器初始化完成
  onEditorReady() {
    const query = wx.createSelectorQuery()
    query.select('#editor')
      .context((res) => {
        if (res && res.context) {
          this.editorCtx = res.context
        } else {
          console.error('获取编辑器上下文失败')
          wx.showToast({
            title: '编辑器加载失败',
            icon: 'none'
          })
        }
      })
      .exec()
  },

  // 编辑器内容变化
  onEditorInput(e) {
    this.setData({
      'formData.richDescription': e.detail.html
    })
  },

  // 选择活动封面
  async chooseCover() {
    try {
      // 选择图片
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      // 将临时文件保存到本地缓存目录
      const savedFilePath = `${wx.env.USER_DATA_PATH}/cover_${Date.now()}.jpg`
      await wx.saveFile({
        tempFilePath: res.tempFilePaths[0],
        filePath: savedFilePath
      })

      // 直接更新封面图片
      this.setData({
        'formData.cover': savedFilePath,
        'formData.coverError': ''
      })
    } catch (error) {
      console.error('选择图片失败：', error)
      wx.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  },

  // 处理裁剪后的图片
  onShow() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage.data.croppedImage) {
      this.setData({
        'formData.cover': currentPage.data.croppedImage
      })
      // 清除裁剪后的图片数据
      currentPage.data.croppedImage = null
    }
  },

  // 初始化时间数组
  initTimeArrays() {
    const years = []
    const months = []
    const days = []
    const hours = []
    const minutes = []

    const date = new Date()
    const currentYear = date.getFullYear()

    for (let i = 0; i < 5; i++) {
      years.push(currentYear + i + '年')
    }
    for (let i = 1; i <= 12; i++) {
      months.push(i + '月')
    }
    for (let i = 1; i <= 31; i++) {
      days.push(i + '日')
    }
    for (let i = 0; i < 24; i++) {
      hours.push(i + '时')
    }
    for (let i = 0; i < 60; i++) {
      minutes.push(i + '分')
    }

    this.setData({
      startTimeArray: [years, months, days, hours, minutes],
      endTimeArray: [years, months, days, hours, minutes],
      deadlineArray: [years, months, days, hours, minutes]
    })
  },

  // 开始时间选择器列变化事件
  onStartTimeColumnChange(e) {
    const { column, value } = e.detail
    const data = {
      startTimeIndex: this.data.startTimeIndex
    }
    data.startTimeIndex[column] = value
    this.setData(data)
  },

  // 开始时间选择器值变化事件
  onStartTimeChange(e) {
    const { value } = e.detail
    const timeArray = this.data.startTimeArray
    const timeStr = `${timeArray[0][value[0]].slice(0, -1)}/${String(value[1] + 1).padStart(2, '0')}/${String(value[2] + 1).padStart(2, '0')} ${String(value[3]).padStart(2, '0')}:${String(value[4]).padStart(2, '0')}:00`
    this.setData({
      'formData.startTime': timeStr,
      startTimeIndex: value
    })
  },

  // 结束时间选择器列变化事件
  onEndTimeColumnChange(e) {
    const { column, value } = e.detail
    const data = {
      endTimeIndex: this.data.endTimeIndex
    }
    data.endTimeIndex[column] = value
    this.setData(data)
  },

  // 结束时间选择器值变化事件
  onEndTimeChange(e) {
    const { value } = e.detail
    const timeArray = this.data.endTimeArray
    const timeStr = `${timeArray[0][value[0]].slice(0, -1)}/${String(value[1] + 1).padStart(2, '0')}/${String(value[2] + 1).padStart(2, '0')} ${String(value[3]).padStart(2, '0')}:${String(value[4]).padStart(2, '0')}:00`
    this.setData({
      'formData.endTime': timeStr,
      endTimeIndex: value
    })
  },

  // 报名截止时间选择器列变化事件
  onDeadlineColumnChange(e) {
    const { column, value } = e.detail
    const data = {
      deadlineIndex: this.data.deadlineIndex
    }
    data.deadlineIndex[column] = value
    this.setData(data)
  },

  // 报名截止时间选择器值变化事件
  onDeadlineChange(e) {
    const { value } = e.detail
    const timeArray = this.data.deadlineArray
    const timeStr = `${timeArray[0][value[0]].slice(0, -1)}/${String(value[1] + 1).padStart(2, '0')}/${String(value[2] + 1).padStart(2, '0')} ${String(value[3]).padStart(2, '0')}:${String(value[4]).padStart(2, '0')}:00`
    this.setData({
      'formData.registrationDeadline': timeStr,
      deadlineIndex: value
    })
  },

  // 输入框内容变化处理
  // 保存当前状态到历史记录
  saveToHistory() {
    const currentState = JSON.parse(JSON.stringify(this.data.formData))
    const history = this.data.history
    history.push(currentState)
    this.setData({
      history,
      canUndo: true
    })
  },

  // 撤销操作
  undo() {
    if (this.data.history.length > 0) {
      const history = this.data.history
      const previousState = history.pop()
      this.setData({
        formData: previousState,
        history,
        canUndo: history.length > 0
      })
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value
    this.saveToHistory()
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 表单提交前处理时间
  // 活动大类选择
  onTypeChange(e) {
    const index = e.detail.value
    const selectedType = this.data.activityTypes[index]
    this.setData({
      'formData.type': selectedType.name,
      'formData.typeIndex': index,
      'formData.subTypeIndex': 0,
      'formData.activityType': selectedType.name,
      'formData.activitySubType': selectedType.subTypes[0],
      'formData.typeError': ''
    })
  },

  // 活动小类选择
  onSubTypeChange(e) {
    const index = e.detail.value
    const selectedType = this.data.activityTypes[this.data.formData.typeIndex]
    this.setData({
      'formData.subTypeIndex': index,
      'formData.activitySubType': selectedType.subTypes[index],
      'formData.typeError': ''
    })
  },

  // 活动形式选择
  onLocationTypeChange(e) {
    this.setData({
      'formData.locationType': e.detail.value,
      'formData.location': '',
      'formData.locationError': ''
    })
  },

  // 选择地点
  chooseLocation() {
    wx.chooseLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      success: (res) => {
        this.setData({
          'formData.location': res.address,
          'formData.locationError': ''
        })
      }
    })
  },

  // 选择群聊二维码
  async chooseQRCode() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      // 将临时文件保存到本地缓存目录
      const savedFilePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.jpg`
      await wx.saveFile({
        tempFilePath: res.tempFilePaths[0],
        filePath: savedFilePath
      })

      this.setData({
        'formData.qrcode': savedFilePath,
        'formData.qrcodeError': ''
      })
    } catch (error) {
      console.error('选择或处理二维码失败：', error)
      wx.showToast({
        title: '图片处理失败，请重试',
        icon: 'none'
      })
    }
  },

  validateForm() {
    let isValid = true
    const formData = this.data.formData

    // 验证标题
    if (!formData.title) {
      this.setData({ 'formData.titleError': '请输入活动标题' })
      isValid = false
    } else if (formData.title.length > 30) {
      this.setData({ 'formData.titleError': '标题不能超过30字' })
      isValid = false
    } else if (/[~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im.test(formData.title)) {
      this.setData({ 'formData.titleError': '标题不能包含特殊字符' })
      isValid = false
    } else {
      this.setData({ 'formData.titleError': '' })
    }

    // 验证活动封面
    if (!formData.cover) {
      this.setData({ 'formData.coverError': '请上传活动封面' })
      isValid = false
    } else {
      this.setData({ 'formData.coverError': '' })
    }

    // 验证活动类型
    if (!formData.type) {
      this.setData({ 'formData.typeError': '请选择活动类型' })
      isValid = false
    }

    // 验证时间
    const now = new Date()
    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)
    const deadline = new Date(formData.registrationDeadline)

    if (!formData.startTime || !formData.endTime || !formData.registrationDeadline) {
      wx.showToast({
        title: '请选择完整的时间信息',
        icon: 'none'
      })
      isValid = false
    } else if (start <= now) {
      wx.showToast({
        title: '开始时间必须晚于当前时间',
        icon: 'none'
      })
      isValid = false
    } else if (end <= start) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      })
      isValid = false
    } else if (deadline >= start) {
      wx.showToast({
        title: '报名截止时间必须早于开始时间',
        icon: 'none'
      })
      isValid = false
    }

    // 验证地点
    if (!formData.location) {
      this.setData({ 'formData.locationError': formData.locationType === 'online' ? '请输入会议链接' : '请选择活动地点' })
      isValid = false
    }

    // 验证群聊二维码
    if (!formData.qrcode) {
      this.setData({ 'formData.qrcodeError': '请上传群聊二维码' })
      isValid = false
    }

    return isValid
  },

  async onSubmit() {
    if (!this.validateForm()) {
      return
    }
    const formData = this.data.formData

    // 表单验证
    for (const field in this.data.rules) {
      const rules = this.data.rules[field]
      const value = this.data.formData[field]
      for (const rule of rules) {
        if (rule.required && !value) {
          wx.showToast({
            title: rule.message,
            icon: 'none'
          })
          return
        }
      }
    }

    // 获取用户信息
    const app = getApp()
    if (!app.globalData.isAuthenticated) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '发布中...' })
      const db = wx.cloud.database()
      
      // 上传封面图片到云存储
      let coverFileID = ''
      if (formData.cover) {
        const cloudPath = `activity/covers/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath,
          filePath: formData.cover
        })
        coverFileID = uploadResult.fileID
      }

      // 上传群聊二维码到云存储
      let qrcodeFileID = ''
      if (formData.qrcode) {
        const cloudPath = `activity/qrcodes/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath,
          filePath: formData.qrcode
        })
        qrcodeFileID = uploadResult.fileID
      }

      // 添加活动记录
      const result = await db.collection('activities').add({
        data: {
          ...this.data.formData,
          cover: coverFileID,
          qrcode: qrcodeFileID,
          status: '进行中',
          createTime: db.serverDate(),
          organizerId: app.globalData.userInfo._id,
          organizerInfo: app.globalData.userInfo,
          participantsCount: 0,
          participants: []
        }
      })

      wx.hideLoading()
      if (result._id) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        })
        // 发布成功后通知活动广场页面刷新数据
        const eventChannel = getApp().globalData.eventChannel || {}
        if (eventChannel.emit) {
          eventChannel.emit('activityPublished')
        }
        // 返回活动广场
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    } catch (err) {
      console.error('发布活动失败：', err)
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    }
  }
})