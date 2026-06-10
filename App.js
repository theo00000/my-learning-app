import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

import DashboardScreen from "./src/screens/Dashboard";
import LoginScreen from "./src/screens/Login";
import MaterialDetailScreen from "./src/screens/Material";
import RegisterScreen from "./src/screens/Register";

import { colors, globalStyles } from "./src/styles/theme";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={globalStyles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 14, color: colors.muted, fontWeight: "700" }}>
        Checking your session...
      </Text>
    </View>
  );
}

function RootNavigator() {
  const { isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen
              name="MaterialDetail"
              component={MaterialDetailScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
