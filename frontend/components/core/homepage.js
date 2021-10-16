import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native'
import { IconButton, Colors } from 'react-native-paper'

export default function Home ({ navigation }) {
  return (
    <View
      style={styles.container}
    >
      <View style={styles.settingsContainer}>
        <IconButton
          style={styles.settingsBtn}
          icon="cog"
          color={Colors.grey500}
          size={32}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.groupContainer}
        behavior="padding"
      >
        <Text
          style={styles.title}
        >
          Carpool Scheduler
        </Text>
        <View style={styles.loginContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Create Group')}
            style={styles.groupBtn}
          >
            <Text style={styles.groupBtnText}>Create a group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search Group')}
            style={styles.groupBtn}
          >
            <Text style={styles.groupBtnText}>Search for a group</Text>
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
  groupContainer: {
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 40
  },
  loginContainer: {
    alignItems: 'center',
    margin: 20
  },
  settingsContainer: {
    width: '100%',
    justifyContent: 'center',
    flex: 2,
    paddingRight: 20
  },
  settingsBtn: {
    alignSelf: 'flex-end'
    // position: 'absolute', // add if dont work with above
  },
  groupBtn: {
    width: 200,
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#106BB1',
    margin: 20
  },
  groupBtnText: {
    color: 'white'
  }
})

Home.propTypes = {
  navigation: PropTypes.object
}
