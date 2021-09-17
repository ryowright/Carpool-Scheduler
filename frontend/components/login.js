import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, KeyboardAvoidingView } from "react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Login({ navigation }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState(true)

    const login = async () => {
        const URL = 'http://10.34.63.12:5000/api/user/login'
        fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(data.error)
                setError(true)
            } else if (data.success) {
                setMessage(data.success)
                setError(false)
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
                style={styles.loginForm}
                behavior="padding"
            >
                <Text
                    style={styles.title}
                >
                    Carpool Scheduler
                </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                />
                <TextInput 
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                />
                {!message ? null : 
                    <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
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
                    <Text style={styles.forgotPasswordLink}
                        onPress={() => navigation.navigate('Forgot Password')}
                    >
                        Forgot Password?
                    </Text>
                    <Text
                        style={{ color: 'gray' }}
                    >
                        Don't Have an Account?
                        <Text
                            style={styles.forgotPasswordLink}
                            onPress={() => navigation.navigate('Registration')}
                        >
                            {" Sign Up"}
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
    loginForm: {
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
        width: 200,
        borderRadius: 20,
        height: 40,
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
    }
})