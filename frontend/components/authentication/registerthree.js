import { BASE_API_URL } from '@env'
import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native'
import { Picker } from '@react-native-community/picker'
import CustomInput from '../custom/custominput'
import { UserContext } from '../../usercontext'

export default function RegisterThree ({ navigation }) {
  const [carspace, setCarspace] = useState(null)
  const [driver, setDriver] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(true)

  const {
    firstName,
    lastName,
    email,
    password,
    school
  } = useContext(UserContext)

  const register = async () => {
    const URL = BASE_API_URL + '/user/register'
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstname: firstName,
        lastname: lastName,
        email,
        school,
        password,
        carspace,
        driver
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error)
          setError(true)
        } else if (data.success) {
          setMessage(data.success)
          setError(false)
          navigation.navigate('Verify Email')
        }
        console.log(data)
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
        style={styles.registrationForm}
        behavior="padding"
      >
        <Text
          style={styles.title}
        >
          Register
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={driver}
            style={styles.userType}
            onValueChange={(itemValue, itemIndex) =>
              setDriver(itemValue)
            }>
            <Picker.Item label="Carpooler" value={false} />
            <Picker.Item label="Driver" value={true} />
          </Picker>
        </View>
        <View style={styles.loginContainer}>
          {driver === true
            ? <CustomInput
              inputTitle="# of Passengers (Excluding Yourself)"
              onChangeText={setCarspace}
              value={carspace}
              keyboardType="number-pad"
              maxLength={1}
            />
            : null}
          <>
            {!message
              ? null
              : <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
            }
          </>
          <TouchableOpacity
            onPress={() => register()}
            style={styles.loginBtn}
          >
            <Text style={styles.loginText}>
              Register
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
  registrationForm: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 40
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
  userType: {
    height: 80,
    width: 200,
    marginBottom: 20
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30
  },
  loginContainer: {
    alignItems: 'center',
    margin: 20
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

RegisterThree.propTypes = {
  navigation: PropTypes.object
}
