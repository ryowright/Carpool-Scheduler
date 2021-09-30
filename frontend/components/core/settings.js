import { BASE_API_URL } from '@env';
import React, { useState, useContext } from "react"
import { View,
        Text,
        TextInput,
        Pressable,
        StyleSheet,
        TouchableOpacity,
        KeyboardAvoidingView } from "react-native"
import Icon from "react-native-vector-icons/Octicons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Divider } from 'react-native-paper';
import { UserContext } from '../../usercontext';

export default function Settings({ navigation }) {
    const [message, setMessage] = useState("")

    const {
        setIsAuth
    } = useContext(UserContext)

    const logout = async () => {
        const token = await AsyncStorage.getItem('@session_token')
        if (!token) {
            console.log('no session token')
            return setIsAuth(false)
        }
        
        const URL = BASE_API_URL + '/user/logout'
        fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(data.error)
                AsyncStorage.removeItem('@session_token')
                setIsAuth(false)
            } else if (data.success) {
                setMessage(data.success)
                AsyncStorage.removeItem('@session_token') 
                setIsAuth(false)
            }
            console.log(data)
        })
        .catch((error) => {
        console.error('Error:', error);
        });
        AsyncStorage.removeItem('@session_token')
        setIsAuth(false)
    }

    return (
        <View style={styles.container}>
            <View style={styles.settingsContainer}>
                <View style={styles.settingsSubContainer}>
                    <Divider />
                    <Pressable
                        onPress={() => logout()}
                        style={({ pressed }) => [
                        {
                            backgroundColor: pressed
                            ? '#c9c9c9'
                            : 'white'
                        },
                        styles.signoutBtn
                    ]}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Icon 
                                style={{paddingRight: 15}}
                                name="sign-out"
                                size={30}
                                color="#949494"
                            />
                            <Text style={styles.settingsText}>Sign Out of Carpool Scheduler</Text>
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
        width: "100%",
        height: "100%",
    },
    settingsContainer: {
        flex: 1,
    },
    settingsSubContainer: {
        top: 80
    },
    signoutBtn: {
        width: "100%",
        height: 50,
        // alignItems: "flex-start",
        justifyContent: "center",
        paddingLeft: 25,
    },
    settingsText: {
        color: "red"
    },
})