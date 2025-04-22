Component({
  properties: {
    activeDate: {
      type: String,
      value: ''
    },
    activeDates: {
      type: Array,
      value: [],
      observer(newVal) {
        if (!Array.isArray(newVal)) {
          console.error('活动日期数据格式错误');
          wx.showToast({
            title: '日期加载失败',
            icon: 'none'
          });
          return;
        }
        this.generateCalendar();
      }
    }
  },

  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    days: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六']
  },

  lifetimes: {
    attached() {
      this.generateCalendar();
    }
  },

  methods: {
    generateCalendar() {
      const days = [];
      const firstDay = new Date(this.data.currentYear, this.data.currentMonth - 1, 1);
      const lastDay = new Date(this.data.currentYear, this.data.currentMonth, 0);
      
      // 填充上个月的日期
      const firstDayWeek = firstDay.getDay();
      const prevMonthLastDay = new Date(this.data.currentYear, this.data.currentMonth - 1, 0).getDate();
      for (let i = 0; i < firstDayWeek; i++) {
        days.unshift({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          isActive: false
        });
      }
      
      // 填充当前月的日期
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dateStr = `${this.data.currentYear}-${String(this.data.currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
          day: i,
          isCurrentMonth: true,
          isActive: this.data.activeDate === dateStr,
          hasActivity: this.data.activeDates.includes(dateStr),
          isToday: dateStr === todayStr
        });
      }
      
      // 填充下个月的日期
      const remainingDays = 42 - days.length; // 保持6行
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          isActive: false
        });
      }
      
      this.setData({ days });
    },

    prevMonth() {
      let { currentYear, currentMonth } = this.data;
      if (currentMonth === 1) {
        currentYear--;
        currentMonth = 12;
      } else {
        currentMonth--;
      }
      this.setData({ currentYear, currentMonth }, () => {
        this.generateCalendar();
        this.triggerEvent('monthChange', { year: currentYear, month: currentMonth });
      });
    },

    nextMonth() {
      let { currentYear, currentMonth } = this.data;
      if (currentMonth === 12) {
        currentYear++;
        currentMonth = 1;
      } else {
        currentMonth++;
      }
      this.setData({ currentYear, currentMonth }, () => {
        this.generateCalendar();
        this.triggerEvent('monthChange', { year: currentYear, month: currentMonth });
      });
    },

    selectDate(e) {
      const { day, isCurrentMonth } = e.currentTarget.dataset;
      if (!isCurrentMonth) return;
      
      const dateStr = `${this.data.currentYear}-${String(this.data.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.setData({ activeDate: dateStr }, () => {
        this.generateCalendar();
        this.triggerEvent('dateSelect', { date: dateStr });
      });
    }
  }
})