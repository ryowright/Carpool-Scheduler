import { BASE_API_URL } from '@env';
import React, { useState, useContext, useLayoutEffect, useEffect } from "react"
import { View,
        Text,
        TextInput,
        StyleSheet,
        Pressable,
        Button,
        FlatList } from "react-native"
import { Divider } from 'react-native-paper';
import { UserContext } from '../../usercontext';
import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchGroup({navigation}) {
    const [DATA, setDATA] = useState(null);
    const [query, setQuery] = useState("");
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);

    const {
        setIsAuth
    } = useContext(UserContext)

    useLayoutEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <Button onPress={() => navigation.goBack()} title="Cancel" />
          ),
        });
    }, [navigation]);

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

    const searchGroup = async (searchQuery) => {
        console.log(searchQuery)
        setQuery(searchQuery)
        if (searchQuery.trim().length === 0) {
            return setDATA(null)
        }

        const URL = BASE_API_URL + '/group/search?group_name=' + searchQuery
        fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error)
            } else {
                setDATA(data.groups.length !== 0 ? data.groups : null)
            }
        })
        .catch((error) => {
            console.log(error)
            setIsAuth(false)
            AsyncStorage.removeItem('@session_key')
        });
    }

    const renderItem = ({ item }) => {
        return (
            <View style={styles.groupListItemContainer}>
                <Pressable
                    onPress={() => {navigation.navigate('Group Detail', { groupId: item.id })}}
                    style={({ pressed }) => [
                        {
                            backgroundColor: pressed
                            ? '#c9c9c9'
                            : 'white'
                        }
                    ]}
                >
                    <View style={styles.groupListItem}>
                        <Text>{item.group_name}</Text>
                    </View>
                </Pressable>
                <Divider />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBarView}>
                <TextInput
                    style={styles.searchBarInput}
                    placeholder="Group name"
                    onChangeText={searchGroup}
                    value={query}
                />
                <Pressable
                    onPress={() => searchGroup()}
                    style={styles.searchBtn}>
                    <Icon 
                        style={styles.searchBtn}
                        name="search"
                        size={30}
                    />
                </Pressable> 
            </View>
            <Divider />
            <View style={styles.groupListContainer}>
                {DATA ? (
                    <View>
                        <Text style={styles.searchTitle}>Top Results</Text>
                        <FlatList
                            data={DATA}
                            renderItem={renderItem}
                            extraData={DATA}
                            keyExtractor={group => group.id.toString()}
                        />
                    </View>
                )
                : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    searchBarView: {
        flexDirection: "row",
        width: "100%",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    searchBarInput: {
        fontSize: 16,
        width: "85%",
    },
    searchBtn: {
        backgroundColor: "whitesmoke",
        color: '#9aa0a6'
    },
    searchTitle: {
        height: 40,
        width: "100%",
        fontSize: 16,
        fontWeight: "bold",
        padding: 10,
        paddingBottom: 30,
        paddingLeft: 20,
    },
    groupListContainer: {
        width: "100%"
    },
    groupListItemContainer: {

    },
    groupListItem: {
        padding: 20,
    }
})