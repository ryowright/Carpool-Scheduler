import { BASE_API_URL } from '@env'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
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
          navigation.navigate('Group Home')
        } else {
          console.log(data.error)
        }
      })
      .catch(error => {
        console.log(error)
      })
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
            }
          ]}
        >
          <View style={styles.item}>
            <Text>Driver: {item.driverFrom}</Text>
            <Text>From Campus: {item.fromCampus}</Text>
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

  },
  itemContainer: {

  },
  item: {

  }
})

DriverFrom.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
}
