import { BASE_API_URL } from '@env'
import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomInput from '../custom/custominput'
import { UserContext } from '../../usercontext'

export default function CreateSchedule ({ navigation, route }) {
  const [scheduleExists, setScheduleExists] = useState(false)
  const [toCampus, setToCampus] = useState(new Date())
  const [fromCampus, setFromCampus] = useState(new Date())
  const [flexTo, setFlexTo] = useState(0)
  const [flexFrom, setFlexFrom] = useState(0)

  const {
    isDriver
  } = useContext(UserContext)

  const onChangeTo = (event, selectedDate) => {
    const currentDate = selectedDate || toCampus
    setToCampus(currentDate)
  }

  const onChangeFrom = (event, selectedDate) => {
    const currentDate = selectedDate || toCampus
    setFromCampus(currentDate)
  }

  useEffect(() => {
    const getSchedule = async () => {
      // Fill out form details from user's last visit
    }
  }, [])

  const createSchedule = async () => {
    const URL = BASE_API_URL + '/schedule/create'
    const token = await AsyncStorage.getItem('@session_token')
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        day: route.params?.day,
        toCampus,
        fromCampus,
        flexibilityEarly: flexTo,
        flexibilityLate: flexFrom
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if (!isDriver) {
          navigation.navigate('Driver To', { day: route.params?.day })
        } else {
          navigation.navigate('Group Home')
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Create Schedule for {route.params?.day}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.bodyContainer}
        behavior="padding"
      >

        <View style={styles.inputContainer}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerText}>To Campus Time</Text>
            <DateTimePicker
              value={toCampus}
              mode='time'
              is24Hour={true}
              display='default'
              onChange={onChangeTo}
            />
          </View>
          <CustomInput
            inputTitle="Flexibilty - to campus"
            onChangeText={setFlexTo}
            value={flexTo}
            keyboardType="numeric"
            maxLength={3}
            editable={!isDriver}
            selectTextOnFocus={!isDriver}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerText}>From Campus Time</Text>
            <DateTimePicker
              value={fromCampus}
              mode='time'
              is24Hour={true}
              display='default'
              onChange={onChangeFrom}
            />
          </View>
          <CustomInput
            inputTitle="Flexibilty - from campus"
            onChangeText={setFlexFrom}
            value={flexFrom}
            keyboardType="numeric"
            maxLength={3}
            editable={!isDriver}
            selectTextOnFocus={!isDriver}
          />
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            onPress={() => createSchedule()}
            style={styles.createBtn}
          >
            <Text style={styles.createBtnText}>
              Create Schedule
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  headerText: {
    fontSize: 28
  },
  bodyContainer: {
    justifyContent: 'flex-start',
    paddingLeft: 15,
    paddingRight: 15,
    flex: 2
  },
  inputContainer: {
    marginBottom: 10,
    marginTop: 10
  },
  timePickerContainer: {

  },
  timePickerText: {
    fontSize: 16
  },
  btnContainer: {
    alignItems: 'center'
  },
  createBtn: {
    width: 160,
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#106BB1',
    margin: 20
  },
  createBtnText: {
    color: 'white'
  }
})

CreateSchedule.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
}
