import { BASE_API_URL } from '@env';
import React, { useState, useContext } from "react";
import { View,
        Text,
        TextInput,
        StyleSheet,
        TouchableOpacity,
        Linking,
        KeyboardAvoidingView } from "react-native";
import CustomInput from '../custom/custominput';
import { UserContext } from "../../usercontext";

export default function ResetPassword({ navigation }) {
    const [password, setPassword] = useState("")
    const [confPass, setConfPass] = useState("")
    const [error, setError] = useState(false)
    const [message, setMessage] = useState("")

    const {
        userId,
        resetToken
    } = useContext(UserContext)

    const resetPassword = async () => {
        const URL = BASE_API_URL + '/user/reset-password'
        console.log(URL)
        fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword: password, userId, resetToken })
        }).then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(data.error)
                setError(true)
            } else if (data.success) {
                setMessage(data.success)
                setError(false)
                navigation.navigate('Login')
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
                    inputTitle="New Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                />
                <CustomInput 
                    inputTitle="Confirm Password"
                    onChangeText={setConfPass}
                    value={confPass}
                    secureTextEntry={true}
                />
                {/* <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Enter a New Password"
                    secureTextEntry={true}
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setConfPass}
                    value={confPass}
                    placeholder="Confirm Password"
                    secureTextEntry={true}
                /> */}
                {!message ? null : 
                    <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
                }
                <TouchableOpacity
                    onPress={() => resetPassword()}
                    style={styles.forgotBtn}
                >
                    <Text style={styles.forgotText}>
                        Confirm New Password
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center"
    },
    inputForm: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        textAlign: "center",
        borderRadius: 20,
        backgroundColor: "#78B5E4",
        color: "black"
    },
    forgotBtn: {
        width: 160,
        borderRadius: 10,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "#106BB1",
        margin: 20,
    },
    forgotText: {
        color: "white"
    }
})