import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
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

const Recommendations = () => {
  const [recommendedSpaces, setRecommendedSpaces] = useState([]);
  const [categories, setCategories] = useState(["Tất cả"]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const navigation = useNavigation();

  const fetchRecommendedSpaces = async () => {
    try {
      const response = await axios.get(
        "https://workhive.info.vn:8443/workspaces"
      );
      const workspaces = response.data.workspaces || [];
      setRecommendedSpaces(workspaces);

      const uniqueCategories = [
        "Tất cả",
        ...new Set(workspaces.map((space) => space.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      alert("Error fetching recommended spaces:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendedSpaces();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecommendedSpaces();
  };

  const filteredSpaces =
    selectedCategory === "Tất cả"
      ? recommendedSpaces
      : recommendedSpaces.filter(
          (space) => space.category === selectedCategory
        );

  const limitedSpaces = filteredSpaces.slice(0, 4);

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedCategory === item && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={
          selectedCategory === item
            ? styles.activeFilterText
            : styles.filterText
        }
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItemCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })} // Pass workspace ID
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0]?.imgUrl }}
          style={styles.listItemImage}
        />
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.listItemLocation}>
          <Icon name="location-on" size={14} color="#666" />
          <Text style={styles.listItemLocationText} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        <View style={styles.listItemFooter}>
          <Text style={styles.listItemPrice}>
            {item.prices.length > 1
              ? `${formatCurrency(
                  item.prices.find((price) => price.category === "Giờ")?.price
                )} - ${formatCurrency(
                  item.prices.find((price) => price.category === "Ngày")?.price
                )}`
              : formatCurrency(
                  item.prices.find((price) => price.category === "Giờ")?.price
                )}
          </Text>
          <View style={styles.listItemRating}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.listItemRatingText}>{item.rating || 4.0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tất cả các không gian</Text>
        <TouchableOpacity onPress={() => navigation.navigate("WorkSpaces")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        renderItem={renderFilterItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      />

      {limitedSpaces.length > 0 ? (
        <FlatList
          data={limitedSpaces}
          renderItem={renderSpaceItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#835101"]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      )}
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  activeFilterButton: {
    backgroundColor: "#835101",
  },
  filterText: {
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "500",
  },
  listItemCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: 110,
    height: 120,
  },
  listItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  listItemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  listItemLocation: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  listItemLocationText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    marginLeft: 4,
  },
  listItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#835101",
  },
  listItemRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listItemRatingText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#333",
  },
  emptyContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Recommendations;
