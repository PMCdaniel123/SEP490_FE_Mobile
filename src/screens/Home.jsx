/* eslint-disable import/no-unresolved */
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import HighRatedSpaces from "../components/HighRatedSpaces";
import Recommendations from "../components/Recommendations";
import SpaceNearYou from "../components/SpaceNearYou";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={require('../../assets/images/workspace2.jpg')}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>Khanh Quang</Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.location}>Thu Duc</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notification')}
          >
            <Icon name="notifications-none" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.locationBanner}>
        <Icon
          name="location-on"
          size={24}
          color="#000"
          style={styles.locationIcon}
        />
        <Text style={styles.locationText}>
          Bạn có thể thay đổi vị trí của mình để hiển thị các Workspace gần đây
        </Text>
        <Icon name="chevron-right" size={24} color="#000" />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* High Rated Spaces */}
        <HighRatedSpaces />
        {/* Recommendations */}
        <Recommendations />
        <SpaceNearYou />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    color: "#666",
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6D5B8",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },

});

export default HomeScreen;
