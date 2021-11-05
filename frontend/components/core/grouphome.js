import { BASE_API_URL } from '@env'
import moment from 'moment'
import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet
} from 'react-native'
import { Divider, IconButton, Colors } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserContext } from '../../usercontext'

export default function GroupHome ({ navigation }) {
  const [group, setGroup] = useState({})

  const {
    setIsAuth,
    setSchedules,
    schedules,
    setDriverSchedules,
    driverSchedules,
    scheduleHasUpdate,
    setScheduleHasUpdate,
    isDriver,
    defaultSchedules,
    defaultDriverSchedules
  } = useContext(UserContext)

  useEffect(() => {
    const auth = async () => {
      const tok = await AsyncStorage.getItem('@session_token')
      if (!tok) {
        return setIsAuth(false)
      }
      getMyGroup(tok)

      if (!isDriver && scheduleHasUpdate) {
        fetchMatchedSchedules(tok)
      } else if (isDriver) {
        fetchMatchedDriverSchedules(tok)
      }
    }

    const fetchMatchedSchedules = (token) => {
      const URL = BASE_API_URL + '/schedule/matched-schedules'
      setSchedules(defaultSchedules)
      fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log(data.error)
          } else {
            if (data.schedules) {
              const dataSchedules = data.schedules
              dataSchedules.forEach((schedule, idx) => {
                if (schedule.toCampus && schedule.fromCampus) {
                  const toCampus = moment(schedule.toCampus, 'HH:mm').format('hh:mm A')
                  const fromCampus = moment(schedule.fromCampus, 'HH:mm').format('hh:mm A')

                  dataSchedules[idx] = { ...dataSchedules[idx], toCampus, fromCampus }
                }
              })
              setSchedules(dataSchedules)
              setScheduleHasUpdate(false)
            }
          }
        })
        .catch(error => {
          console.log(error)
        })
    }

    const fetchMatchedDriverSchedules = (token) => {
      const URL = BASE_API_URL + '/schedule/matched-schedules-driver'
      setSchedules(defaultDriverSchedules)
      fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }).then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log(data.error)
          } else {
            if (data.schedules) {
              const dataSchedules = []
              data.schedules.forEach(schedule => {
                const dataSchedule = {
                  ...schedule
                }
                console.log(schedule.fromCampus)
                if (schedule.toCampus && schedule.fromCampus) {
                  const toCampus = moment(schedule.toCampus, 'HH:mm').format('hh:mm A')
                  const fromCampus = moment(schedule.fromCampus, 'HH:mm').format('hh:mm A')
                  console.log('test')
                  let passengersTo = ''
                  let passengersFrom = ''

                  for (const idx in schedule.passengersTo) {
                    if (idx !== schedule.passengersTo.length - 1) {
                      passengersTo += schedule.passengersTo[idx] + ', '
                    } else {
                      passengersTo += schedule.passengersTo[idx]
                    }
                  }

                  for (const idx in schedule.passengersFrom) {
                    if (idx !== schedule.passengersFrom.length - 1) {
                      passengersFrom += schedule.passengersFrom[idx] + ', '
                    } else {
                      passengersFrom += schedule.passengersFrom[idx]
                    }
                  }

                  dataSchedule.toCampus = toCampus
                  dataSchedule.fromCampus = fromCampus
                  dataSchedule.passengersTo = passengersTo
                  dataSchedule.passengersFrom = passengersFrom
                }
                dataSchedules.push(dataSchedule)
              })
              setDriverSchedules(dataSchedules)
              setScheduleHasUpdate(false)
            }
          }
        })
    }

    const getMyGroup = (token) => {
      const URL = BASE_API_URL + '/group/me'
      fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log(data.error)
          } else {
            setGroup(data.group)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
    auth()
  }, [scheduleHasUpdate, setScheduleHasUpdate])

  const sortDays = (a, b) => {
    const daysidx = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5
    }

    return daysidx[a.day] - daysidx[b.day]
  }

  const renderCarpoolerItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Pressable
          onPress={() => navigation.navigate('Create Schedule', { day: item?.day })}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? '#c9c9c9'
                : 'white'
            }
          ]}
        >
          <View style={styles.item}>
            <View>
              <Text style={{ fontSize: 16 }}>{item?.day}</Text>
            </View>
            <View>
              <Text>To campus: {item?.toCampus}</Text>
              <Text>Driver: {item?.driverTo}</Text>
              <Text>From campus: {item?.fromCampus}</Text>
              <Text>Driver: {item?.driverFrom}</Text>
            </View>
          </View>
        </Pressable>
        <Divider />
      </View>
    )
  }

  const renderDriverItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Pressable
          onPress={() => navigation.navigate('Create Schedule', { day: item?.day })}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? '#c9c9c9'
                : 'white'
            }
          ]}
        >
          <View style={styles.item}>
            <View>
              <Text style={{ fontSize: 16 }}>{item?.day}</Text>
            </View>
            <View>
              <Text>To campus: {item?.toCampus}</Text>
              <Text>Passengers: {item?.passengersTo}</Text>
              <Text>From campus: {item?.fromCampus}</Text>
              <Text>Passengers: {item?.passengersFrom}</Text>
            </View>
          </View>
        </Pressable>
        <Divider />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        <IconButton
          style={styles.settingsBtn}
          icon="bell"
          color={Colors.grey500}
          size={32}
          onPress={() => navigation.navigate('Notifications')}
        />
        <IconButton
          style={styles.settingsBtn}
          icon="cog"
          color={Colors.grey500}
          size={32}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>{group ? group.group_name : 'Group Name'}</Text>
      </View>
      <View style={styles.schedulesContainer}>
        <Divider />
        <FlatList
          data={!isDriver ? schedules.sort(sortDays) : driverSchedules.sort(sortDays)}
          renderItem={!isDriver ? renderCarpoolerItem : renderDriverItem}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flex: 1,
    backgroundColor: 'white'
  },
  settingsContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    top: 50,
    paddingRight: 20
  },
  settingsBtn: {
    // alignSelf: 'flex-end',
  },
  headingContainer: {
    width: '100%',
    alignItems: 'center'
  },
  heading: {
    fontSize: 40
  },
  schedulesContainer: {
    flex: 4,
    marginTop: 80,
    width: '100%',
    bottom: 20
  },
  itemContainer: {

  },
  item: {
    height: 125,
    paddingLeft: 30,
    justifyContent: 'center'
  }
})

GroupHome.propTypes = {
  navigation: PropTypes.object
}
