// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  let retries = 3;
  let delay = 1000;
  
  while (retries--) {
    try {
      const result = await db.collection('users')
        .where({ 
          手机号: db.command.eq('') 
        })
        .remove();
      
      return {
        code: 200,
        msg: `成功清理${result.deleted}条空值数据`
      };
    } catch (e) {
      console.error(`第${3 - retries}次尝试失败:`, e);
      
      if (retries === 0) {
        return {
          code: 503,
          msg: `操作失败，已重试3次`, 
          error: e.message,
          openid: wxContext.OPENID
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }
}