// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { activityData } = event
  
  try {
    return await db.collection('activities').add({
      data: {
        ...activityData,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        creator: event.userInfo.openId,
        status: 'published'
      }
    })
  } catch (e) {
    console.error('创建活动失败:', e)
    return { code: 500, msg: '数据库写入失败' }
  }
}