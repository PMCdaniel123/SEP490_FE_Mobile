import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  RefreshControl,
  Dimensions,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/FontAwesome6";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const spaceList = [
  { id: "5", name: "5 km" },
  { id: "10", name: "10 km" },
  { id: "15", name: "15 km" },
  { id: "20", name: "20 km" },
  { id: "", name: "Trên 20 km" },
];

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with padding 16 on each side and 16 spacing between columns

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const NearbyWorkspace = () => {
  const [spacesNearYou, setSpacesNearYou] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewType, setViewType] = useState("grid");
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [km, setKm] = useState(spaceList[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const getLocation = async () => {
    setLoading(true);
    try {
      // Request foreground location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return null; // Return null to indicate failure
      }

      // Check if location services are enabled
      let isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings."
        );
        return null; // Return null to indicate failure
      }

      // Get the current location
      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
      });
      setLocation(locationData);
      return locationData; // Return location data
    } catch (error) {
      setErrorMsg("Error fetching location: " + error.message);
      return null; // Return null to indicate failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSpacesNearYou = async () => {
      setLoading(true);
      try {
        const locationData = await getLocation();
        if (!locationData) {
          // If location is null, stop the function
          setLoading(false);
          return;
        }
        const url =
          km.id === ""
            ? `https://workhive.info.vn:8443/workspaces/nearby?lat=${locationData.coords.latitude}&lng=${locationData.coords.longitude}`
            : `https://workhive.info.vn:8443/workspaces/nearby?lat=${locationData.coords.latitude}&lng=${locationData.coords.longitude}&radiusKm=${km.id}`;
        const response = await axios.get(url);
        const spaces = response.data.workspaces || [];
        setSpacesNearYou(spaces);
        setFilteredSpaces(spaces);
      } catch (error) {
        alert("Error fetching nearby spaces:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchSpacesNearYou();
  }, [km]);

  useEffect(() => {
    if (searchText.trim() !== "") {
      const filtered = spacesNearYou.filter(
        (space) =>
          space.name.toLowerCase().includes(searchText.toLowerCase()) ||
          space.address.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSpaces(filtered);
    } else {
      setFilteredSpaces(spacesNearYou);
    }
  }, [searchText, spacesNearYou]);

  const fetchSpacesNearYou = async () => {
    setLoading(true);
    try {
      const locationData = await getLocation();
      if (!locationData) {
        // If location is null, stop the function
        setLoading(false);
        return;
      }
      const url =
        km.id === ""
          ? `https://workhive.info.vn:8443/workspaces/nearby?lat=${locationData.coords.latitude}&lng=${locationData.coords.longitude}`
          : `https://workhive.info.vn:8443/workspaces/nearby?lat=${locationData.coords.latitude}&lng=${locationData.coords.longitude}&radius.id=${km.id}`;
      const response = await axios.get(url);
      const spaces = response.data.workspaces || [];
      setSpacesNearYou(spaces);
      setFilteredSpaces(spaces);
    } catch (error) {
      alert("Error fetching nearby spaces:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSpacesNearYou();
  };

  const toggleViewType = () => {
    setViewType(viewType === "grid" ? "list" : "grid");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Các không gian gần bạn</Text>
          <Text style={styles.headerSubtitle}>
            Khám phá những không gian làm việc gần bạn
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
    </View>
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
            <Icon2 name="map-location-dot" size={16} color="#fff" />
            <Text style={styles.listItemRatingText}>
              {Number(item.distanceKm).toFixed(2)} km
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.gridItemInfo}>
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
              ? `${formatCurrency(
                  item.prices.find((price) => price.category === "Giờ")
                    ?.price || item.prices[0].price
                )} - ${formatCurrency(
                  item.prices.find((price) => price.category === "Ngày")
                    ?.price || item.prices[0].price
                )}`
              : "Liên hệ"}
          </Text>
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
            <Icon2 name="map-location-dot" size={16} color="#fff" />
            <Text style={styles.listItemRatingText}>
              {Number(item.distanceKm).toFixed(2)} km
            </Text>
          </View>
        </View>
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
            {item.prices && item.prices.length > 1
              ? `${formatCurrency(Math.min(...item.prices.map((p) => p.price)))} - ${formatCurrency(
                  Math.max(...item.prices.map((p) => p.price))
                )}`
              : item.prices && item.prices.length === 1
                ? formatCurrency(item.prices[0].price)
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

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Các không gian gần bạn</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.navigationHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Các không gian gần bạn</Text>
        <View style={{ width: 40 }} />
      </View>

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
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#835101" />
        </TouchableOpacity>
      </View>

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

      <Modal visible={modalVisible} transparent animationType="fade">
        <BlurView intensity={60} style={styles.blurView}>
          <View style={styles.promotionContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                ×
              </Text>
            </TouchableOpacity>
            {spaceList.map((space) => (
              <TouchableOpacity
                key={space.id}
                style={{
                  width: "100%",
                  padding: 12,
                  marginVertical: 6,
                  borderRadius: 10,
                  backgroundColor: "#F5F5F5",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                  borderWidth: km.id === space.id ? 1 : 0,
                  borderColor: km.id === space.id ? "#835101" : "",
                }}
                onPress={() => {
                  setKm(space);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.promotionTitle}>{space.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  promotionContainer: {
    width: 320,
    padding: 10,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#835101",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#835101",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  header: {
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
    gap: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  // Grid styles
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
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
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
});

export default NearbyWorkspace;
