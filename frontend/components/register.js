import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, KeyboardAvoidingView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Register({ navigation }) {

    return (
        <View
            style={styles.container}
        >
            <View
                style={styles.registrationForm}
            >
                <Text>
                    Registration
                </Text>
            </View>
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
})