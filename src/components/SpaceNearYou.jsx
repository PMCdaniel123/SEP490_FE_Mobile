import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Location from "expo-location";

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
  const [location, setLocation] = useState(null);

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
        const url = `https://workhive.info.vn:8443/workspaces/nearby?lat=${locationData.coords.latitude}&lng=${locationData.coords.longitude}`;
        const response = await axios.get(url);
        setSpacesNearYou(response.data.workspaces || []);
      } catch (error) {
        alert("Error fetching nearby spaces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpacesNearYou();
  }, []);

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.listItemCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })}
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
              : `${formatCurrency(
                  item.prices.find((price) => price.category === "Giờ")?.price
                )}`}
          </Text>
          <View style={styles.listItemRating}>
            <Icon2 name="map-location-dot" size={16} color="#835101" />
            <Text style={styles.listItemRatingText}>
              {Number(item.distanceKm).toFixed(2)} km
            </Text>
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
        <Text style={styles.sectionTitle}>Không gian gần bạn</Text>
        <TouchableOpacity onPress={() => navigation.navigate("NearbyWorkspace")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={spacesNearYou.slice(0, 4)}
        renderItem={renderSpaceItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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
