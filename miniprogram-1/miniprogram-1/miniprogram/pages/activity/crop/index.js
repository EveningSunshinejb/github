// pages/activity/crop/index.js
Page({
  data: {
    imagePath: '',
    width: 0,
    height: 0,
    cropperWidth: 0,
    cropperHeight: 0,
    scale: 1,
    x: 0,
    y: 0
  },

  onLoad(options) {
    const { imagePath } = options
    
    // 使用文件系统管理器读取临时文件
    const fs = wx.getFileSystemManager()
    fs.readFile({
      filePath: imagePath,
      encoding: 'base64',
      success: (fileRes) => {
        const base64Src = 'data:image/jpeg;base64,' + fileRes.data
        this.setData({ imagePath: base64Src })
        
        // 获取系统信息和图片信息
        const windowInfo = wx.getWindowInfo()
        wx.getImageInfo({
          src: base64Src,
          success: (res) => {
        // 计算裁剪框尺寸（3:4）
        const cropperWidth = windowInfo.windowWidth
        const cropperHeight = cropperWidth * 4 / 3
        
        // 计算图片缩放比例和初始位置
        const scale = cropperWidth / res.width
        const scaledHeight = res.height * scale
        const y = (scaledHeight - cropperHeight) / 2

        this.setData({
          width: res.width,
          height: res.height,
          cropperWidth,
          cropperHeight,
          scale,
          y
        })
      }
    })
  },

  // 图片移动事件
  onTouchMove(e) {
    const { x, y } = e.detail
    this.setData({ x, y })
  },

  // 图片缩放事件
  onScale(e) {
    const { scale } = e.detail
    this.setData({ scale })
  },

  // 确认裁剪
  async confirmCrop() {
    try {
      const { imagePath, x, y, scale, cropperWidth, cropperHeight, width, height } = this.data
      
      // 计算裁剪参数
      const cropX = -x / scale
      const cropY = -y / scale
      const cropWidth = cropperWidth / scale
      const cropHeight = cropperHeight / scale

      // 将base64图片转换为临时文件
      const base64Data = imagePath.split(',')[1]
      const fs = wx.getFileSystemManager()
      const tempFilePath = `${wx.env.USER_DATA_PATH}/temp_${Date.now()}.jpg`
      
      await new Promise((resolve, reject) => {
        fs.writeFile({
          filePath: tempFilePath,
          data: base64Data,
          encoding: 'base64',
          success: resolve,
          fail: reject
        })
      })

      // 调用微信裁剪API
      const res = await wx.cropImage({
        src: tempFilePath,
        cropScale: '3:4',
        cropArea: {
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight
        }
      })

      // 清理临时文件
      fs.unlink({
        filePath: tempFilePath,
        fail: (error) => console.error('清理临时文件失败：', error)
      })

      // 返回裁剪后的图片路径
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      prevPage.setData({
        'formData.cover': res.tempFilePath,
        'formData.coverError': ''
      })
      wx.navigateBack()
    } catch (error) {
      console.error('裁剪失败：', error)
      wx.showToast({
        title: '裁剪失败',
        icon: 'none'
      })
    }
  },

  // 取消裁剪
  cancelCrop() {
    wx.navigateBack()
  }
})