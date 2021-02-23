import React, {Component} from 'react'
import {Alert, Calendar, DatePicker, message, Space} from 'antd';
import axios from "axios";
import moment from 'moment'
import './App.css'
import Options from "./Options";

class App extends Component{

  getHoliday = (year) => {
    axios.get(`//timor.tech/api/holiday/year/${year}/`).then(({ data: {holiday} }) => {
      holiday.year = year;
      this.setState({holiday})
    }, () => {
      message.error('请求节假日API出错');
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      holiday: null,
      customDay: [{}]
    };
  }
  current
  componentDidMount() {
    this.getHoliday(moment().year())
  }

  onChange = (date) => {
    if (date && this.state.holiday.year != date.year()) {
      this.getHoliday(date.year())
    }
    this.setState({startDate: date})
  }

  getDayData(day) {
    const dayData = this.state.holiday ? this. state.holiday[day.format('MM-DD')] : null;

    const diffDays = this.state.startDate && this.state.startDate.startOf('day').diff(day.startOf('day'), 'days')
    const inHoliday = typeof diffDays === 'number' && diffDays > -15 && diffDays <= 0;

    let isNonWorkingDay = day.day() === 6 || day.day() === 0;
    if (dayData) {
      isNonWorkingDay = dayData.holiday;
    }

    for (let i = 0; i < this.state.customDay.length; i++) {
      const customDayData = this.state.customDay[i];

      if (customDayData.status && customDayData.date && day.isSame(customDayData.date, 'day')) {
        isNonWorkingDay = customDayData.status === 'holiday'
      }
    }

    return {
      isNonWorkingDay,
      inHoliday,
      diffDays: Math.abs(diffDays) + 1,
      name: dayData ? dayData.name : ''
    }
  }

  dateFullCellRender = (day) => {
    const dayData = this.getDayData(day);
    return <div onClick={(e) => e.stopPropagation()}  className={`holiday-bar-container ${dayData.isNonWorkingDay ? 'is-holiday' : ''}`}>
      <div className="holiday-bar-title">
        <span className="date">{day.format('DD')}</span>
      </div>
      {dayData.inHoliday &&
        <div className={`holiday-bar day-${dayData.diffDays}`}/>
      }
      { dayData && <div className="day-name">{dayData.name}</div>}
    </div>
  }

  headerRender = ({value}) => {
    return <div className="calendar-header">{value.format('YYYY年M月')}</div>
  }

  message = () => {
    if (!this.state.startDate) {
      return '请输入开始日期'
    }
    let {workingDays, holidayBefore, holidayAfter} = this.calcHolidays();

    const index = this.holidayIndex(workingDays, holidayBefore, holidayAfter)

    let message = `包含工作日 ${workingDays} 天，非工作日 ${15-workingDays} 天，`;
    if (holidayBefore) {
      message += `前拼假 ${holidayBefore} 天，`
    }
    if (holidayAfter) {
      message += `后拼假 ${holidayAfter} 天，`
    }
    message += `共连休 ${15 + holidayBefore + holidayAfter} 天。 婚假指数为 ${index}。`
    return message
  }

  calcHolidays() {
    const days = [];
    let workingDays = 0;
    let holidayBefore = 0;
    let holidayAfter = 0;

    for (let i = 0; i < 15; i++) {
      const day = moment(this.state.startDate.toDate()).add(i, 'days');
      const dayData = this.getDayData(day)
      days.push(dayData);

      if (!dayData.isNonWorkingDay) {
        workingDays++;
      }
    }

    while (true) {
      const day = moment(this.state.startDate.toDate()).add((0 - holidayBefore) - 1, 'days');
      const dayData = this.getDayData(day)
      if (dayData.isNonWorkingDay) {
        days.unshift(dayData);
        holidayBefore++;
      } else {
        break
      }
    }

    while (true) {
      const day = moment(this.state.startDate.toDate()).add(holidayAfter + 15, 'days');
      const dayData = this.getDayData(day)
      if (dayData.isNonWorkingDay) {
        days.push(dayData);
        holidayAfter++;
      } else {
        break
      }
    }
    return {workingDays, holidayBefore, holidayAfter};
  }

  holidayIndex(workingDays, holidayBefore, holidayAfter) {
    return Math.floor(( (workingDays / 15) + ((holidayBefore + holidayAfter) * 0.02)) * 100)
  }

  changeCustomDay = (value) => {
    this.setState({customDay: value})
  }

  render() {
    return <div className="App">
      <Options customDay={this.state.customDay} changeCustomDay={this.changeCustomDay}></Options>
      <Space>
        <DatePicker placeholder="婚假开始日期" inputReadOnly={true} onChange={this.onChange}/>
      </Space>
      <div style={{marginTop: 16}}>
        <Alert message={this.message()} />
      </div>
      <div style={{marginTop: 16, padding: '0 5px', backgroundColor: '#fff'}}>
        <Calendar value={this.state.startDate || moment()} dateFullCellRender={this.dateFullCellRender} headerRender={this.headerRender}/>
      </div>
    </div>;
  }

}

export default App
