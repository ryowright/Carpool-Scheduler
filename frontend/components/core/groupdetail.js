import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import { View,
        Text,
        Image,
        TextInput,
        StyleSheet,
        Pressable,
        Button,
        FlatList } from "react-native";
import { Divider } from 'react-native-paper';
import { UserContext } from '../../usercontext';
import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GroupDetail({navigation, route}) {
    const [group, setGroup] = useState()
    const [reqPending, setReqPending] = (false)

    const {
        setIsAuth
    } = useContext(UserContext)

    useEffect(() => {
        const renderGroup = async () => {
            const URL = BASE_API_URL + `/group/get-group?id=${route.params?.groupId}`
            const token = await AsyncStorage.getItem('@session_token')
            if (!token) {
                console.log('no session token')
                return setIsAuth(false)
            }
            fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then((response) => response.json())
            .then(data => {
                setGroup(data.group)
                checkJoinRequests(token)
            })
            .catch((error) => {
                console.log(error)
                // setIsAuth(false)
                // AsyncStorage.removeItem('@session_key')
            })
        }

        const checkJoinRequests = (token) => {
            const URL = BASE_API_URL + `/group/requests?group_id=${route.params?.groupId}`
            fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then((response) => response.json())
            .then(data => {
                if (data.success) {
                    setReqPending(true)
                } else {
                    setReqPending(false)
                }
                console.log(data)
            })
            .catch((error) => {
                console.log(error)
            })
        }

        // renderGroup()
    }, [])

    const joinRequest = () => {
        const URL = BASE_API_URL + '/group/join-request'
        fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ groupId: group?.id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error)
            } else {
                setReqPending(true)
                console.log(data)
            }
        })
        .catch(error => console.log(error))
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Image 
                    style={{backgroundColor: 'blue', width: 200, height: 200}}
                />
                <Text style={styles.title}>Group Name goes here.</Text>
            </View>
            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>Group Description goes here.</Text>
                <View style={styles.btnContainer}>
                    <Pressable 
                        disabled={reqPending}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed
                                ? '#4666FF'
                                : '#106BB1'
                            },
                            styles.joinBtn
                        ]}
                        onPress={() => joinRequest()}
                    >
                        <Text style={styles.joinBtnText}>{!reqPending ? "Request To Join" : "Request Pending"}</Text>
                    </Pressable>
                    <Text>OR</Text>
                    <Pressable 
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed
                                ? '#4666FF'
                                : '#106BB1'
                            },
                            styles.joinBtn
                        ]}
                        onPress={() => console.log('Join Via Token')}
                    >
                        <Text style={styles.joinBtnText}>Join with Token</Text>
                    </Pressable>
                </View>
            </View>
            {group ? 
            <View>
                <Text style={{top: 400, left: 200}}>{group.group_name}</Text>
            </View>
            : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        flex: 1,
        flexDirection: "column"
    },
    titleContainer: {
        flex: 2,
        marginTop: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 40,
        marginBottom: 10,
        marginTop: 10
    },
    descriptionContainer: {
        flex: 3,
        alignItems: "center",
    },
    btnContainer: {
        marginTop: 20,
        alignItems: "center"
    },
    joinBtn: {
        width: 160,
        borderRadius: 10,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        // backgroundColor: "#106BB1",
        margin: 20,
    },
    joinBtnText: {
        color: "white",
    }
})