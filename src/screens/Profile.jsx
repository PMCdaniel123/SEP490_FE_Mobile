import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout, userData, userToken } = useContext(AuthContext);
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

  const MenuItem = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={22} color="#835101" />
      </View>
      <Text style={styles.menuText}>{text}</Text>
      <Icon
        name="chevron-right"
        size={16}
        color="#835101"
        style={styles.menuArrow}
      />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              alert("Lỗi khi đăng xuất:", error);
              Alert.alert(
                "Lỗi",
                "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại sau."
              );
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchUserProfile();
          }}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        {/* Profile Section */}
        {userProfile && (
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() =>
              navigation.navigate("ProfileDetail", { user: userProfile })
            }
          >
            <Image
              source={{
                uri:
                  userProfile.avatar ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(userProfile.name),
              }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileEmail}>{userProfile.email}</Text>
              <Text style={styles.profilePhone}>{userProfile.phone}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <MenuItem
            icon="credit-card"
            text="Ví WorkHive"
            onPress={() => navigation.navigate("Wallet")}
          />
          <MenuItem
            icon="history"
            text="Lịch sử thanh toán"
            onPress={() => {
              navigation.navigate("Đặt chỗ");
            }}
          />
          <MenuItem icon="bell" text="Thông báo" onPress={() => {}} />
          <MenuItem
            icon="star"
            text="Đánh giá của bạn"
            onPress={() => navigation.navigate("YourReview")}
          />
          <MenuItem icon="question-circle" text="Hỗ trợ" onPress={() => {}} />
          <MenuItem
            icon="file-text"
            text="Điều khoản"
            onPress={() => navigation.navigate("Terms")}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon
            name="sign-out"
            size={20}
            color="#FF3B30"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#835101",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000000",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 16,
    color: "#666666",
  },
  settingsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuIconContainer: {
    width: 30,
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 15,
    color: "#000000",
  },
  menuArrow: {
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    marginHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default ProfileScreen;
