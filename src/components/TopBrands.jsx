import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import axios from "axios";

const TopBrands = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTopOwners = async () => {
      try {
        const response = await axios.get(
          "https://workhive.info.vn:8443/users/searchbyownername"
        );
        
        const formattedData =
          response.data.workspaceOwnerByOwnerNameDTOs === null ||
          response.data.workspaceOwnerByOwnerNameDTOs === undefined
            ? []
            : response.data.workspaceOwnerByOwnerNameDTOs
                .filter((item) => item.rateAverage >= 4)
                .sort(
                  (a, b) => b.numberOfBooking - a.numberOfBooking
                )
                .sort(
                  (a, b) => b.rateAverage - a.rateAverage
                )
                .slice(0, 5);
                
        setOwners(formattedData);
        setLoading(false);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
        
      } catch (error) {
        console.error("Error fetching top owners:", error);
        setLoading(false);
      }
    };

    fetchTopOwners();
  }, [fadeAnim]);

  const handleViewAll = () => {
    navigation.navigate("AllOwners");
  };

  const renderOwnerItem = ({ item, index }) => {
    // Calculate animation delay based on index
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
      ],
    };
    
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.ownerCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("OwnerDetail", { ownerId: item.workspaceOwnerId })}
        >
          {/* Background design with banner */}
          <View style={styles.cardHeader}>
            <Image
              source={require("../../assets/images/banner.png")}
              style={styles.bannerImage}
            />
            
            {/* Avatar overlay */}
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
            
            {/* Brand badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Thương hiệu</Text>
              </View>
            </View>
          </View>
          
          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.ownerName} numberOfLines={1}>
              {item.licenseName}
            </Text>
            <View style={styles.addressContainer}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.address} numberOfLines={1}>
                {item.licenseAddress}
              </Text>
            </View>
            
            {/* Stats row */}
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
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  if (owners.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có dữ liệu để hiển thị.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="crown" size={24} color="#835101" />
          <Text style={styles.title}>Các thương hiệu hàng đầu</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllButton} 
          activeOpacity={0.7} 
          onPress={handleViewAll}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={owners}
        keyExtractor={(item) => item.workspaceOwnerId.toString()}
        renderItem={renderOwnerItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    color: "#B25F00",
    fontWeight: "500",
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  ownerCard: {
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
  cardHeader: {
    position: "relative",
    height: 100,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarContainer: {
    position: "absolute",
    top: 60,
    left: 12,
    borderColor: "#835101",
    borderWidth: 2,
    borderRadius: 10,
    width: 50,
    height: 50,
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
    top: 78,
    left: 70,
  },
  badge: {
    backgroundColor: "#835101",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 12,
    paddingTop: 16,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: "center",
    marginHorizontal: 2,
    backgroundColor: "#f9f9f9",
  },
  statIconContainer: {
    marginVertical: 2,
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default TopBrands;