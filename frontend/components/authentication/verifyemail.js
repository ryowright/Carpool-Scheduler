import { BASE_API_URL } from "@env"
import React, { useState, useContext } from "react";
import { View,
        Text,
        TextInput,
        StyleSheet,
        TouchableOpacity,
        KeyboardAvoidingView } from "react-native"
import CustomInput from '../custom/custominput';
import { UserContext } from "../../usercontext";

export default function VerifyEmail({ navigation }) {
    const [emailToken, setEmailToken] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState(true)

    const {
        email,
        setIsAuth
    } = useContext(UserContext)

    const resendVerification = () => {
        const URL = BASE_API_URL + '/user/resend-verify-email'
        fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
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
        console.error('Error:', error);
        });
    } 

    const verifyEmail = async () => {
        const URL = BASE_API_URL + '/user/verify-email'
        fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            emailToken
        }),
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
                setIsAuth(false)
                navigation.navigate('Login')
            }
            console.log(data)
        })
        .catch((error) => {
        console.error('Error:', error);
        });
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
                    Carpool Scheduler
                </Text>
                <CustomInput 
                    inputTitle="Verification Code"
                    onChangeText={setEmailToken}
                    value={emailToken}
                    keyboardType="number-pad"
                    maxLength={8}
                />
                {/* <TextInput 
                    style={styles.input}
                    onChangeText={setEmailToken}
                    value={emailToken}
                    keyboardType="number-pad"
                    maxLength={8}
                    placeholder="Enter Verification Code"
                /> */}
                {!message ? null : 
                    <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
                }
                <View style={styles.loginContainer}>
                    <TouchableOpacity
                        onPress={() => verifyEmail()}
                        style={styles.loginBtn}
                    >
                        <Text style={styles.loginText}>
                            Verify Email
                        </Text>
                    </TouchableOpacity>
                    <Text
                        style={{ color: '#9aa0a6' }}
                    >
                        Didn't Receive an Email?
                        <Text
                            style={styles.link}
                            onPress={() => resendVerification()}
                        >
                            {" Resend email."}
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
        width: "100%",
        height: "100%",
        alignItems: "center"
    },
    registrationForm: {
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
    loginContainer: {
        alignItems: "center"
    },
    loginBtn: {
        width: 160,
        borderRadius: 10,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "#106BB1",
        margin: 20,
    },
    loginText: {
        color: "white",
    },
    forgotPasswordLink: {
        color: "blue",
        marginBottom: 4,
    },
    link: {
        color: "blue",
        marginBottom: 4,
    }
})