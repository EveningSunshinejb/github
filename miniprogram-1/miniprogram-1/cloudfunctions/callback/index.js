// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  // 处理回调请求
  try {
    const { type, data } = event
    
    switch (type) {
      case 'payment': {
        // 处理支付回调
        return {
          success: true,
          data: {
            received: true,
            openid: OPENID
          }
        }
      }
      default: {
        return {
          success: false,
          errMsg: '未知的回调类型'
        }
      }
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message
    }
  }
}