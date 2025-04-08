import React, { useContext } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import YourBooking from "./src/screens/YourBooking";
import BookingDetailScreen from "./src/screens/YourBookingDetail";
import ReviewScreen from "./src/screens/ReviewScreen";
import YourReviewScreen from "./src/screens/YourReview";
import AllReview from "./src/screens/AllReview";
import SearchScreen from "./src/screens/SearchScreen";
import WalletScreen from "./src/screens/WalletScreen";

import * as Linking from "expo-linking";
import CheckoutSuccessScreen from "./src/screens/CheckoutSuccessScreen";

const linking = {
  prefixes: ["mobile://"],
  config: {
    screens: {
      SuccessPage: "success",
    },
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen
      name="ProfileDetail"
      component={ProfileDetail}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="YourReview"
      component={YourReviewScreen}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="Wallet"
      component={WalletScreen}
      options={{ tabBarVisible: false }}
    />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={Home} />
    <Stack.Screen
      name="WorkspaceDetail"
      component={WorkspaceDetail}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="AllReview"
      component={AllReview}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="Notification"
      component={NotificationScreen}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="WorkSpaces"
      component={WorkSpaces}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="Checkout"
      component={Checkout}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="SuccessPage"
      component={CheckoutSuccessScreen}
      options={{ tabBarVisible: false }}
    />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen
      name="WorkspaceDetail"
      component={WorkspaceDetail}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="AllReview"
      component={AllReview}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="Checkout"
      component={Checkout}
      options={{ tabBarVisible: false }}
    />
  </Stack.Navigator>
);

const BookingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="YourBooking" component={YourBooking} />
    <Stack.Screen
      name="BookingDetail"
      component={BookingDetailScreen}
      options={{ tabBarVisible: false }}
    />
    <Stack.Screen
      name="ReviewScreen"
      component={ReviewScreen}
      options={{ tabBarVisible: false }}
    />
  </Stack.Navigator>
);

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          elevation: 5,
          backgroundColor: "#ffffff",
          height: Platform.OS === "ios" ? 60 + insets.bottom : 65,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 0,
          ...styles.shadow,
          display:
            (route.name === "Đặt chỗ" &&
              route.state?.routes[route.state.index]?.name ===
                "BookingDetail") ||
            (route.name === "Tìm kiếm" &&
              route.state?.routes[route.state.index]?.name === "Checkout") ||
            (route.state && route.state.index > 0)
              ? "none"
              : "flex",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        },
        tabBarActiveTintColor: "#835101",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: Platform.OS === "ios" ? 0 : 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
        tabBarPressColor: "rgba(131, 81, 1, 0.1)",
      })}
    >
      <Tab.Screen
        name="Trang chủ"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name="home" size={focused ? 24 : 22} color={color} />
          ),
          tabBarBadge: null,
        }}
      />
      <Tab.Screen
        name="Đặt chỗ"
        component={BookingStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name="calendar" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tìm kiếm"
        component={SearchStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name="search" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tài khoản"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name="user" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

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
    <NavigationContainer linking={linking}>
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
