import { BASE_API_URL } from '@env'
import React, { useState, useEffect, useContext } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { UserContext } from '../../usercontext'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable
} from 'react-native'
import { Divider } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function DriverFrom ({ navigation, route }) {
  const [drivers, setDrivers] = useState(null)

  const {
    setScheduleHasUpdate
  } = useContext(UserContext)

  useEffect(() => {
    const matchFromCampus = async () => {
      const URL = BASE_API_URL + `/schedule/match-from-campus?day=${route.params?.day}`
      const token = await AsyncStorage.getItem('@session_token')
      fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            data.drivers.forEach(driver => {
              const fromCampus = moment(driver.from_campus, 'HH:mm').format('hh:mm A')
              driver.from_campus = fromCampus
            })
            setDrivers(data.drivers)
          } else {
            console.log(data.error)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
    matchFromCampus()
    setScheduleHasUpdate(false)
  }, [])

  const selectDriver = async (driverId, driverScheduleId) => {
    const URL = BASE_API_URL + '/schedule/driver-from-campus'
    const token = await AsyncStorage.getItem('@session_token')
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ driverId, driverScheduleId, day: route.params?.day })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setScheduleHasUpdate(true)
          navigation.navigate('Group Home')
        } else {
          console.log(data.error)
        }
      })
      .catch(error => {
        console.log(error)
      })
    setScheduleHasUpdate(true)
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Pressable
          onPress={() => selectDriver(item.user_id, item.id)}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? '#c9c9c9'
                : 'white'
            },
            styles.item
          ]}
        >
          <View style={styles.itemTextContainer}>
            <Text>Driver: {item.firstname + ' ' + item.lastname}</Text>
            <Text>From Campus: {item.from_campus}</Text>
          </View>
        </Pressable>
        <Divider />
      </View>
    )
  }

  return (
    drivers
      ? <View>
        <View>
          <FlatList
            data={drivers}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>
      </View>
      : <View>
        <View>
          <Text>No Compatible Drivers Found</Text>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  itemContainer: {

  },
  item: {
    height: 80,
    paddingLeft: 25,
    justifyContent: 'center'
  },
  itemTextContainer: {

  }
})

DriverFrom.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
}
