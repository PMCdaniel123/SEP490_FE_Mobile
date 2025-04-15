/* eslint-disable import/no-unresolved */
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import HighRatedSpaces from "../components/HighRatedSpaces";
import Recommendations from "../components/Recommendations";
import SpaceNearYou from "../components/SpaceNearYou";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userData, userToken } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userData || !userData.sub) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://workhive.info.vn:8443/users/${userData.sub}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (response.data && response.data.user) {
          setUserProfile(response.data.user);
        } else {
          setError("Không thể tải thông tin người dùng");
        }
      } catch (error) {
        alert("Lỗi khi tải hồ sơ:", error);
        setError("Đã xảy ra lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userData, userToken]);

  // Data for our FlatList sections
  const sections = [
    { id: "highRated", component: HighRatedSpaces },
    { id: "recommendations", component: Recommendations },
    { id: "nearYou", component: SpaceNearYou },
  ];

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                userProfile?.avatar ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(userProfile?.name),
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{userProfile?.name}</Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#666" />
              {userProfile?.location !== null ? (
                <Text style={styles.location}>{userProfile?.location}</Text>
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProfileDetail", { user: userProfile })
                  }
                >
                  <Text style={styles.location}>Chưa cập nhật</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Notification")}
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
    </>
  );

  const renderSectionItem = ({ item }) => {
    const Component = item.component;
    return <Component />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={sections}
        renderItem={renderSectionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
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
