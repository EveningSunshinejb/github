// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  // 简单的回显功能，用于测试云函数是否正常工作
  return {
    event,
    context,
    message: 'Hello from echo cloud function!',
    timestamp: new Date().toISOString()
  }
}