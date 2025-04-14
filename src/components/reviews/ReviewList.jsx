import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReviewItem from "./ReviewItem";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

function ReviewList({ workspaceId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topReviews, setTopReviews] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `https://workhive.info.vn:8443/users/rating/getallratingbyworkspaceid/${workspaceId}`
        );
        const formattedReviews =
          response.data.ratingByWorkspaceIdDTOs?.sort(
            (a, b) => b.rate - a.rate
          ) || [];
        setReviews(formattedReviews);
        const highRatingReviews = formattedReviews.filter(
          (review) => review.rate >= 4
        );
        setTopReviews(
          highRatingReviews.length > 0
            ? highRatingReviews.slice(0, 2)
            : formattedReviews.slice(0, 2)
        );
      } catch (error) {
        alert("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [workspaceId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((total, review) => total + review.rate, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <View style={[styles.container]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            {averageRating}
          </Text>
          <FontAwesome name="star" size={20} color="#FFD700" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          Đánh giá không gian
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "300" }}>
          ({reviews.length})
        </Text>
      </View>
      {topReviews.map((review) => (
        <ReviewItem key={review.ratingId} {...review} />
      ))}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("AllReview", { reviews, workspaceId })
        }
      >
        <Text style={styles.buttonText}>Xem tất cả</Text>
        <FontAwesome name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#835101",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});

export default ReviewList;
