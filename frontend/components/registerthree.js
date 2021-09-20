import React, { useState, useContext } from "react";
import { View,
        Text,
        TextInput,
        StyleSheet,
        TouchableOpacity,
        Linking,
        KeyboardAvoidingView } from "react-native"
import { Picker } from "@react-native-community/picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { UserContext } from "../App";

export default function RegisterTwo({ navigation }) {
    const [carspace, setCarspace] = useState("")
    const [userType, setUserType] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState(true)

    const {
        firstName,
        lastName,
        email,
        password,
        school
    } = useContext(UserContext)

    const register = async () => {
        const URL = 'http://10.0.0.27:5000/api/user/register'
        fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstname: firstName,
            lastname: lastName,
            email,
            school,
            password,
            carspace,
            type: userType
        }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(data.error)
                setError(true)
            } else if (data.success) {
                setMessage(data.success)
                setError(false)
                navigation.navigate('Home')
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
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={userType}
                        style={styles.userType}
                        onValueChange={(itemValue, itemIndex) =>
                            setUserType(itemValue)
                        }>
                        <Picker.Item label="Carpooler" value="carpooler" />
                        <Picker.Item label="Driver" value="driver" />
                    </Picker>
                </View>
                <View style={styles.loginContainer}>
                    {userType === "driver" ? 
                        <TextInput 
                            style={styles.input}
                            onChangeText={setCarspace}
                            value={carspace}
                            placeholder="Enter carspace (excluding yourself)"
                    /> : null
                    }
                    {!message ? null : 
                        <Text style={{ color: error ? 'red' : 'green' }}>{message}</Text>
                    }
                    <TouchableOpacity
                        onPress={() => {register}}
                        style={styles.loginBtn}
                    >
                        <Text style={styles.loginText}>
                            Register
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
        // marginBottom: 10
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
    userType: {
        height: 80,
        width: 200,
        marginBottom: 20
    },
    pickerContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
    },
    loginContainer: {
        alignItems: "center",
        margin: 20
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