import React, { useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import ReviewItem from "../components/reviews/ReviewItem";
import { useNavigation } from "@react-navigation/native";

function AllReview({ route }) {
  const { reviews, workspaceId } = route.params;
  const [filter, setFilter] = useState(null);
  const [showImagesOnly, setShowImagesOnly] = useState(false);
  const navigation = useNavigation();

  const filteredReviews = reviews.filter((review) => {
    if (showImagesOnly && (!review.images || review.images.length === 0)) {
      return false;
    }
    return filter ? review.rate === filter : true;
  });

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rate: rating,
    count: reviews.filter((review) => review.rate === rating).length,
  }));
  const imageReviewsCount = reviews.filter(
    (review) => review.images && review.images.length > 0
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ backgroundColor: "#835101", padding: 8, borderRadius: 50 }}
          onPress={() =>
            navigation.navigate("WorkspaceDetail", { id: workspaceId })
          }
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Tất cả đánh giá</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === null && !showImagesOnly && styles.activeFilter,
          ]}
          onPress={() => {
            setFilter(null);
            setShowImagesOnly(false);
          }}
        >
          <Text
            style={[
              styles.filterText,
              filter === null && !showImagesOnly && styles.activeText,
            ]}
          >
            Tất cả ({reviews.length})
          </Text>
        </TouchableOpacity>
        {ratingCounts.map(({ rate, count }) => (
          <TouchableOpacity
            key={rate}
            style={[
              styles.filterButton,
              filter === rate && styles.activeFilter,
            ]}
            onPress={() => setFilter(filter === rate ? null : rate)}
          >
            <Text
              style={[styles.filterText, filter === rate && styles.activeText]}
            >
              {rate} Sao ({count})
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterButton, showImagesOnly && styles.activeFilter]}
          onPress={() => setShowImagesOnly(!showImagesOnly)}
        >
          <FontAwesome
            name="image"
            size={16}
            color={showImagesOnly ? "#fff" : "#000"}
          />
          <Text
            style={[styles.filterText, showImagesOnly && styles.activeText]}
          >
            {" "}
            Có Hình Ảnh ({imageReviewsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredReviews.length === 0 ? (
        <Text style={styles.noReviewText}>Không tìm thấy đánh giá.</Text>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.ratingId.toString()}
          renderItem={({ item }) => <ReviewItem {...item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 30,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  activeFilter: {
    backgroundColor: "#835101",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  activeText: {
    color: "#fff",
  },
  noReviewText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default AllReview;
