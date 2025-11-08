import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from '../screens/auth/LandingScreen';
import Login from '../screens/auth/Login';
import Signup from '../screens/auth/Signup';
import AuthTest from '../components/forms/AuthTest';

const AuthStack = createStackNavigator();

export default function AuthNavigator({ onLogin }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Landing">
        {(props) => <LandingScreen {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Login">
        {(props) => <Login {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Signup">
        {(props) => <Signup {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="AuthTest">
        {(props) => <AuthTest {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
} 