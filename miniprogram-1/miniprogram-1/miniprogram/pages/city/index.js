// pages/city/index.js
Page({
  data: {
    searchValue: '',
    currentTab: '国内(含港澳台)',
    tabs: ['国内(含港澳台)', '海外'],
    // 热门城市
    hotCities: [
      '深圳', '上海', '杭州', '北京', '广州', '南京',
      '成都', '重庆', '武汉', '西安', '苏州', '天津'
    ],
    // 按字母排序的城市列表
    citiesList: {},
    // 右侧字母导航
    letters: ['定位', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'],
    showLetterHint: false,
    currentLetter: '',
    scrollIntoView: '',
    currentLocation: '定位中...'
  },

  onLoad() {
    this.initCitiesList();
    this.getCurrentLocation();
  },

  // 初始化城市列表数据
  initCitiesList() {
    // 这里可以从本地数据或API获取城市数据
    // 示例数据
    const cities = {
      'A': ['阿坝', '阿拉善', '阿里', '安康', '安庆', '鞍山', '安顺', '安阳', '澳门'],
      'B': ['北京', '白银', '保定', '宝鸡', '保山', '包头', '巴中', '北海', '蚌埠', '本溪', '毕节', '滨州', '百色', '亳州'],
      'C': ['成都', '重庆', '长沙', '长春', '沧州', '常德', '昌都', '长治', '常州', '巢湖', '潮州', '承德', '郴州', '赤峰', '池州', '崇左', '楚雄', '滁州', '朝阳'],
      'D': ['大连', '东莞', '大理', '丹东', '大庆', '大同', '大兴安岭', '德宏', '德阳', '德州', '定西', '迪庆', '东营'],
      'E': ['鄂尔多斯', '恩施', '鄂州'],
      'F': ['福州', '防城港', '佛山', '抚顺', '抚州', '阜新', '阜阳'],
      'G': ['广州', '桂林', '贵阳', '甘南', '赣州', '甘孜', '广安', '广元', '贵港', '果洛'],
      'H': ['杭州', '哈尔滨', '合肥', '海口', '呼和浩特', '海北', '海东', '海南', '海西', '邯郸', '汉中', '鹤壁', '河池', '鹤岗', '黑河', '衡水', '衡阳', '河源', '贺州', '红河', '淮安', '淮北', '怀化', '淮南', '黄冈', '黄南', '黄山', '黄石', '惠州', '葫芦岛', '呼伦贝尔', '湖州', '菏泽'],
      'J': ['济南', '佳木斯', '吉安', '江门', '焦作', '嘉兴', '嘉峪关', '揭阳', '吉林', '金昌', '晋城', '景德镇', '荆门', '荆州', '金华', '济宁', '晋中', '锦州', '九江', '酒泉'],
      'K': ['昆明', '开封'],
      'L': ['兰州', '拉萨', '来宾', '莱芜', '廊坊', '乐山', '凉山', '连云港', '聊城', '辽阳', '辽源', '丽江', '临沧', '临汾', '临夏', '临沂', '林芝', '丽水', '六安', '六盘水', '柳州', '陇南', '龙岩', '娄底', '漯河', '洛阳', '泸州', '吕梁'],
      'M': ['马鞍山', '茂名', '眉山', '梅州', '绵阳', '牡丹江'],
      'N': ['南京', '南昌', '南宁', '宁波', '南充', '南平', '南通', '南阳', '那曲', '内江', '宁德', '怒江'],
      'P': ['盘锦', '攀枝花', '平顶山', '平凉', '萍乡', '莆田', '濮阳'],
      'Q': ['青岛', '黔东南', '黔南', '黔西南', '庆阳', '清远', '秦皇岛', '钦州', '齐齐哈尔', '泉州', '曲靖', '衢州'],
      'R': ['日喀则', '日照'],
      'S': ['上海', '深圳', '苏州', '沈阳', '石家庄', '三门峡', '三明', '三亚', '商洛', '商丘', '上饶', '山南', '汕头', '汕尾', '韶关', '绍兴', '邵阳', '十堰', '朔州', '四平', '绥化', '遂宁', '随州', '宿迁', '宿州'],
      'T': ['天津', '太原', '泰安', '泰州', '台州', '唐山', '天水', '铁岭', '铜川', '通化', '通辽', '铜陵', '铜仁', '台湾'],
      'W': ['武汉', '乌鲁木齐', '无锡', '威海', '潍坊', '文山', '温州', '乌海', '芜湖', '乌兰察布', '武威', '梧州'],
      'X': ['厦门', '西安', '西宁', '襄樊', '湘潭', '湘西', '咸宁', '咸阳', '孝感', '邢台', '新乡', '信阳', '新余', '忻州', '西双版纳', '宣城', '许昌', '徐州', '香港', '锡林郭勒', '兴安'],
      'Y': ['银川', '雅安', '延安', '延边', '盐城', '阳江', '阳泉', '扬州', '烟台', '宜宾', '宜昌', '宜春', '营口', '益阳', '永州', '岳阳', '榆林', '运城', '云浮', '玉树', '玉溪', '玉林'],
      'Z': ['郑州', '珠海', '张家口', '中山', '淄博', '株洲', '漳州', '湛江', '肇庆', '舟山', '镇江', '资阳', '遵义', '驻马店', '自贡']
    };
    this.setData({ citiesList: cities });
    // 初始化完成后立即触发一次数据更新
    this.onTabChange({ currentTarget: { dataset: { tab: this.data.currentTab } } });
  },

  // 切换国内/海外标签
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 搜索城市
  onSearch(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
  },

  // 选择城市
  onCitySelect(e) {
    const city = e.currentTarget.dataset.city;
    // 将选中的城市返回给上一页
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({ currentCity: city });
      if (typeof prevPage.loadActivities === 'function') {
        prevPage.loadActivities();
      }
    }
    wx.navigateBack();
  },

  // 点击字母导航
  onLetterTap(e) {
    const letter = e.currentTarget.dataset.letter;
    if (letter === '定位') {
      this.getCurrentLocation();
      return;
    }
    this.setData({
      showLetterHint: true,
      currentLetter: letter,
      scrollIntoView: `section-${letter}`
    });
    setTimeout(() => {
      this.setData({ showLetterHint: false });
    }, 500);
  },

  // 获取当前定位
  getCurrentLocation() {
    const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
    const qqmapsdk = new QQMapWX({
      key: 'VXYBZ-NAFKF-RNSJJ-NJ5XC-BWYK7-VWBZJ' // 使用自己申请的key
    });

    this.setData({ currentLocation: '定位中...' });
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 使用腾讯地图SDK进行逆地址解析
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (result) => {
            const city = result.result.address_component.city;
            this.setData({ currentLocation: city });
          },
          fail: () => {
            this.setData({ currentLocation: '定位失败' });
          }
        });
      },
      fail: () => {
        this.setData({ currentLocation: '定位失败' });
        wx.showToast({
          title: '获取位置信息失败',
          icon: 'none'
        });
      }
    });
  }
});