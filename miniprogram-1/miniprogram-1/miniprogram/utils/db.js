// 数据库操作工具类
const DB = {
  // 获取数据库实例
  getDB() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return null
    }
    return wx.cloud.database()
  },

  // 通用错误处理
  handleError(error, customMessage = '操作失败') {
    console.error('数据库操作错误：', error)
    wx.showToast({
      title: customMessage,
      icon: 'none',
      duration: 2000
    })
  },

  // 获取集合引用
  collection(name) {
    const db = this.getDB()
    return db ? db.collection(name) : null
  },

  // 添加数据
  async add(collectionName, data) {
    try {
      const collection = this.collection(collectionName)
      if (!collection) return null
      return await collection.add({ data })
    } catch (error) {
      this.handleError(error, '添加数据失败')
      return null
    }
  },

  // 获取数据列表
  async getList(collectionName, options = {}) {
    try {
      const collection = this.collection(collectionName)
      if (!collection) return []
      
      let query = collection
      
      // 处理查询条件
      if (options.where) {
        query = query.where(options.where)
      }
      
      // 处理排序
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.order || 'desc')
      }
      
      // 处理分页
      if (options.page && options.pageSize) {
        query = query.skip((options.page - 1) * options.pageSize).limit(options.pageSize)
      }
      
      const res = await query.get()
      return res.data
    } catch (error) {
      this.handleError(error, '获取数据失败')
      return []
    }
  },

  // 获取单条数据
  async getOne(collectionName, id) {
    try {
      const collection = this.collection(collectionName)
      if (!collection) return null
      const res = await collection.doc(id).get()
      return res.data
    } catch (error) {
      this.handleError(error, '获取数据失败')
      return null
    }
  },

  // 更新数据
  async update(collectionName, id, data) {
    try {
      const collection = this.collection(collectionName)
      if (!collection) return false
      await collection.doc(id).update({ data })
      return true
    } catch (error) {
      this.handleError(error, '更新数据失败')
      return false
    }
  },

  // 删除数据
  async remove(collectionName, id) {
    try {
      const collection = this.collection(collectionName)
      if (!collection) return false
      await collection.doc(id).remove()
      return true
    } catch (error) {
      this.handleError(error, '删除数据失败')
      return false
    }
  }
}

module.exports = DB