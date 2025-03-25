import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const user = {
  id: 1,
  name: "Phạm Mạnh Cường",
  phone: "0866880125",
  email: "cuong@gmail.com",
  status: "Active",
  avatar:
    "https://res.cloudinary.com/dcq99dv8p/image/upload/v1742023863/IMAGES/ndnjb4tksmhu460nuklq.jpg",
  location: "Phù Mỹ, Bình Định",
  dateOfBirth: "2003-12-25",
  createdAt: "2025-03-14T04:31:32.497",
  updatedAt: "2025-03-14T04:31:32.497",
  roleName: "Customer",
  sex: "Nam",
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

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
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Lỗi khi đăng xuất:", error);
              Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại sau.");
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => navigation.navigate("ProfileDetail", { user })}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profilePhone}>{user.phone}</Text>
          </View>
        </TouchableOpacity>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <MenuItem icon="credit-card" text="Ví WorkHive" onPress={() => {}} />
          <MenuItem
            icon="history"
            text="Lịch sử thanh toán"
            onPress={() => {}}
          />
          <MenuItem icon="bell" text="Thông báo" onPress={() => {}} />
          <MenuItem icon="star" text="Đánh giá của bạn" onPress={() => {}} />
          <MenuItem icon="question-circle" text="Hỗ trợ" onPress={() => {}} />
          <MenuItem icon="file-text" text="Điều khoản" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="sign-out" size={20} color="#FF3B30" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
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
