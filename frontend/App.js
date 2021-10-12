import React, { useEffect, useState } from 'react';
import { BASE_API_URL } from '@env';
import { StyleSheet } from 'react-native';
import Login from './components/authentication/login'
import Register from './components/authentication/register';
import RegisterTwo from './components/authentication/registertwo';
import RegisterThree from './components/authentication/registerthree';
import VerifyEmail from './components/authentication/verifyemail';
import Home from './components/core/homepage';
import ForgotPassword from './components/authentication/forgotpassword';
import ForgotPasswordCode from './components/authentication/forgotpasswordcode';
import ResetPassword from './components/authentication/resetpassword'
import Settings from './components/core/settings';
import SearchGroup from './components/core/searchgroup';
import CreateGroup from './components/core/creategroup';
import GroupHome from './components/core/grouphome';
import CreateGroupTwo from './components/core/creategrouptwo';
import GroupDetail from './components/core/groupdetail';
import CreateSchedule from './components/core/createschedule';
import DriverTo from './components/core/driverto';
import DriverFrom from './components/core/driverfrom';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserContext } from './usercontext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const MyStack = (props) => {
  return (
    <NavigationContainer>
      <UserContext.Provider value={props.value}>
        <Stack.Navigator 
          screenOptions={{
            headerShown: false
          }}
        >
          {!props.value.isAuth ? (
            <>
              <Stack.Screen 
                name="Login"
                component={Login}
              />
              <Stack.Screen 
                name="Registration"
                component={Register}
                options={{
                  headerShown: true,
                  title: "Create an Account"
                }}
              />
              <Stack.Screen 
                name="Registration Two"
                component={RegisterTwo}
                options={{
                  headerShown: true,
                  title: "Create an Account"
                }}
              />
              <Stack.Screen 
                name="Registration Three"
                component={RegisterThree}
                options={{
                  headerShown: true,
                  title: "Create an Account"
                }}
              />
              <Stack.Screen 
                name="Verify Email"
                component={VerifyEmail}
              />
              <Stack.Screen 
                name="Forgot Password"
                component={ForgotPassword}
                options={{
                  headerShown: true,
                  title: "Reset Your Password"
                }}
              />
              <Stack.Screen
                name="Forgot Password Code"
                component={ForgotPasswordCode}
              />
              <Stack.Screen
                name="Reset Password"
                component={ResetPassword}
              />
            </>
          ) : (
            !props.value.groupId ? (
              <>
                <Stack.Screen 
                  name="Home"
                  component={Home}
                />
                <Stack.Screen 
                name="Search Group"
                component={SearchGroup}
                options={{
                  headerShown: true,
                  title: "Search for a Group",
                }}
              />
              <Stack.Screen 
                name="Create Group"
                component={CreateGroup}
                options={{
                  headerShown: true,
                  title: "Create a Group",
                }}
              />
              <Stack.Screen 
                name="Create Group Two"
                component={CreateGroupTwo}
                options={{
                  headerShown: true,
                  title: "Create a Group",
                }}
              />
              <Stack.Screen 
                name="Group Detail"
                component={GroupDetail}
              />
              <Stack.Screen 
                name="Settings"
                component={Settings}
                options={{
                  headerShown: true
                }}
              />
              </>
            ) : (
              <>
                <Stack.Screen 
                  name="Group Home"
                  component={GroupHome}
                />
                <Stack.Screen 
                  name="Settings"
                  component={Settings}
                  options={{
                    headerShown: true
                  }}
                />
                <Stack.Screen 
                  name="Create Schedule"
                  component={CreateSchedule}
                />
                <Stack.Screen 
                  name="Driver To"
                  component={DriverTo}
                  options={{
                    headerShown: true,
                    title: 'Select Driver to Campus'
                  }}
                />
                <Stack.Screen 
                  name="Driver From"
                  component={DriverFrom}
                  options={{
                    headerShown: true,
                    title: 'Select Driver From Campus'
                  }}
                />
              </>
            )
          )}
        </Stack.Navigator>
      </UserContext.Provider>
    </NavigationContainer>
  );
};

export default function App() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [school, setSchool] = useState("")
  const [userId, setUserId] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [isAuth, setIsAuth] = useState(false)
  const [groupId, setGroupId] = useState("")

  const value = {
    firstName,
    lastName,
    email,
    password,
    confirmPass,
    school,
    userId,
    resetToken,
    isAuth,
    groupId,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPass,
    setSchool,
    setUserId,
    setResetToken,
    setIsAuth,
    setGroupId
  }

  useEffect(() => {
    const getMyGroup = (token) => {
      const URL = BASE_API_URL + '/group/me'
      fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setGroupId(data.group.id)
        }
      })
      .catch(error => {
        console.log(error)
      })
    }

    const getUser = (token) => {
      const URL = BASE_API_URL + '/user/me'
      fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log({ user: data.user })
          setIsAuth(true)
          getMyGroup(token)
        } else {
          setIsAuth(false)
          console.log(data.error)
        }
      })
      .catch(error => {
        console.log(error)
      })
    }

    async function checkAuth() {
      const token = await AsyncStorage.getItem('@session_token')
      if (!token) {
        setIsAuth(false)
      } else {
        getUser(token)
      }
    }
    checkAuth()
  }, [isAuth, groupId])

  return (
    <MyStack value={value} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
