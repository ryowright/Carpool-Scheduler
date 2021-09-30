import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import { View,
        KeyboardAvoidingView,
        Text,
        TouchableOpacity,
        StyleSheet } from "react-native";
import { Picker } from "@react-native-community/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../usercontext';

export default function CreateGroupTwo({ navigation, route }) { 
    const [privacy, setPrivacy] = useState("locked")
    const [token, setToken] = useState(null)

    const {
        setGroupId
    } = useContext(UserContext)

    const privacyDescriptions = {
        "open": "An open group allows any user to search for and join your group without required permission.",
        "locked": "A locked group allows any user to search for your group, but the user cannot join without a token or an accepted join request.",
        "private": "A private group cannot be discovered through the group search, and users must receive an invite in order to join the group."
    }

    useEffect(() => {
        const auth = async() => {
            const tok = await AsyncStorage.getItem('@session_token')
            if (!tok) {
                console.log('no session token')
                return setIsAuth(false)
            }
            setToken(tok)
        }
        auth()
    }, [])

    const createGroup = () => {
        const URL = BASE_API_URL + "/group/create"
        fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                groupName: route.params?.groupName,
                description: route.params?.description,
                privacy
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error)
            } else {
                console.log('create group success')
                setGroupId(data.groupId)
            }
            console.log(data)
        })
        .catch((error) => {
            console.log(error)
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.privacyHeadingContainer}>
                <Text style={styles.privacyTitle}>Privacy: {privacy}</Text>
                <Text style={styles.privacyDescription}>{privacyDescriptions[privacy]}</Text>
            </View>
            <View style={styles.form}>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={privacy}
                        style={styles.privacy}
                        onValueChange={(itemValue, itemIndex) =>
                            setPrivacy(itemValue)
                        }>
                        <Picker.Item label="Open" value="open" />
                        <Picker.Item label="Locked" value="locked" />
                        <Picker.Item label="Private" value="private" />
                    </Picker>
                </View>
                <TouchableOpacity
                    onPress={() => createGroup()}
                    style={styles.createBtn}
                >
                    <Text style={styles.createBtnText}>
                        Create Group
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        flex: 1
    },
    privacyHeadingContainer: {
        flex: 1,
        alignItems: "center",
        top: "10%",
    },
    privacyTitle: {
        fontSize: 30
    },
    privacyDescription: {
        fontSize: 20,
        marginTop: 10,
        marginLeft: 30,
        marginRight: 30
    },
    form: {
        flex: 2,
        alignItems: "center",
        // justifyContent: "center",
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