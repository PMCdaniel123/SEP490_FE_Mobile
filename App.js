import { StyleSheet, View, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import Home from "./src/screens/Home";
import WorkspaceDetail from "./src/screens/WorkspaceDetail";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get("window");

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetail} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            position: "absolute",
            left: 20,
            right: 20,
            elevation: 5,
            backgroundColor: "#ffffff",
            height: 60,
            ...styles.shadow,
          },
          tabBarActiveTintColor: "#F9A825",
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
          },
          tabBarIconStyle: {
            marginTop: 5,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Trang chủ"
          component={HomeStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="home" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Đặt chỗ của tôi"
          component={Home} // Replace with the actual component
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="calendar" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Message"
          component={Home} // Replace with the actual component
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="comment" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Tài khoản"
          component={Home} // Replace with the actual component
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="user" size={22} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
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
    shadowRadius: 4,
    elevation: 5,
  },
});