const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
    const { nickName, avatarUrl } = event
    const wxContext = cloud.getWXContext()
    const db = cloud.database()

    try {
        // 查询用户是否已存在
        const userCollection = db.collection('users')
        const userQuery = await userCollection.where({
            openid: wxContext.OPENID
        }).get()

        let userData = {
            openid: wxContext.OPENID,
            appid: wxContext.APPID,
            unionid: wxContext.UNIONID || '',
            nickName,
            avatarUrl,
            updateTime: db.serverDate()
        }

        if (userQuery.data.length === 0) {
            // 用户不存在，创建新用户
            const result = await userCollection.add({
                data: {
                    ...userData,
                    createTime: db.serverDate()
                }
            })
            userData._id = result._id
        } else {
            // 用户存在，更新信息
            const userDoc = userQuery.data[0]
            await userCollection.doc(userDoc._id).update({
                data: userData
            })
            userData._id = userDoc._id
        }

        return {
            code: 200,
            data: userData
        }
    } catch (e) {
        console.error('处理用户信息失败:', e)
        return {
            code: 500,
            msg: '处理用户信息失败',
            error: e.message
        }
    }
}