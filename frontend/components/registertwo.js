import React, { useContext, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, KeyboardAvoidingView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { UserContext } from "../App";

export default function RegisterTwo({ navigation }) {
    const [message, setMessage] = useState("")
    const [error, setError] = useState(true)

    const { 
        password,
        confirmPass,
        school,
        setPassword,
        setConfirmPass,
        setSchool
    } = useContext(UserContext)

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
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Enter a Password"
                />
                <TextInput 
                    style={styles.input}
                    onChangeText={setConfirmPass}
                    value={confirmPass}
                    secureTextEntry={true}
                    placeholder="Confirm Password"
                />
                <TextInput 
                    style={styles.input}
                    onChangeText={setSchool}
                    value={school}
                    placeholder="Enter Your School or University"
                />
                {!message ? null : 
                    <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
                }
                <View style={styles.loginContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            if (password !== confirmPass) {
                                console.log({password, confirmPass})
                                setError(true)
                                setMessage("Your passwords do not match.")
                            } else {
                                setError(false)
                                setMessage("")
                                navigation.navigate('Registration Three')
                            }
                        }}
                        style={styles.loginBtn}
                    >
                        <Text style={styles.loginText}>
                            Next
                        </Text>
                    </TouchableOpacity>
                    <Text
                        style={{ color: 'gray' }}
                    >
                        Already Have an Account?
                        <Text
                            style={styles.forgotPasswordLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            {" Sign In"}
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