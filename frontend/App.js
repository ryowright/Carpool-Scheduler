import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Login from './components/login'
import Register from './components/register';
import ForgotPassword from './components/forgotpassword';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen 
          name="Registration"
          component={Register}
        />
        <Stack.Screen 
          name="Login"
          component={Login}
        />
        <Stack.Screen 
          name="Forgot Password"
          component={ForgotPassword}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <MyStack />
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
