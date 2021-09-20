import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, KeyboardAvoidingView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { UserContext } from "../App";

export default function Register({ navigation }) {
    const [message, setMessage] = useState("")
    const [error, setError] = useState(true)

    const { firstName, 
            lastName,
            email,
            setFirstName,
            setLastName,
            setEmail } = useContext(UserContext)

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
                    onChangeText={setFirstName}
                    value={firstName}
                    placeholder="First Name"
                />
                <TextInput 
                    style={styles.input}
                    onChangeText={setLastName}
                    value={lastName}
                    placeholder="Last Name"
                />
                <TextInput 
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                />
                {!message ? null : 
                    <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
                }
                <View style={styles.loginContainer}>
                    <TouchableOpacity
                        onPress={() => {navigation.navigate('Registration Two')}}
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