import { BASE_API_URL } from '@env'
import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import { Divider, Colors } from 'react-native-paper'
import { UserContext } from '../../usercontext'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function GroupRequests ({ navigation }) {
  const {
    groupRequests,
    setGroupRequests,
    groupId
  } = useContext(UserContext)

  useEffect(() => {
    const getGroupRequests = async () => {
      const URL = BASE_API_URL + `/group/requests?group_id=${groupId}`
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
            console.log(data.requests)
            setGroupRequests(data.requests)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
    getGroupRequests()
  }, [])

  const acceptGroupRequest = async (userId, groupId) => {
    const URL = BASE_API_URL + '/group/requests/accept'
    const token = await AsyncStorage.getItem('@session_token')
    console.log('accepting group request')
    console.log({ userId, groupId })
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        groupId
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('request accepted')
          const requests = groupRequests.filter(req => {
            return req.userid !== userId && req.groupid !== groupId
          })
          console.log({ requests })
          setGroupRequests(requests)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const declineGroupRequest = async (userId, groupId) => {
    const URL = BASE_API_URL + '/group/requests/decline'
    const token = await AsyncStorage.getItem('@session_token')
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        groupId
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const requests = groupRequests.filter(req => (req.userId !== userId && req.groupId !== groupId))
          setGroupRequests(requests)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.requestTextContainer}>
          <Text style={styles.requestText}>
            <Text style={{ fontWeight: 'bold' }}>{item?.name}</Text> has requested to join your group.
          </Text>
        </View>
        <View style={styles.item}>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={() => {
                acceptGroupRequest(item.userid, item.groupid)
              }}
              style={styles.acceptBtn}
            >
              <Text style={styles.acceptBtnText}>
                            Accept
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={() => {
                declineGroupRequest(item.userid, item.groupid)
              }}
              style={styles.declineBtn}
            >
              <Text style={styles.declineBtnText}>
                            Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Divider />
      </View>
    )
  }

  return (
    groupRequests
      ? <View style={styles.container}>
        <View>
          <FlatList
            data={groupRequests}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>
      </View>
      : <View style={styles.container}>
        <View>
          <Text>No Pending Join Requests.</Text>
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
  requestTextContainer: {
    paddingLeft: 25,
    paddingTop: 25,
    paddingRight: 10,
    paddingBottom: 0
  },
  requestText: {
    fontSize: 18
  },
  itemContainer: {

  },
  item: {
    height: 125,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  btnContainer: {
    width: '40%'
  },
  acceptBtn: {
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#106BB1',
    margin: 20
  },
  declineBtn: {
    borderRadius: 10,
    borderColor: Colors.grey500,
    borderWidth: 1,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
    margin: 20
  },
  acceptBtnText: {
    color: 'white'
  },
  declineBtnText: {
    color: 'black'
  }
})

GroupRequests.propTypes = {
  navigation: PropTypes.object
}
