import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import { View,
        Text,
        Image,
        Modal,
        TextInput,
        StyleSheet,
        Pressable,
        FlatList } from "react-native";
import { Divider } from 'react-native-paper';
import { UserContext } from '../../usercontext';
import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GroupDetail({ navigation, route }) {
    const [group, setGroup] = useState(null)
    const [reqPending, setReqPending] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)

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
                isReqPending(token)
            })
            .catch((error) => {
                console.log(error)
            })
        }

        const isReqPending = (token) => {
            const URL = BASE_API_URL + `/group/myrequest?group_id=${route.params?.groupId}`
            fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then((response) => response.json())
            .then(data => {
                if (data.success && data.reqPending) {
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

        renderGroup()
    }, [])

    const sendJoinRequest = async () => {
        const URL = BASE_API_URL + '/group/join-request'
        const token = await AsyncStorage.getItem('@session_token')
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

    const tokenModal = () => {
        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                      setModalVisible(!modalVisible)
                    }}
                >

                </Modal>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Image 
                    style={{backgroundColor: 'blue', width: 200, height: 200}}
                />
                <Text style={styles.title}>{ !group ? 'Group Name goes here.' : group.group_name }</Text>
            </View>
            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{ !group ? 'Group Description goes here.' : group.description }</Text>
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
                        onPress={() => sendJoinRequest()}
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
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.joinBtnText}>Join with Token</Text>
                    </Pressable>
                </View>
            </View>
            <View style={styles.modalContainer}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                    setModalVisible(!modalVisible)
                    }}
                >
                    <View style={styles.modalView}>
                        <Text>Modal Text</Text>
                    </View>
                </Modal>
            </View>
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
    },
    modalContainer: {
        // flex: 1,
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 0
    },
    modalView: {
        // bottom: 0,
        backgroundColor: 'blue',
        alignItems: "center",
        justifyContent: "center",
        height: '100%',
        width: '100%'
    },
})