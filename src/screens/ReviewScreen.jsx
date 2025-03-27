import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const ReviewScreen = ({ route }) => {
  const navigation = useNavigation();
  const {
    bookingId,
    workspaceName,
    licenseAddress,
    capacity,
    area,
    category,
    workspaceImage,
  } = route.params;

  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép ứng dụng truy cập thư viện ảnh của bạn."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
          "http://35.78.210.59:8080/images/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.status === 200) {
          setImages((prevImages) => [
            ...prevImages,
            { url: response.data.data[0] },
          ]);
        } else {
          Alert.alert("Lỗi", "Không thể tải lên ảnh. Vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Lỗi khi tải lên ảnh:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải lên ảnh");
      }
    }
  };

  const handleSubmitReview = async () => {
    if (rate === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đánh giá không gian này.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://35.78.210.59:8080/users/booking/rating",
        {
          bookingId,
          rate,
          comment,
          images,
        }
      );

      if (response.status === 200) {
        Alert.alert("Thành công", "Đánh giá của bạn đã được gửi.");
        navigation.navigate("YourBooking");
      } else {
        Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#835101" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá</Text>
        </View>

        <View style={styles.workspaceCard}>
          <Image
            source={{ uri: workspaceImage }}
            style={styles.workspaceImage}
          />
          <View style={styles.workspaceInfo}>
            <Text style={styles.workspaceName} numberOfLines={1}>
              {workspaceName}
            </Text>
            <Text style={styles.workspaceAddress} numberOfLines={2}>
              {licenseAddress}
            </Text>
            <View style={styles.workspaceDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="business-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{category}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{capacity} người</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="resize-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{area} m²</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Số sao:</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRate(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rate ? "star" : "star-outline"}
                  size={32}
                  color={star <= rate ? "#FFD700" : "#CCCCCC"}
                />
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingText}>{rate}/5</Text>
          </View>

          <Text style={styles.label}>Nhận xét:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Chia sẻ trải nghiệm của bạn về không gian làm việc này..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.imageUploadSection}>
            <Text style={styles.label}>Thêm hình ảnh:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.url }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImageUpload}
              >
                <Ionicons name="camera" size={24} color="#835101" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitReview}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 15,
  },
  workspaceCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workspaceImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  workspaceInfo: {
    flex: 1,
    padding: 10,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  workspaceAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  workspaceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },

  content: {
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  starButton: {
    marginRight: 5,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
  },
  imageUploadSection: {
    marginBottom: 20,
  },
  imageScrollView: {
    flexDirection: "row",
  },
  imageWrapper: {
    marginRight: 10,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#835101",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  addImageText: {
    color: "#835101",
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#835101",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ReviewScreen;
