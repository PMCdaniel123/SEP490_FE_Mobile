import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";
import {
  FavoritesContext,
  FavoritesProvider,
} from "./src/contexts/favoritesContext";
import Icon from "react-native-vector-icons/FontAwesome";
import Home from "./src/screens/Home";
import Favorite from "./src/screens/Favorite";
import Detail from "./src/screens/Detail";
import TopOfWeek from "./src/screens/TopOfWeek";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const { favorites } = useContext(FavoritesContext);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#470101",
        tabBarInactiveTintColor: "#ccc",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={26} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#470101" },
          headerTintColor: "#fff",
        }}
      />

      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="heart" size={26} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#470101" },
          headerTintColor: "#fff",
          tabBarBadge: favorites.length,
          tabBarBadgeStyle: { backgroundColor: "red", fontSize: 10 },
        }}
      />

      <Tab.Screen
        name="Top Of Week"
        component={TopOfWeek}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="list" size={26} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#470101" },
          headerTintColor: "#fff",
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="TabNavigator"
            component={TabNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Detail"
            component={Detail}
            options={{
              title: "Detail",
              headerShown: true,
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#470101" },
              headerTintColor: "#fff",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
