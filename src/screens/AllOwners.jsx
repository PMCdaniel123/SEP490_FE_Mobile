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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with padding 16 on each side and 16 spacing between columns

const AllOwners = () => {
  const navigation = useNavigation();
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewType, setViewType] = useState("list");

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    // Filter owners based on search text
    if (searchText.trim() !== "") {
      const filtered = owners.filter(
        (owner) =>
          owner.licenseName.toLowerCase().includes(searchText.toLowerCase()) ||
          owner.licenseAddress.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredOwners(filtered);
    } else {
      setFilteredOwners(owners);
    }
  }, [searchText, owners]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://workhive.info.vn:8443/users/searchbyownername"
      );
      
      const formattedData = 
        response.data.workspaceOwnerByOwnerNameDTOs === null ||
        response.data.workspaceOwnerByOwnerNameDTOs === undefined
          ? []
          : response.data.workspaceOwnerByOwnerNameDTOs
              .sort((a, b) => b.rateAverage - a.rateAverage);
      
      setOwners(formattedData);
      setFilteredOwners(formattedData);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOwners();
  };

  const toggleViewType = () => {
    setViewType(viewType === "grid" ? "list" : "grid");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.headerTitle}>Các thương hiệu hàng đầu</Text>
          <Text style={styles.headerSubtitle}>
            Khám phá những thương hiệu không gian làm việc tốt nhất
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
      onPress={() => navigation.navigate("OwnerDetail", { ownerId: item.workspaceOwnerId })}
      activeOpacity={0.7}
    >
      <View style={styles.gridImageContainer}>
        <Image
          source={require("../../assets/images/banner.png")}
          style={styles.gridItemImage}
        />
        <View style={styles.gridAvatarContainer}>
          <Image
            source={
              item.avatar 
                ? { uri: item.avatar } 
                : require("../../assets/images/owner.png")
            }
            style={styles.gridAvatar}
          />
        </View>
        <View style={styles.gridBadgeContainer}>
          <View style={styles.gridBadge}>
            <Text style={styles.gridBadgeText}>Thương hiệu</Text>
          </View>
        </View>
      </View>
      <View style={styles.gridItemInfo}>
        <Text style={styles.gridItemName} numberOfLines={1}>
          {item.licenseName}
        </Text>
        <View style={styles.gridItemLocation}>
          <Icon name="location-on" size={12} color="#666" />
          <Text style={styles.gridLocationText} numberOfLines={1}>
            {item.licenseAddress}
          </Text>
        </View>
        <View style={styles.gridStatsRow}>
          <View style={styles.gridStat}>
            <Icon name="star" size={14} color="#835101" />
            <Text style={styles.gridStatText}>{item.rateAverage.toFixed(1)}</Text>
          </View>
          <View style={styles.gridStat}>
            <Icon name="business" size={14} color="#835101" />
            <Text style={styles.gridStatText}>{item.numberOfWorkspace}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ownerCard}
      onPress={() => navigation.navigate("OwnerDetail", { ownerId: item.workspaceOwnerId })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Image
          source={require("../../assets/images/banner.png")}
          style={styles.bannerImage}
        />
        
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.avatar 
                ? { uri: item.avatar } 
                : require("../../assets/images/owner.png")
            }
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Thương hiệu</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.ownerName} numberOfLines={1}>
          {item.licenseName}
        </Text>
        <View style={styles.addressContainer}>
          <Icon name="location-on" size={14} color="#666" />
          <Text style={styles.address} numberOfLines={2}>
            {item.licenseAddress}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{item.rateAverage.toFixed(1)}</Text>
            <View style={styles.statIconContainer}>
              <Icon name="star" size={16} color="#835101" />
            </View>
            <Text style={styles.statLabel}>sao</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{item.numberOfBooking}</Text>
            <View style={styles.statIconContainer}>
              <Icon name="event-available" size={16} color="#835101" />
            </View>
            <Text style={styles.statLabel}>lượt đặt</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{item.numberOfWorkspace}</Text>
            <View style={styles.statIconContainer}>
              <Icon name="business" size={16} color="#835101" />
            </View>
            <Text style={styles.statLabel}>không gian</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="business" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Không tìm thấy thương hiệu nào</Text>
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
          <Text style={styles.navTitle}>Các thương hiệu hàng đầu</Text>
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
        <Text style={styles.navTitle}>Các thương hiệu hàng đầu</Text>
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
            placeholder="Tìm kiếm thương hiệu..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        key={viewType}
        data={filteredOwners}
        renderItem={viewType === "grid" ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.workspaceOwnerId.toString()}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  header: {
    paddingBottom: 16,
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
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255, 255, 255, 0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
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
    height: 100,
    position: "relative",
  },
  gridItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gridAvatarContainer: {
    position: "absolute",
    bottom: -20,
    left: 10,
    borderColor: "#835101",
    borderWidth: 2,
    borderRadius: 8,
    width: 40,
    height: 40,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  gridAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gridBadgeContainer: {
    position: "absolute",
    bottom: 0,
    right: 8,
    transform: [{ translateY: 10 }],
  },
  gridBadge: {
    backgroundColor: "#835101",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  gridItemInfo: {
    padding: 12,
    paddingTop: 26,
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
  gridStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridStat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  gridStatText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  // List styles
  ownerCard: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    position: "relative",
    height: 120,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarContainer: {
    position: "absolute",
    top: 70,
    left: 16,
    borderColor: "#835101",
    borderWidth: 2,
    borderRadius: 12,
    width: 60,
    height: 60,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badgeContainer: {
    position: "absolute",
    top: 95,
    left: 85,
  },
  badge: {
    backgroundColor: "#835101",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 30,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    flex: 1,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#f9f9f9",
  },
  statIconContainer: {
    marginVertical: 4,
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default AllOwners;