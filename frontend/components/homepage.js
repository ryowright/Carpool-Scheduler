import React, { useState, useContext } from "react"
import { View,
        Text,
        TextInput,
        StyleSheet,
        TouchableOpacity,
        KeyboardAvoidingView } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { IconButton, Colors } from 'react-native-paper'
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Home({ navigation }) {
    const [message, setMessage] = useState("")
    const [error, setError] = useState(true)

    return (
        <View 
            style={styles.container}
        >
            <View style={styles.settingsContainer}>
                <IconButton 
                    style={styles.settingsBtn}
                    icon="cog"
                    color={Colors.grey500}
                    size={32}
                    onPress={() => navigation.navigate('Settings')}
                />
            </View>
            <KeyboardAvoidingView
                style={styles.groupContainer}
                behavior="padding"
            >
                <Text
                    style={styles.title}
                >
                    Carpool Scheduler
                </Text>
                <View style={styles.loginContainer}>
                    <TouchableOpacity 
                        onPress={() => console.log('Create a group')}
                        style={styles.groupBtn}
                    >
                        <Text>Create a group</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => console.log('Join a group')}
                        style={styles.groupBtn}
                    >
                        <Text>Join a group</Text>
                    </TouchableOpacity>
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
    },
    groupContainer: {
        flex: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 40,
    },
    loginContainer: {
        alignItems: "center",
        margin: 20
    },
    settingsContainer: {
        width: "100%",
        justifyContent: "center",
        flex: 2,
        paddingRight: 20,
    },
    settingsBtn: {
        alignSelf: 'flex-end',
        // position: 'absolute', // add if dont work with above
    },
    groupBtn: {
        width: 200,
        borderRadius: 20,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "#106BB1",
        margin: 20,
    },
})