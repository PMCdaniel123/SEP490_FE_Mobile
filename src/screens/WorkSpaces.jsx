import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with padding 16 on each side and 16 spacing between columns

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const WorkSpaces = ({ navigation }) => {
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [categories, setCategories] = useState(["Tất cả"]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://35.78.210.59:8080/workspaces");
      const data = response.data.workspaces || [];
      setSpaces(data);
      setFilteredSpaces(data);

      const uniqueCategories = [
        "Tất cả",
        ...new Set(data.map((space) => space.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      alert("Error fetching spaces:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    // Filter spaces based on search text and selected category
    let filtered = spaces;

    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter(
        (space) => space.category === selectedCategory
      );
    }

    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (space) =>
          space.name.toLowerCase().includes(searchText.toLowerCase()) ||
          space.address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredSpaces(filtered);
  }, [searchText, selectedCategory, spaces]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSpaces();
  };

  const toggleViewType = () => {
    setViewType(viewType === "grid" ? "list" : "grid");
  };
  const renderCategoryItem = ({ item }) => (
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
  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.gridImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0]?.imgUrl }}
            style={styles.gridItemImage}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Icon name="image-not-supported" size={24} color="#ccc" />
          </View>
        )}
        <View style={styles.badgeContainer}>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating || 4.0}</Text>
          </View>
        </View>
      </View>
      <View style={styles.gridItemInfo}>
        <Text style={styles.gridItemLicense} numberOfLines={1}>
          {item.licenseName || "Chưa có giấy phép"}
        </Text>
        <Text style={styles.gridItemName} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.gridItemLocation}>
          <Icon name="location-on" size={12} color="#666" />
          <Text style={styles.gridLocationText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <View style={styles.gridItemFooter}>
          <Text style={styles.gridItemPrice}>
            {item.prices && item.prices.length > 0
              ? formatCurrency(item.prices[0].price)
              : "Liên hệ"}
          </Text>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Icon name="bookmark-border" size={16} color="#835101" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItemCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0]?.imgUrl }}
            style={styles.listItemImage}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Icon name="image-not-supported" size={30} color="#ccc" />
          </View>
        )}
        <View style={styles.badgeContainer}>
          <View style={styles.listItemRating}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.listItemRatingText}>{item.rating || 4.0}</Text>
          </View>
        </View>
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemLicense} numberOfLines={1}>
          {item.licenseName || "Chưa có giấy phép"}
        </Text>
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
            {item.prices && item.prices.length > 1
              ? `${formatCurrency(item.prices[0].price)} - ${formatCurrency(
                  item.prices[1].price
                )}`
              : item.prices && item.prices.length === 1
                ? formatCurrency(item.prices[0]?.price)
                : "Liên hệ"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={60} color="#ccc" />
      <Text style={styles.emptyText}>
        Không tìm thấy không gian làm việc nào
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View>
          <Text style={styles.headerTitle}>Không gian làm việc</Text>
          <Text style={styles.headerSubtitle}>
            Tìm không gian làm việc phù hợp với bạn
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleViewType}
          style={styles.viewTypeButton}
        >
          <Icon
            name={viewType === "grid" ? "view-list" : "grid-view"}
            size={24}
            color="#835101"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm không gian làm việc..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" size={24} color="#835101" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
        </View>
      ) : (
        <FlatList
          key={viewType}
          data={filteredSpaces}
          renderItem={viewType === "grid" ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={viewType === "grid" ? 2 : 1}
          columnWrapperStyle={viewType === "grid" ? styles.gridRow : null}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#835101"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingBottom: 16,
  },
  gridItemLicense: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  listItemLicense: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  viewTypeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  filterButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  // Styles list
  listItemCard: {
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
    width: "100%",
    height: 160,
    position: "relative",
  },
  listItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  listItemInfo: {
    padding: 16,
  },
  listItemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  listItemLocation: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  listItemLocationText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginLeft: 4,
    lineHeight: 20,
  },
  listItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  listItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#835101",
  },
  listItemRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listItemRatingText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#fff",
    fontSize: 12,
  },
  // Styles grid
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    width: COLUMN_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImageContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  gridItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gridItemInfo: {
    padding: 12,
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  gridItemLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gridLocationText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    marginLeft: 2,
  },
  gridItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#835101",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    marginLeft: 3,
    fontWeight: "bold",
    color: "#fff",
    fontSize: 10,
  },
  // Styles chung
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  bookmarkButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  filterContainer: {
    paddingTop: 30,
    paddingVertical: 8,
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
});

export default WorkSpaces;
