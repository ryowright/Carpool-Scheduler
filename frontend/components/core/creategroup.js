import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import { View,
        KeyboardAvoidingView,
        Text,
        TouchableOpacity,
        StyleSheet } from "react-native";
import { Divider } from 'react-native-paper';
import { UserContext } from '../../usercontext';
import CustomInput from '../custom/custominput';
import { Picker } from "@react-native-community/picker";
import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateGroup({ navigation }) { 
    const [groupName, setGroupName] = useState("")
    const [description, setDescription] = useState("")
    const [privacy, setPrivacy] = useState("locked")

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.form}
                behavior="padding"
            >
                <CustomInput 
                    inputTitle="Group Name"
                    onChangeText={setGroupName}
                    value={groupName}
                    maxLength={120}
                />
                <CustomInput
                    inputTitle="Description"
                    onChangeText={setDescription}
                    value={description}
                    multiline={true}
                    extraStyle={styles.description}
                    maxLength={500}
                />
                <TouchableOpacity
                    onPress={() => navigation.navigate('Create Group Two', { groupName, description })}
                    style={styles.createBtn}
                >
                    <Text style={styles.createBtnText}>
                        Next
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        flex: 1
    },
    form: {
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    description: {
        height: 200,
        maxHeight: 300,
        marginBottom: 0,
    },
    pickerContainer: {

    },
    privacy: {
        width: 300
    },
    createBtn: {
        width: 160,
        borderRadius: 10,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "#106BB1",
        margin: 20,
    },
    createBtnText: {
        color: "white"
    }
})