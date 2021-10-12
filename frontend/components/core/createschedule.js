import { BASE_API_URL } from '@env';
import React, { useState, useEffect } from "react";
import { View,
        Text,
        TouchableOpacity,
        StyleSheet } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../custom/custominput';

export default function CreateSchedule({ navigation, route }) {
  const [scheduleExists, setScheduleExists] = useState(false)
  const [toCampus, setToCampus] = useState(new Date())
  const [fromCampus, setFromCampus] = useState(new Date())
  const [flexTo, setFlexTo] = useState(0)
  const [flexFrom, setFlexFrom] = useState(0)

  const onChangeTo = (event, selectedDate) => {
    const currentDate = selectedDate || toCampus;
    setToCampus(currentDate);
  };

  const onChangeFrom = (event, selectedDate) => {
    const currentDate = selectedDate || toCampus;
    setFromCampus(currentDate);
  };

  useEffect(() => {
    const createSchedule = async () => {
      const URL = BASE_API_URL + '/schedule/create'
      const token = await AsyncStorage.getItem('@session_token')
      fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setScheduleExists(true)
          setToCampus(data.schedule.to_campus)
          setFromCampus(data.schedule.from_campus)
          setFlexTo(data.schedule.flexibility_early)
          setFlexFrom(data.schedule.flexibility_late)
        } else {
          console.log(data.error)
        }
      })
      .catch(error => {
        console.log(error)
      })
    }
    createSchedule()
  }, [])

  const createSchedule = async () => {
    const URL = BASE_API_URL + '/schedule/create'
    const token = await AsyncStorage.getItem('@session_token')
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      navigation.navigate('Driver To', { day: route.params?.day })
    })
    .catch(error => {
      console.log(error)
    })
  }

  return (
    <View>
      <Text>Create Schedule for {route.params?.day}</Text>
      <Text>To Campus Time</Text>
      <DateTimePicker 
        value={toCampus}
        mode='time'
        is24Hour={true}
        display='default'
        onChange={onChangeTo}
      />
      <CustomInput 
        inputTitle="Flexibilty - to campus"
        onChangeText={setFlexTo}
        value={flexTo}
        keyboardType="numeric"
        maxLength={3}
      />
      <Text>From Campus Time</Text>
      <DateTimePicker 
        value={fromCampus}
        mode='time'
        is24Hour={true}
        display='default'
        onChange={onChangeFrom}
      />
      <CustomInput 
        inputTitle="Flexibilty - from campus"
        onChangeText={setFlexFrom}
        value={flexFrom}
        keyboardType="numeric"
        maxLength={3}
      />
      <TouchableOpacity
          onPress={() => createSchedule()}
          style={styles.createBtn}
      >
          <Text style={styles.createBtnText}>
              Create Schedule
          </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  createBtn: {
    width: 160,
    borderRadius: 10,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#106BB1",
    margin: 20,
},
createBtnText: {
    color: "white"
}
})