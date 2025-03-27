import React, { useContext } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Home from "./src/screens/Home";
import WorkspaceDetail from "./src/screens/WorkspaceDetail";
import ProfileScreen from "./src/screens/Profile";
import ProfileDetail from "./src/screens/ProfileDetail";
import NotificationScreen from "./src/screens/Notification";
import LoginScreen from "./src/screens/LoginScreen";

// Context
import { AuthContext, AuthProvider } from "./src/contexts/AuthContext";
import RegisterScreen from "./src/screens/RegisterScreen";
import WorkSpaces from "./src/screens/WorkSpaces";
import { CartProvider } from "./src/contexts/CartContext";
import Checkout from "./src/screens/Checkout";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="ProfileDetail" component={ProfileDetail} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={Home} />
    <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetail} />
    <Stack.Screen name="Notification" component={NotificationScreen} />
    <Stack.Screen name="WorkSpaces" component={WorkSpaces} />
    <Stack.Screen name="Checkout" component={Checkout} />
  </Stack.Navigator>
);

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        elevation: 5,
        backgroundColor: "#ffffff",
        height: 65,
        ...styles.shadow,
      },
      tabBarActiveTintColor: "#835101",
      tabBarInactiveTintColor: "#999",
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 5,
      },
      tabBarIconStyle: {
        marginTop: 5,
      },
      headerShown: false,
      tabBarHideOnKeyboard: true,
    }}
  >
    <Tab.Screen
      name="Trang chủ"
      component={HomeStack}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="Đặt chỗ"
      component={Home}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="calendar" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Tìm kiếm"
      component={Home}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="search" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Tài khoản"
      component={ProfileStack}
      options={{
        tabBarIcon: ({ color }) => <Icon name="user" size={22} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#835101" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <TabNavigator /> : <AuthScreens />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
