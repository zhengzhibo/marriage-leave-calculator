import React, {useState} from 'react'
import {Button, DatePicker, Divider, Drawer, Typography, Select, Space} from "antd";
const { Option } = Select;
const { Text } = Typography;

import {BulbOutlined} from "@ant-design/icons";

function Options(props) {
  const [visible, setVisible] = useState(false)
  function onClose() {
    setVisible(false);
  }

  function addCustomDay() {
    props.customDay.push({})
    props.changeCustomDay(props.customDay)
  }

  function onDelete(dayData) {
    props.changeCustomDay(props.customDay.filter((data) => data !== dayData))
  }

  return <div style={{position: 'absolute', top: '10px', right: '10px'}}>
      <Button shape="circle" onClick={() => setVisible(!visible)}><BulbOutlined /></Button>
    <Drawer
      placement="left"
      onClose={onClose}
      visible={visible}
      width="50%"
    >
      <Divider orientation="left">自定义工作日</Divider>
      {
        props.customDay.map((data, i) => {
          return <CustomDay dayData={data} key={i} onDelete={onDelete}/>
        })
      }

      <div style={{paddingTop: '6px'}}>
        <Text keyboard style={{cursor: 'pointer'}} onClick={addCustomDay}>再添加一个日期</Text>
      </div>
      <Divider orientation="left">智能推荐</Divider>
    </Drawer>
  </div>
}

function CustomDay(props) {

  const {dayData, onDelete} = props;

  function handleStatusChange(value) {
    dayData.status = value
  }

  function handleDateChange(value) {
    dayData.date = value
  }

  return <Space style={{paddingBottom: "5px"}}>
    <DatePicker value={dayData.date} onChange={handleDateChange}></DatePicker>
    <Select value={dayData.status} style={{ width: 120 }} onChange={handleStatusChange}>
      <Option value="holiday">节假日</Option>
      <Option value="workingDay">工作日</Option>
    </Select>
    <Button type="primary" danger onClick={() => {onDelete(dayData)}}>删除</Button>
  </Space>
}

export default Options;
