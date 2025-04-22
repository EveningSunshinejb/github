// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.action) {
    case 'sendTemplateMessage': {
      return sendTemplateMessage(event)
    }
    case 'getWXACode': {
      return getWXACode(event)
    }
    default: {
      return {
        errCode: -1,
        errMsg: '未定义的操作'
      }
    }
  }
}

async function sendTemplateMessage(event) {
  const { OPENID } = cloud.getWXContext()
  try {
    const result = await cloud.openapi.templateMessage.send({
      touser: OPENID,
      templateId: event.templateId,
      formId: event.formId,
      page: event.page,
      data: event.data
    })
    return result
  } catch (err) {
    return {
      errCode: err.errCode,
      errMsg: err.errMsg
    }
  }
}

async function getWXACode(event) {
  try {
    const result = await cloud.openapi.wxacode.get({
      path: event.path,
      width: event.width
    })
    return result
  } catch (err) {
    return {
      errCode: err.errCode,
      errMsg: err.errMsg
    }
  }
}