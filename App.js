// import React, { useContext, useEffect } from "react";
// import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import Icon from "react-native-vector-icons/FontAwesome";
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import Home from "./src/screens/Home";
// import WorkspaceDetail from "./src/screens/WorkspaceDetail";
// import ProfileScreen from "./src/screens/Profile";
// import ProfileDetail from "./src/screens/ProfileDetail";
// import NotificationScreen from "./src/screens/Notification";
// import LoginScreen from "./src/screens/LoginScreen";
// import Terms from "./src/screens/Terms";
// import AllFeedBackScreen from "./src/screens/AllFeedBackScreen";

// Context
import { AuthContext, AuthProvider } from "./src/contexts/AuthContext";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
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
import FeedbackScreen from "./src/screens/FeedbackScreen";
import AllHighRatedSpaces from "./src/screens/AllHighRatedSpaces";
import AllOwners from "./src/screens/AllOwners";
import OwnerDetail from "./src/screens/OwnerDetail";

import * as Linking from "expo-linking";
import SuccessScreen from "./src/screens/SuccessScreen";
import FailScreen from "./src/screens/FailScreen";
import NearbyWorkspace from "./src/screens/NearbyWorkspace";

// // Set up deep linking configuration
// const prefix = Linking.createURL("/");
// const linking = {
//   prefixes: [prefix, "mobile://", "https://workhive.com"],
//   config: {
//     screens: {
//       HomeStack: {
//         screens: {
//           SuccessPage: {
//             path: "success",
//             parse: {
//               OrderCode: (OrderCode) => OrderCode,
//               BookingId: (BookingId) => BookingId,
//               status: (status) => status,
//             },
//           },
//           FailPage: {
//             path: "cancel",
//             parse: {
//               OrderCode: (OrderCode) => OrderCode,
//               BookingId: (BookingId) => BookingId,
//               status: (status) => status,
//             },
//           },
//         },
//       },
//     },
//   },
// };

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();
// const AuthStack = createNativeStackNavigator();

// const ProfileStack = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="ProfileMain" component={ProfileScreen} />
//     <Stack.Screen name="ProfileDetail" component={ProfileDetail} />
//     <Stack.Screen name="YourReview" component={YourReviewScreen} />
//     <Stack.Screen name="Wallet" component={WalletScreen} />
//     <Stack.Screen name="Terms" component={Terms} />
//     <Stack.Screen name="AllFeedBackScreen" component={AllFeedBackScreen} />
//   </Stack.Navigator>
// );

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={Home} />
    <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetail} />
    <Stack.Screen name="NearbyWorkspace" component={NearbyWorkspace} />
    <Stack.Screen name="AllReview" component={AllReview} />
    <Stack.Screen name="Notification" component={NotificationScreen} />
    <Stack.Screen name="WorkSpaces" component={WorkSpaces} />
    <Stack.Screen name="AllHighRatedSpaces" component={AllHighRatedSpaces} />
    <Stack.Screen name="AllOwners" component={AllOwners} />
    <Stack.Screen name="Checkout" component={Checkout} />
    <Stack.Screen name="SuccessPage" component={SuccessScreen} />
    <Stack.Screen name="FailPage" component={FailScreen} />
    <Stack.Screen name="OwnerDetail" component={OwnerDetail} />
  </Stack.Navigator>
);

// const SearchStack = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="SearchMain" component={SearchScreen} />
//     <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetail} />
//     <Stack.Screen name="AllReview" component={AllReview} />
//     <Stack.Screen name="Checkout" component={Checkout} />
//     <Stack.Screen name="OwnerDetail" component={OwnerDetail} />
//   </Stack.Navigator>
// );

// const BookingStack = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="YourBooking" component={YourBooking} />
//     <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
//     <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
//     <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetail} />
//     <Stack.Screen name="Checkout" component={Checkout} />
//     <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
//     <Stack.Screen name="OwnerDetail" component={OwnerDetail} />
//   </Stack.Navigator>
// );

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

