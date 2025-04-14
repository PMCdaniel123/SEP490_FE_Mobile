import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import CustomDatePicker from "../components/CustomDatePicker";

const ProfileDetail = ({ route, navigation }) => {
  const { user: initialUser } = route.params;
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const { userData, userToken } = useContext(AuthContext);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.dateOfBirth) {
      const date = new Date(user.dateOfBirth);
      setSelectedDay(date.getDate());
      setSelectedMonth(date.getMonth() + 1);
      setSelectedYear(date.getFullYear());
    }
  }, [user.dateOfBirth]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        "https://workhive.info.vn:8443/users/update",
        {
          userId: userData.sub,
          name: user.name,
          email: user.email,
          location: user.location,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          sex: user.sex,
          avatar: user.avatar,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setIsEditing(false);
        Alert.alert("Thành công", "Thông tin của bạn đã được cập nhật");
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể cập nhật thông tin. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      alert("Lỗi khi cập nhật hồ sơ:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setUser((prevUser) => ({ ...prevUser, [key]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const showDatePicker = () => {
    if (isEditing) {
      setDatePickerVisibility(true);
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const confirmDate = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const formattedDate = date.toISOString().split("T")[0];
    handleChange("dateOfBirth", formattedDate);
    hideDatePicker();
  };
  const pickImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép ứng dụng truy cập thư viện ảnh của bạn."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "photo.jpg",
        });

        const response = await axios.post(
          "https://workhive.info.vn:8443/images/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.status === 200) {
          handleChange("avatar", response.data.data[0]);
        } else {
          Alert.alert("Lỗi", "Không thể tải lên ảnh. Vui lòng thử lại sau.");
        }
      } catch (error) {
        alert("Lỗi khi tải lên ảnh:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải lên ảnh");
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#835101" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "create"}
            size={24}
            color="#835101"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {isEditing && (
            <View style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={user.name}
            onChangeText={(text) => handleChange("name", text)}
          />
        ) : (
          <Text style={styles.name}>{user.name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <InfoItem
          icon="mail"
          label="Email"
          value={user.email}
          isEditing={isEditing}
          onChangeText={(text) => handleChange("email", text)}
        />
        <InfoItem
          icon="call"
          label="Điện thoại"
          value={user.phone}
          isEditing={isEditing}
          onChangeText={(text) => handleChange("phone", text)}
        />
        <InfoItem
          icon="location"
          label="Địa chỉ"
          value={user.location}
          isEditing={isEditing}
          onChangeText={(text) => handleChange("location", text)}
        />
        <View style={styles.infoItem}>
          <Ionicons
            name="calendar"
            size={24}
            color="#835101"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ngày sinh</Text>
            {isEditing ? (
              <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.datePickerText}>
                  {user.dateOfBirth
                    ? formatDate(user.dateOfBirth)
                    : "Chọn ngày sinh"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.infoValue}>
                {user.dateOfBirth ? formatDate(user.dateOfBirth) : "Trống"}
              </Text>
            )}
          </View>
        </View>
        <InfoItem
          icon="person"
          label="Giới tính"
          value={user.sex}
          isEditing={isEditing}
          onChangeText={(text) => handleChange("sex", text)}
        />
      </View>
      {isEditing && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      )}

      <CustomDatePicker
        isVisible={isDatePickerVisible}
        onClose={hideDatePicker}
        onConfirm={confirmDate}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedDay={setSelectedDay}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
      />
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value, isEditing, onChangeText }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={24} color="#835101" style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={value || ""}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "Trống"}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  editButton: {
    padding: 10,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  changePhotoButton: {
    position: "absolute",
    right: 0,
    bottom: 10,
    backgroundColor: "#835101",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  nameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#835101",
    paddingBottom: 5,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoInput: {
    fontSize: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#835101",
    paddingBottom: 5,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#835101",
    paddingBottom: 5,
    paddingTop: 5,
  },
  saveButton: {
    backgroundColor: "#835101",
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileDetail;
