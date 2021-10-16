import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from 'react-native'
import { Divider } from 'react-native-paper'

export default function Notifications ({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        <View style={styles.settingsSubContainer}>
          <Divider />
          <Pressable
            onPress={() => console.log('notification pressed')}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? '#c9c9c9'
                  : 'white'
              },
              styles.signoutBtn
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.settingsText}>A Notification</Text>
            </View>
          </Pressable>
          <Divider />
        </View>
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
  settingsContainer: {
    flex: 1
  },
  settingsSubContainer: {
    top: 80
  },
  signoutBtn: {
    width: '100%',
    height: 50,
    // alignItems: "flex-start",
    justifyContent: 'center',
    paddingLeft: 25
  },
  settingsText: {
    color: 'red'
  }
})

Notifications.propTypes = {
  navigation: PropTypes.object
}