// const getScreensWithHiddenTabBar = () => [
//   // Home Stack
//   "WorkspaceDetail", "AllReview", "Notification", "WorkSpaces", "Checkout", "SuccessPage", "FailPage", "AllHighRatedSpaces", "AllOwners",
//   // Search Stack
//   "WorkspaceDetail", "AllReview", "Checkout", "OwnerDetail",
//   // Booking Stack
//   "BookingDetail", "ReviewScreen", "WorkspaceDetail", "Checkout", "FeedbackScreen",
//   // Profile Stack
//   "ProfileDetail", "YourReview", "Wallet", "Terms", "AllFeedBackScreen",
// ];

// const TabNavigator = () => {
//   const insets = useSafeAreaInsets();

//   return (
//     <Tab.Navigator
//       screenOptions={({ route, navigation }) => {
//         const state = navigation.getState();
//         const currentTab = state.routes[state.index];
//         const currentStack = currentTab.state;

//         // Get the current screen name in the active stack
//         let currentScreenName = "";
//         if (currentStack) {
//           const stackIndex = currentStack.index;
//           const currentStackRoute = currentStack.routes[stackIndex];
//           currentScreenName = currentStackRoute.name;
//         }

//         const isHidden = getScreensWithHiddenTabBar().includes(currentScreenName);

//         return {
//           tabBarStyle: {
//             elevation: 5,
//             backgroundColor: "#ffffff",
//             height: Platform.OS === "ios" ? 60 + insets.bottom : 65,
//             paddingBottom: Platform.OS === "ios" ? insets.bottom : 0,
//             ...styles.shadow,
//             display: isHidden ? "none" : "flex",
//             borderTopWidth: 1,
//             borderTopColor: "#f0f0f0",
//           },
//           tabBarActiveTintColor: "#835101",
//           tabBarInactiveTintColor: "#999",
//           tabBarLabelStyle: {
//             fontSize: 12,
//             fontWeight: "500",
//             marginBottom: Platform.OS === "ios" ? 0 : 5,
//           },
//           tabBarIconStyle: {
//             marginTop: 5,
//           },
//           headerShown: false,
//           tabBarHideOnKeyboard: true,
//           tabBarShowLabel: true,
//           tabBarAllowFontScaling: false,
//           tabBarPressColor: "rgba(131, 81, 1, 0.1)",
//         };
//       }}
//     >
//       <Tab.Screen
//         name="Trang chủ"
//         component={HomeStack}
//         options={{
//           tabBarIcon: ({ color, focused }) => (
//             <Icon name="home" size={focused ? 24 : 22} color={color} />
//           ),
//           tabBarBadge: null,
//         }}
//       />
//       <Tab.Screen
//         name="Đặt chỗ"
//         component={BookingStack}
//         options={{
//           tabBarIcon: ({ color, focused }) => (
//             <Icon name="calendar" size={focused ? 24 : 22} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Tìm kiếm"
//         component={SearchStack}
//         options={{
//           tabBarIcon: ({ color, focused }) => (
//             <Icon name="search" size={focused ? 24 : 22} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Tài khoản"
//         component={ProfileStack}
//         options={{
//           tabBarIcon: ({ color, focused }) => (
//             <Icon name="user" size={focused ? 24 : 22} color={color} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   const { isLoading, userToken } = useContext(AuthContext);

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator color="#835101" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer linking={linking}>
//       {userToken ? <TabNavigator /> : <AuthScreens />}
//     </NavigationContainer>
//   );
// };

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <AuthProvider>
//         <CartProvider>
//           <AppNavigator />
//         </CartProvider>
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   shadow: {
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 5,
//   },
// });

import { StyleSheet, Text, View } from "react-native";
import { usePushNotifications } from "./usePushNotification";

export default function App() {
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  return (
    <View style={styles.container}>
      <Text>Token: {expoPushToken?.data ?? ""}</Text>
      <Text>Notification: {data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
