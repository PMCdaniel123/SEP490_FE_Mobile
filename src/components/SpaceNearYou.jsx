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

const SpaceNearYou = () => {
  const navigation = useNavigation();
  const [spacesNearYou, setSpacesNearYou] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSpacesNearYou = async () => {
    try {
      // Simulating API call - replace with actual API endpoint when available
      const response = await axios.get(
        "https://workhive.info.vn:8443/workspaces"
      );
      setSpacesNearYou(response.data.workspaces || []);
    } catch (error) {
      alert("Error fetching nearby spaces:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpacesNearYou();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSpacesNearYou();
  };

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.listItemCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })}
    >
      <Image
        source={{ uri: item.images[0]?.imgUrl }}
        style={styles.listItemImage}
      />
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName}>{item.name}</Text>
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
              : `${formatCurrency(
                  item.prices.find((price) => price.category === "Giờ")?.price
                )}`}
          </Text>
          <View style={styles.listItemRating}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.listItemRatingText}>{item.rate}</Text>
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
        <Text style={styles.sectionTitle}>Không gian gần bạn</Text>
        <TouchableOpacity onPress={() => navigation.navigate("WorkSpaces")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={spacesNearYou.slice(0, 5)}
        renderItem={renderSpaceItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#835101"]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 100,
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
  },
  seeAllText: {
    color: "#B25F00",
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
  listItemImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  listItemInfo: {
    flex: 1,
    padding: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
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
  },
  listItemRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemRatingText: {
    marginLeft: 4,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SpaceNearYou;
