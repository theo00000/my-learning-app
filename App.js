import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import Material from "./screens/Material";
import Register from "./screens/Register";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Material" component={Material} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
