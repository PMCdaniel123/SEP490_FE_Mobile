import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import ImageViewer from "react-native-image-zoom-viewer";
import FilterModal from "../components/review/FilterModal";
import ReviewItem from "../components/review/ReviewItem";
import EditReviewModal from "../components/review/EditReviewModal";

const YourReviewScreen = () => {
  const { userData, userToken } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentReview, setCurrentReview] = useState(null);
  const [updatedRate, setUpdatedRate] = useState(0);
  const [updatedComment, setUpdatedComment] = useState("");
  const [updatedImages, setUpdatedImages] = useState([]);
  const [filters, setFilters] = useState({
    rating: 0,
    timeRange: "all",
    sortBy: "newest",
  });
  const [tempFilters, setTempFilters] = useState({
    rating: 0,
    timeRange: "all",
    sortBy: "newest",
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserReviews();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, fetchUserReviews]);

  useEffect(() => {
    if (reviews.length > 0) {
      applyFilters();
    }
  }, [reviews, filters, applyFilters]);

  const fetchUserReviews = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/users/rating/getallratingbyuserid/${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data && response.data.ratingByUserIdDTOs) {
        setReviews(response.data.ratingByUserIdDTOs);
      } else {
        Alert.alert("Thông báo", "Không có đánh giá nào được tìm thấy.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải đánh giá. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [userData.sub, userToken]);

  const handleDeleteReview = async (ratingId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa đánh giá này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await axios.delete(
              "https://workhive.info.vn:8443/users/deleterating",
              {
                headers: {
                  accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userToken}`,
                },
                data: {
                  userId: userData.sub,
                  ratingId: ratingId,
                },
              }
            );

            if (response.status === 200) {
              Alert.alert("Thành công", "Đánh giá đã được xóa.");
              fetchUserReviews();
            }
          } catch (error) {
            Alert.alert(
              "Lỗi",
              "Không thể xóa đánh giá. Vui lòng thử lại sau.",
              [{ text: "OK" }]
            );
          }
        },
      },
    ]);
  };

  const handleSaveReview = async () => {
    try {
      const requestData = {
        userId: userData.sub,
        ratingId: currentReview.ratingId,
        rate: updatedRate,
        comment: updatedComment,
        images: updatedImages.map((img) => ({
          url: img.url,
        })),
      };

      const response = await axios.patch(
        "https://workhive.info.vn:8443/users/updaterating",
        requestData,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Thành công", "Đánh giá đã được cập nhật.");
        setEditModalVisible(false);
        fetchUserReviews();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật đánh giá. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    }
  };

  const applyFilters = useCallback(() => {
    let result = [...reviews];

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter((review) => review.rate === filters.rating);
    }

    // Apply time range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filters.timeRange !== "all") {
      switch (filters.timeRange) {
        case "today":
          result = result.filter((review) => {
            const reviewDate = new Date(review.created_At);
            const reviewDay = new Date(
              reviewDate.getFullYear(),
              reviewDate.getMonth(),
              reviewDate.getDate()
            );
            return reviewDay.getTime() === today.getTime();
          });
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          result = result.filter((review) => {
            const reviewDate = new Date(review.created_At);
            return reviewDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          result = result.filter((review) => {
            const reviewDate = new Date(review.created_At);
            return reviewDate >= monthAgo;
          });
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.created_At) - new Date(a.created_At);
        case "oldest":
          return new Date(a.created_At) - new Date(b.created_At);
        case "rating":
          return b.rate - a.rate;
        default:
          return new Date(b.created_At) - new Date(a.created_At);
      }
    });

    setFilteredReviews(result);
  }, [reviews, filters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserReviews().finally(() => setRefreshing(false));
  }, [fetchUserReviews]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      rating: 0,
      timeRange: "all",
      sortBy: "newest",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setFilterModalVisible(false);
  };

  const openEditModal = (review) => {
    setCurrentReview(review);
    setUpdatedRate(review.rate);
    setUpdatedComment(review.comment);
    setUpdatedImages(review.images);
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đánh giá của bạn</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#835101" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          renderItem={({ item }) => (
            <ReviewItem
              item={item}
              onEdit={openEditModal}
              onDelete={handleDeleteReview}
              onImagePress={(url) => {
                setSelectedImage(url);
                setImageViewerVisible(true);
              }}
              fadeAnim={fadeAnim}
            />
          )}
          keyExtractor={(item) => item.ratingId.toString()}
          contentContainerStyle={styles.reviewList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <EditReviewModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        review={currentReview}
        updatedRate={updatedRate}
        updatedComment={updatedComment}
        updatedImages={updatedImages}
        onRateChange={setUpdatedRate}
        onCommentChange={setUpdatedComment}
        onImagesChange={setUpdatedImages}
        onSave={handleSaveReview}
      />

      <Modal
        visible={imageViewerVisible}
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={[{ url: selectedImage }]}
          enableSwipeDown
          onSwipeDown={() => setImageViewerVisible(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewList: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default YourReviewScreen;
