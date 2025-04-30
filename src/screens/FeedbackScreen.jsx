import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const FeedbackScreen = ({ route }) => {
  const { bookingId, workspaceName } = route.params;
  const navigation = useNavigation();
  const { userData, userToken } = useContext(AuthContext);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [ownerResponse, setOwnerResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForExistingFeedback();
  }, []);

  const checkForExistingFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://workhive.info.vn:8443/feedbacks/booking/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );

      if (response.data) {
        setExistingFeedback(response.data);
        
        // Check for owner response if feedback exists
        if (response.data.id) {
          fetchOwnerResponse(response.data.id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      // If 404 error, it means no feedback exists yet, which is expected
      if (error.response && error.response.status === 404) {
        console.log("No existing feedback found for this booking");
      } else {
        console.error("Error checking for existing feedback:", error);
      }
      setLoading(false);
    }
  };

  const fetchOwnerResponse = async (feedbackId) => {
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/response-feedbacks/feedback/${feedbackId}`,
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );

      if (response.data) {
        setOwnerResponse(response.data);
      }
    } catch (error) {
      // If 404 error, it means no owner response yet, which is expected
      if (error.response && error.response.status === 404) {
        console.log("No owner response found for this feedback yet");
      } else {
        console.error("Error fetching owner response:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    if (images.length >= 8) {
      Alert.alert("Thông báo", "Bạn chỉ có thể tải lên tối đa 8 hình ảnh");
      return;
    }

    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh để sử dụng tính năng này");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedAssets = result.assets;
      if (images.length + selectedAssets.length > 8) {
        Alert.alert("Thông báo", "Bạn chỉ có thể tải lên tối đa 8 hình ảnh");
        const remaining = 8 - images.length;
        if (remaining > 0) {
          setImages([...images, ...selectedAssets.slice(0, remaining)]);
        }
      } else {
        setImages([...images, ...selectedAssets]);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    
    const fileName = uri.split('/').pop();
    const fileType = fileName.split('.').pop();
    
    formData.append("image", {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      name: fileName,
      type: `image/${fileType}`
    });

    try {
      const response = await axios.post(
        "https://workhive.info.vn:8443/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userToken}`
          },
        }
      );
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data[0]; // Return the URL
      } else {
        throw new Error("Không nhận được URL hình ảnh");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tiêu đề phản hồi");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = [];
      for (const image of images) {
        try {
          const imageUrl = await uploadImage(image.uri);
          imageUrls.push(imageUrl);
        } catch (error) {
          Alert.alert("Lỗi", "Có lỗi xảy ra khi tải lên hình ảnh. Vui lòng thử lại.");
          setIsSubmitting(false);
          return;
        }
      }

      // Submit feedback
      const feedbackData = {
        title: title,
        description: description,
        userId: userData.sub,
        bookingId: bookingId,
        images: imageUrls.map(imgUrl => ({ imgUrl }))
      };

      const response = await axios.post(
        "https://workhive.info.vn:8443/feedbacks",
        feedbackData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Thành công",
          "Phản hồi của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error("Có lỗi xảy ra khi gửi phản hồi");
      }
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau."
      );
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render an existing feedback and its response
  const renderExistingFeedback = () => {
    return (
      <View style={styles.existingFeedbackContainer}>
        <View style={styles.feedbackCard}>
          <Text style={styles.sectionTitle}>Phản hồi của bạn</Text>
          <Text style={styles.feedbackInfoText}>
            Bạn đã gửi phản hồi cho đặt chỗ này
          </Text>
          
          <View style={styles.feedbackDetailsCard}>
            <View style={styles.feedbackDetailRow}>
              <Text style={styles.feedbackDetailLabel}>Ngày gửi:</Text>
              <Text style={styles.feedbackDetailValue}>
                {formatDate(existingFeedback.createdAt)}
              </Text>
            </View>
            
            <View style={styles.feedbackDetailRow}>
              <Text style={styles.feedbackDetailLabel}>Không gian làm việc:</Text>
              <Text style={styles.feedbackDetailValue}>
                {existingFeedback.workspaceName}
              </Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackDetailLabel}>Nội dung phản hồi:</Text>
              <Text style={styles.feedbackDescription}>
                {existingFeedback.description}
              </Text>
            </View>
            
            {existingFeedback.imageUrls && existingFeedback.imageUrls.length > 0 && (
              <View style={styles.feedbackImages}>
                <Text style={styles.feedbackDetailLabel}>Hình ảnh đính kèm:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                  {existingFeedback.imageUrls.map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      style={styles.existingFeedbackImage}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Owner response section */}
          {ownerResponse ? (
            <View style={styles.ownerResponseContainer}>
              <Text style={styles.ownerResponseTitle}>Phản hồi từ chủ không gian</Text>
              <View style={styles.ownerResponseCard}>
                <Text style={styles.ownerResponseDate}>
                  {formatDate(ownerResponse.createdAt)}
                </Text>
                <View style={styles.separator} />
                <Text style={styles.ownerResponseDescription}>
                  {ownerResponse.description}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.waitingForResponseContainer}>
              <View style={styles.waitingForResponseContent}>
                <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
                <Text style={styles.waitingForResponseText}>
                  Phản hồi của bạn đang được xem xét. Chúng tôi sẽ trả lời trong vòng 24 giờ.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#835101" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phản hồi & Liên hệ</Text>
        <View style={styles.placeholder} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : existingFeedback ? (
        renderExistingFeedback()
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.workspaceInfoCard}>
            <Text style={styles.workspaceTitle}>{workspaceName}</Text>
            <Text style={styles.bookingId}>Mã đặt chỗ: #{bookingId}</Text>
          </View>
          
          <View style={styles.feedbackForm}>
            <Text style={styles.sectionTitle}>Gửi phản hồi của bạn</Text>
            <Text style={styles.sectionDescription}>
              Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện dịch vụ
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tiêu đề</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Nhập tiêu đề phản hồi..."
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nội dung phản hồi</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Mô tả chi tiết trải nghiệm của bạn..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.imageLabelContainer}>
                <Text style={styles.inputLabel}>Hình ảnh đính kèm</Text>
                <Text style={styles.imageLimit}>Tối đa 8 ảnh</Text>
              </View>
              
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#835101" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {images.length < 8 && (
                  <TouchableOpacity style={styles.uploadImageButton} onPress={pickImages}>
                    <Ionicons name="add" size={40} color="#CCCCCC" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={24} color="#835101" />
              <Text style={styles.noteText}>
                Phản hồi của bạn sẽ được xem xét và phản hồi trong thời gian sớm nhất. 
                Vui lòng cung cấp thông tin chi tiết để chúng tôi có thể hỗ trợ bạn tốt hơn.
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Gửi phản hồi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  placeholder: {
    width: 40,
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
    color: "#666666",
  },
  workspaceInfoCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 10,
  },
  workspaceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  bookingId: {
    fontSize: 14,
    color: "#666666",
  },
  feedbackForm: {
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  descriptionInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
  },
  imageLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  imageLimit: {
    fontSize: 14,
    color: "#666666",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    margin: 5,
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  removeImageButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  uploadImageButton: {
    width: 90,
    height: 90,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    color: "#835101",
    flex: 1,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#835101",
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  // Existing feedback styles
  existingFeedbackContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F2F2F7",
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  feedbackInfoText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 15,
  },
  feedbackDetailsCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  feedbackDetailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  feedbackDetailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginRight: 5,
  },
  feedbackDetailValue: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  feedbackContent: {
    marginBottom: 10,
  },
  feedbackDescription: {
    fontSize: 14,
    color: "#333333",
    marginTop: 5,
  },
  feedbackImages: {
    marginVertical: 10,
  },
  imageScrollView: {
    marginTop: 10,
  },
  existingFeedbackImage: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 5,
  },
  ownerResponseContainer: {
    marginTop: 5,
  },
  ownerResponseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  ownerResponseCard: {
    backgroundColor: "#E6F7ED",
    borderRadius: 8,
    padding: 15,
  },
  ownerResponseDate: {
    fontSize: 14,
    color: "#666666",
    textAlign: "right",
  },
  ownerResponseDescription: {
    fontSize: 14,
    color: "#333333",
  },
  waitingForResponseContainer: {
    marginTop: 15,
  },
  waitingForResponseContent: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  waitingForResponseText: {
    fontSize: 14,
    color: "#835101",
    flex: 1,
    marginLeft: 10,
  },
});

export default FeedbackScreen;