import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import CustomInput from '../custom/custominput'
import { UserContext } from '../../usercontext'

export default function Register ({ navigation }) {
  const {
    firstName,
    lastName,
    email,
    setFirstName,
    setLastName,
    setEmail
  } = useContext(UserContext)

  return (
    <View
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior="padding"
      >
        <View style={styles.titleView}>
          <Text
            style={styles.title}
          >
            Register
          </Text>
        </View>
        <View style={styles.registrationForm}>
          <CustomInput
            inputTitle="First Name"
            onChangeText={setFirstName}
            value={firstName}
          />
          <CustomInput
            inputTitle="Last Name"
            onChangeText={setLastName}
            value={lastName}
          />
          <CustomInput
            inputTitle="Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
          />
          <View style={styles.loginContainer}>
            <TouchableOpacity
              onPress={() => { navigation.navigate('Registration Two') }}
              style={styles.loginBtn}
            >
              <Text style={styles.loginText}>
                Next
              </Text>
            </TouchableOpacity>
            <Text
              style={{ color: '#9aa0a6' }}
            >
              Already Have an Account?
              <Text
                style={styles.forgotPasswordLink}
                onPress={() => navigation.navigate('Login')}
              >
                {' Sign In'}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center'
  },
  titleView: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    bottom: '10%'
  },
  title: {
    fontSize: 40,
    marginBottom: 10
  },
  registrationForm: {
    flex: 1.5,
    alignItems: 'center'
  },
  input: {
    width: 270,
    padding: 10,
    margin: 4,
    fontSize: 20,
    textAlign: 'center',
    borderRadius: 20,
    backgroundColor: '#78B5E4',
    color: 'black'
  },
  loginContainer: {
    alignItems: 'center'
  },
  loginBtn: {
    width: 200,
    borderRadius: 20,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#106BB1',
    margin: 20
  },
  loginText: {
    color: 'white'
  },
  forgotPasswordLink: {
    color: 'blue',
    marginBottom: 4
  }
})

Register.propTypes = {
  navigation: PropTypes.object
}
