import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const recommendedSpaces = [
  {
    id: 1,
    name: "Bàn cơ bản",
    address:
      "Tầng 5, 195 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh",
    googleMapUrl: "https://www.google.com/maps/place/WORKSPACE/",
    description: "A basic workspace for individuals.",
    capacity: 4,
    category: "Bàn đơn",
    status: "Active",
    cleanTime: 15,
    area: 20,
    ownerId: 101,
    openTime: "08:00:00",
    closeTime: "20:00:00",
    is24h: 0,
    prices: [
      {
        id: 1,
        price: 35000,
        category: "Giờ",
      },
      {
        id: 2,
        price: 200000,
        category: "Ngày",
      },
    ],
    images: [
      {
        id: 1,
        imgUrl:
          "https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894818/IMAGES/djgfdgh9elztkr0svfwi.jpg",
      },
      {
        id: 2,
        imgUrl:
          "https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894872/IMAGES/workspace2.jpg",
      },
    ],
    facilities: [
      {
        id: 1,
        facilityName: "Wifi tốc độ cao",
      },
      {
        id: 2,
        facilityName: "Máy lạnh",
      },
    ],
    policies: [
      {
        id: 1,
        policyName: "Không hút thuốc",
      },
      {
        id: 2,
        policyName: "Không mang thức ăn từ bên ngoài vào",
      },
    ],
  },
  {
    id: 2,
    name: "Phòng họp hiện đại",
    address:
      "Tầng 3, 123 Nguyễn Văn Trỗi, Phường 12, Quận Phú Nhuận, TP. Hồ Chí Minh",
    googleMapUrl: "https://www.google.com/maps/place/MEETINGROOM/",
    description: "A modern meeting room with full amenities.",
    capacity: 10,
    category: "Phòng họp",
    status: "Active",
    cleanTime: 20,
    area: 30,
    ownerId: 102,
    openTime: "09:00:00",
    closeTime: "18:00:00",
    is24h: 0,
    prices: [
      {
        id: 1,
        price: 50000,
        category: "Giờ",
      },
      {
        id: 2,
        price: 300000,
        category: "Ngày",
      },
    ],
    images: [
      {
        id: 1,
        imgUrl:
          "https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894920/IMAGES/ul4gto2ywr0vwpbgamhy.jpg",
      },
      {
        id: 2,
        imgUrl:
          "https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894960/IMAGES/meetingroom2.jpg",
      },
    ],
    facilities: [
      {
        id: 1,
        facilityName: "Máy chiếu",
      },
      {
        id: 2,
        facilityName: "Bảng trắng",
      },
      {
        id: 3,
        facilityName: "Wifi tốc độ cao",
      },
    ],
    policies: [
      {
        id: 1,
        policyName: "Không hút thuốc",
      },
      {
        id: 2,
        policyName: "Không gây ồn ào",
      },
    ],
  },
];

const Recommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const navigation = useNavigation();
  // Filter spaces based on the selected category
  const filteredSpaces =
    selectedCategory === "Tất cả"
      ? recommendedSpaces
      : recommendedSpaces.filter(
          (space) => space.category === selectedCategory
        );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Đề xuất dành cho bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "Tất cả" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("Tất cả")}
        >
          <Text
            style={
              selectedCategory === "Tất cả"
                ? styles.activeFilterText
                : styles.filterText
            }
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "Bàn đơn" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("Bàn đơn")}
        >
          <Text
            style={
              selectedCategory === "Bàn đơn"
                ? styles.activeFilterText
                : styles.filterText
            }
          >
            Bàn đơn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "Phòng họp" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("Phòng họp")}
        >
          <Text
            style={
              selectedCategory === "Phòng họp"
                ? styles.activeFilterText
                : styles.filterText
            }
          >
            Phòng họp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Spaces List */}
      {filteredSpaces.map((space) => (
        <TouchableOpacity
          key={space.id}
          style={styles.listItemCard}
          onPress={() => navigation.navigate("WorkspaceDetail", { workspace: space })}
        >
          <Image source={{ uri: space.images[0]?.imgUrl }} style={styles.listItemImage} />
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemName}>{space.name}</Text>
            <View style={styles.listItemLocation}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.listItemLocationText} numberOfLines={2}>
                {space.address}
              </Text>
            </View>
            <View style={styles.listItemFooter}>
              <Text style={styles.listItemPrice}>
                {space.prices.length > 1
                  ? `${space.prices[0].price}đ - ${space.prices[1].price}đ`
                  : `${space.prices[0]?.price}đ`}
              </Text>
              <View style={styles.listItemRating}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.listItemRatingText}>{space.rating || 4.0}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  },
  seeAllText: {
    color: "#B25F00",
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  activeFilterButton: {
    backgroundColor: "#B25F00",
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
});

export default Recommendations;
