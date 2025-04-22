// 数据模型定义
const Models = {
  // 用户集合结构
  users: {
    // 用户唯一标识（微信openid）
    openid: String,
    // 用户头像
    avatarUrl: String,
    // 用户昵称
    nickName: String,
    // 创建时间
    createTime: Date,
    // 更新时间
    updateTime: Date
  },

  // 活动集合结构
  activities: {
    // 活动标题
    title: String,
    // 活动类型（如：运动、学习、娱乐、公益等）
    type: String,
    // 活动日期
    date: String,
    // 活动时间
    time: String,
    // 活动地点
    location: String,
    // 活动描述
    description: String,
    // 活动封面图
    coverImage: String,
    // 最大参与人数
    maxParticipants: Number,
    // 当前参与人数
    currentParticipants: Number,
    // 组织者ID（关联到users集合的openid）
    organizerId: String,
    // 活动状态（0:未开始, 1:进行中, 2:已结束）
    status: Number,
    // 创建时间
    createTime: Date,
    // 更新时间
    updateTime: Date
  },

  // 报名记录集合结构
  registrations: {
    // 活动ID（关联到activities集合）
    activityId: String,
    // 用户ID（关联到users集合的openid）
    userId: String,
    // 报名状态（0:待确认, 1:已确认, 2:已取消）
    status: Number,
    // 报名时间
    registerTime: Date,
    // 更新时间
    updateTime: Date
  }
}

module.exports = Models