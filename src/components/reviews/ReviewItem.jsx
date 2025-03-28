import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const ReviewItem = ({
  rate,
  comment,
  created_At,
  user_Name,
  user_Avatar,
  images,
}) => {
  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Image source={{ uri: user_Avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user_Name}</Text>
          <Text style={styles.date}>
            {new Date(created_At).toLocaleTimeString() +
              " " +
              new Date(created_At).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <FontAwesome
            key={i}
            name={i < rate ? "star" : "star-o"}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
      <Text style={styles.comment}>{comment}</Text>
      {images && images.length > 0 && (
        <View style={styles.imageContainer}>
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.url }}
              style={styles.reviewImage}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 5,
  },
});

export default ReviewItem;
