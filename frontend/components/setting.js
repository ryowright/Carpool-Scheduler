import React, { useState, useContext } from "react"
import { View,
        Text,
        TextInput,
        StyleSheet,
        TouchableOpacity,
        KeyboardAvoidingView } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Divider } from 'react-native-paper';

export default function Setting(props) {

    return (
        <View style={styles.settingsContainer}>
            <View style={styles.settingsSubContainer}>
                <Divider />
                <TouchableOpacity
                    onPress={() => console.log('Sign out')}
                    style={styles.signoutBtn}
                >
                    <Text style={styles.settingsText}>Sign Out of Carpool Scheduler</Text>
                </TouchableOpacity>
                <Divider />
            </View>
        </View>
    )
}