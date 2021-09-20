import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Login from './components/login'
import Register from './components/register';
import RegisterTwo from './components/registertwo';
import RegisterThree from './components/registerthree';
import Home from './components/homepage';
import ForgotPassword from './components/forgotpassword';
import Settings from './components/settings';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export const UserContext = React.createContext();
const userDict = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPass: "",
  school: "",
  setFirstName: () => {},
  setLastName: () => {},
  setEmail: () => {},
  setPassword: () => {},
  setConfirmPass: () => {},
  setSchool: () => {}
}

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
          <Stack.Screen 
            name="Login"
            component={Login}
          />
          <Stack.Screen 
            name="Registration"
            component={Register}
          />
          <Stack.Screen 
            name="Registration Two"
            component={RegisterTwo}
          />
          <Stack.Screen 
            name="Registration Three"
            component={RegisterThree}
          />
          <Stack.Screen 
            name="Home"
            component={Home}
          />
          <Stack.Screen 
            name="Settings"
            component={Settings}
            options={{
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Forgot Password"
            component={ForgotPassword}
          />
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

  const value = {
    firstName,
    lastName,
    email,
    password,
    confirmPass,
    school,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPass,
    setSchool
  }

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
