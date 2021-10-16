import { BASE_API_URL } from '@env'
import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import CustomInput from '../custom/custominput'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { UserContext } from '../../usercontext'

export default function Login ({ navigation }) {
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verifiedError, setVerifiedError] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(true)

  const {
    setEmail,
    setIsAuth
  } = useContext(UserContext)

  useEffect(() => {
    setEmail('')
  }, [])

  const resendVerification = () => {
    const URL = BASE_API_URL + '/user/resend-verify-email'
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: loginEmail })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error)
          setError(true)
          setIsAuth(false)
        } else if (data.success) {
          setMessage(data.success)
          setError(false)
        }
        // console.log(data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  const login = () => {
    const URL = BASE_API_URL + '/user/login'
    console.log(URL)
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: loginEmail, password })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if (data.error) {
          if (data.isVerified === false) {
            setVerifiedError(true)
          }
          setMessage(data.error)
          setError(true)
          setIsAuth(false)
        } else if (data.success) {
          setMessage(data.success)
          setError(false)
          AsyncStorage.setItem('@session_token', data.token)
          setIsAuth(true)
        }
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  return (
    <View
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior="padding"
      >
        <View style={styles.titleView}>
          <Icon
            style={styles.titleIcon}
            name="car-alt"
            size={100}
          />
          <Text
            style={styles.title}
          >
            Login
          </Text>
        </View>
        <View style={styles.loginForm}>
          <CustomInput
            inputTitle="Email"
            onChangeText={setLoginEmail}
            value={loginEmail}
            keyboardType="email-address"
          />
          <CustomInput
            inputTitle="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
          />
          {!message
            ? null
            : <Text style={{ color: error ? 'red' : 'green' }}>{message}
              {verifiedError
                ? <Text
                  style={styles.link}
                  onPress={() => {
                    setEmail(loginEmail)
                    resendVerification()
                    navigation.navigate('Verify Email')
                  }}
                >
                  {' Verify Email?'}
                </Text>
                : null}
            </Text>
          }
          <View style={styles.loginContainer}>
            <TouchableOpacity
              onPress={login}
              style={styles.loginBtn}
            >
              <Text style={styles.loginText}>
                Login
              </Text>
            </TouchableOpacity>
            <Text style={styles.link}
              onPress={() => navigation.navigate('Forgot Password')}
            >
              Forgot Password?
            </Text>
            <Text
              style={{ color: '#9aa0a6' }}
            >
              {'Don\'t Have an Account?'}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Registration')}
              >
                {' Sign Up'}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

Login.propTypes = {
  navigation: PropTypes.object
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center'
  },
  loginForm: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 40,
    marginBottom: 10
  },
  loginContainer: {
    alignItems: 'center'
  },
  loginBtn: {
    width: 160,
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#106BB1',
    margin: 20
  },
  loginText: {
    color: 'white'
  },
  link: {
    color: 'blue',
    marginBottom: 4
  },
  titleIcon: {
    // padding: 50
  },
  titleView: {
    margin: 0,
    padding: 0
  }
})
