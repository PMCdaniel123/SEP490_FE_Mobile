import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const HighRatedSpaces = () => {
  const [highRatedSpaces, setHighRatedSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchHighRatedSpaces = async () => {
      try {
        const response = await axios.get(
          "https://workhive.info.vn:8443/users/searchbyrate"
        );
        setHighRatedSpaces(response.data.workspaces || []);
      } catch (error) {
        alert("Error fetching high-rated spaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighRatedSpaces();
  }, []);

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })} // Pass workspace ID
    >
      <Image
        source={{ uri: item.images[0]?.imgUrl }}
        style={styles.spaceImage}
      />
      <TouchableOpacity style={styles.favoriteButton}>
        <Icon name="favorite-border" size={20} color="#FF5A5F" />
      </TouchableOpacity>
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.spaceLocation} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.priceRatingContainer}>
          <Text style={styles.spacePrice}>
            {item.prices.length > 1
              ? `${formatCurrency(Math.min(...item.prices.map((p) => p.price)))} - ${formatCurrency(
                  Math.max(...item.prices.map((p) => p.price))
                )}`
              : `${formatCurrency(
                  item.prices.find((price) => price.category === "Giờ")?.price
                )}`}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Không gian được đánh giá cao</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={highRatedSpaces}
        renderItem={renderSpaceItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#B25F00",
    fontWeight: "500",
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  spaceCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  spaceImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 6,
  },
  spaceInfo: {
    padding: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  spaceLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spacePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B25F00",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HighRatedSpaces;