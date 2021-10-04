import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import { View,
        Text,
        FlatList,
        Pressable,
        StyleSheet } from "react-native";
import { Divider } from 'react-native-paper';
import { IconButton, Colors } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupHome({ navigation, route }) { 
    const [token, setToken] = useState(null)
    const [schedules, setSchedules] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    

    useEffect(() => {
        const auth = async() => {
            const tok = await AsyncStorage.getItem('@session_token')
            if (!tok) {
                console.log('no session token')
                return setIsAuth(false)
            }
            setToken(tok)
            // fetchMySchedule(tok)
        }

        const fetchMySchedule = (token) => {
            const URL = BASE_API_URL + '/schedule/me'
            fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error)
                } else {
                    console.log(data)
                    // setSchedules(data.schedules)
                }
            })
            .catch(error => {
                console.log(error)
            })
        }
        auth()
    }, [])

    const renderItem = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Pressable
                    onPress={() => console.log(item)}
                    style={({ pressed }) => [
                        {
                            backgroundColor: pressed
                            ? '#c9c9c9'
                            : 'white'
                        }
                    ]}
                >
                    <View style={styles.item}>
                        <View>
                            <Text style={{ fontSize: 16 }}>{item}</Text>
                        </View>
                        <View>
                            <Text>To campus: </Text>
                            <Text>From campus: </Text>
                            <Text>Driver: </Text>
                        </View>
                    </View>
                </Pressable>
                <Divider />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.settingsContainer}>
                <IconButton 
                    style={styles.settingsBtn}
                    icon="bell"
                    color={Colors.grey500}
                    size={32}
                    onPress={() => navigation.navigate('Settings')}
                />
                <IconButton 
                    style={styles.settingsBtn}
                    icon="cog"
                    color={Colors.grey500}
                    size={32}
                    onPress={() => navigation.navigate('Settings')}
                />
            </View>
            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Group Name</Text>
            </View>
            <View style={styles.schedulesContainer}>
                <Divider />
                <FlatList 
                    data={schedules}
                    renderItem={renderItem}
                    keyExtractor={day => day}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        flex: 1,
        backgroundColor: "white"
    },
    settingsContainer: {
        width: "100%",
        justifyContent: "flex-end",
        flex: 1,
        flexDirection: "row",
        top: 50,
        paddingRight: 20
    },
    settingsBtn: {
        // alignSelf: 'flex-end',
    },
    headingContainer: {
        width: "100%",
        alignItems: "center"
    },
    heading: {
        fontSize: 40
    },
    schedulesContainer: {
        flex: 4,
        marginTop: 80,
        width: "100%",
        bottom: 20
    },
    itemContainer: {

    },
    item: {
        height: 125,
        paddingLeft: 30,
        justifyContent: "center"
    }
})