Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#FF8C00",
    list: [{
      pagePath: "/pages/index/index",
      text: "活动广场",
      iconPath: "/images/square_default.svg",
      selectedIconPath: "/images/square.svg"
    }, {
      pagePath: "/pages/activity/my/index",
      text: "活动管理",
      iconPath: "/images/manage_default.svg",
      selectedIconPath: "/images/manage.svg"
    }, {
      pagePath: "/pages/activity/publish/index",
      text: "",
      iconPath: "/images/add.svg",
      selectedIconPath: "/images/add.svg",
      isSpecial: true
    }, {
      pagePath: "/pages/message/index",
      text: "消息",
      iconPath: "/images/message_default.svg",
      selectedIconPath: "/images/message.svg"
    }, {
      pagePath: "/pages/profile/index",
      text: "我的",
      iconPath: "/images/my_default.svg",
      selectedIconPath: "/images/my.svg"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})