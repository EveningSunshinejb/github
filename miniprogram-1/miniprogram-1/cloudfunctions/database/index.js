const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  try {

    console.log('示例数据添加成功！');
    console.log('开始检查activities集合...')
    // 确保activities集合存在
    const collections = await db.listCollections()
    const hasActivities = collections.some(col => col.name === 'activities')
    
    if (!hasActivities) {
      console.log('activities集合不存在，开始创建...')
      await db.createCollection('activities')
      console.log('成功创建activities集合')
      // 添加延迟以确保集合创建完成
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('等待集合创建完成...')
    } else {
      console.log('activities集合已存在')
    }

    console.log('开始创建索引...')
    try {
      // 创建activities集合的组合索引
      const result = await db.createIndex({
        collection: 'activities',
        indexes: [{
          name: 'organizer_date_idx',
          unique: false,
          keys: [
            {
              name: 'organizerId',
              direction: 'asc'
            },
            {
              name: 'date',
              direction: 'asc'
            }
          ]
        }]
      })

      return {
        success: true,
        result
      }
    } catch (err) {
      return {
        success: false,
        error: err
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}