import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import { View,
        KeyboardAvoidingView,
        Text,
        TouchableOpacity,
        StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupHome({ navigation, route }) { 
    const [token, setToken] = useState(null)

    useEffect(() => {
        const auth = async() => {
            const tok = await AsyncStorage.getItem('@session_token')
            if (!tok) {
                console.log('no session token')
                return setIsAuth(false)
            }
            setToken(tok)
            // fetchMySchedule(tok)
        }

        const fetchMySchedule = (token) => {
            const URL = BASE_API_URL + '/schedule/me'
            fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error)
                } else {
                    console.log(data)
                }
            })
            .catch(error => {
                console.log(error)
            })
        }
        auth()
    }, [])

    return (
        <View style={styles.container}>
            <Text>Your Group Home</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        flex: 1
    },
})