这句话是一个警告信息，意思是 wx.getSystemInfoSync 这个 API 已经被弃用了，建议你使用 wx.getSystemSetting、wx.getAppAuthorizeSetting、wx.getDeviceInfo、wx.getWindowInfo 或者 wx.getAppBaseInfo 来替代它。
详细解释
wx.getSystemInfoSync：这是微信小程序里用于同步获取系统信息的一个 API，它能返回设备的一些基本信息，像屏幕宽度、高度、操作系统版本等。不过随着微信小程序的不断发展，这个 API 可能在功能、性能或者安全性等方面存在一些不足，所以微信团队决定将其弃用。
替代 API：
wx.getSystemSetting：用于获取系统的设置信息。
wx.getAppAuthorizeSetting：用于获取应用的授权设置信息。
wx.getDeviceInfo：用于获取设备的相关信息。
wx.getWindowInfo：用于获取窗口的信息。
wx.getAppBaseInfo：用于获取应用的基础信息。
解决办法
你需要检查代码里使用 wx.getSystemInfoSync 的地方，然后根据具体需求选择合适的替代 API 进行替换。以下是一个简单示例，展示如何把 wx.getSystemInfoSync 替换为 wx.getSystemSetting：
原代码
javascript
const systemInfo = wx.getSystemInfoSync();
console.log('屏幕宽度:', systemInfo.screenWidth);

替换后的代码
javascript
wx.getSystemSetting({
  success(res) {
    console.log('屏幕宽度:', res.screenWidth);
  },
  fail(err) {
    console.error('获取系统设置信息失败:', err);
  }
});

通过这样的替换，你可以避免使用已弃用的 API，让代码更加稳定和可靠。