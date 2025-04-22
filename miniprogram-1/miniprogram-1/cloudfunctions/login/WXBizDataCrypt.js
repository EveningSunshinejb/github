const crypto = require('crypto')

function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId
  this.sessionKey = sessionKey
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  const sessionKey = Buffer.from(this.sessionKey, 'base64')
  const encryptedDataBuf = Buffer.from(encryptedData, 'base64')
  const ivBuf = Buffer.from(iv, 'base64')

  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuf)
    let decoded = decipher.update(encryptedDataBuf, 'binary', 'utf8')
    decoded += decipher.final('utf8')
    const decodedObj = JSON.parse(decoded)

    if (decodedObj.watermark.appid !== this.appId) {
      throw new Error('Invalid appid')
    }
    return decodedObj
  } catch (err) {
    throw new Error('解密失败：' + err.message)
  }
}

module.exports = WXBizDataCrypt