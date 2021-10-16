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
import CustomInput from '../custom/custominput'
import { UserContext } from '../../usercontext'

export default function ForgotPasswordCode ({ navigation }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')

  const {
    setUserId,
    setResetToken
  } = useContext(UserContext)

  const sendResetCode = async () => {
    const URL = BASE_API_URL + '/user/reset-password-code'
    console.log(URL)
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resetToken: code })
    }).then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error)
          setError(true)
        } else if (data.success) {
          setMessage(data.success)
          setError(false)
          setUserId(data.userId)
          setResetToken(data.resetToken)
          navigation.navigate('Reset Password')
        }
        console.log(data)
      })
      .catch(err => {
        console.error('Error:', err)
      })
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.inputForm}>
        <Text style={styles.title}>
                    Carpool Scheduler
        </Text>
        <CustomInput
          inputTitle="Reset Code"
          onChangeText={setCode}
          value={code}
          keyboardType="number-pad"
          maxLength={8}
        />
        {/* <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={8}
                    onChangeText={setCode}
                    value={code}
                    placeholder="Enter Code"
                /> */}
        {!message
          ? null
          : <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
        }
        <TouchableOpacity
          onPress={() => sendResetCode()}
          style={styles.forgotBtn}
        >
          <Text style={styles.forgotText}>
                        Confirm
          </Text>
        </TouchableOpacity>
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
  inputForm: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 40,
    marginBottom: 10
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
  forgotBtn: {
    width: 160,
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#106BB1',
    margin: 20
  },
  forgotText: {
    color: 'white'
  }
})

ForgotPasswordCode.propTypes = {
  navigation: PropTypes.object
}
