import { BASE_API_URL } from '@env'
import React, { useState, useEffect, useContext } from 'react'
import moment from 'moment'
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
import { UserContext } from '../../usercontext'

export default function DriverTo ({ navigation, route }) {
  const [drivers, setDrivers] = useState(null)

  const {
    setScheduleHasUpdate
  } = useContext(UserContext)

  useEffect(() => {
    const matchToCampus = async () => {
      console.log('matching to campus')
      const URL = BASE_API_URL + `/schedule/match-to-campus?day=${route.params?.day}`
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
              const toCampus = moment(driver.to_campus, 'HH:mm').format('hh:mm A')
              driver.to_campus = toCampus
            })
            setDrivers(data.drivers)
            console.log({ drivers: data.drivers })
          } else {
            console.log(data.error)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
    matchToCampus()
    setScheduleHasUpdate(false)
  }, [])

  const selectDriver = async (driverId, driverScheduleId) => {
    const URL = BASE_API_URL + '/schedule/driver-to-campus'
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
          navigation.navigate('Driver From', { day: route.params?.day })
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
            <Text>To Campus: {item.to_campus}</Text>
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

DriverTo.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
}
