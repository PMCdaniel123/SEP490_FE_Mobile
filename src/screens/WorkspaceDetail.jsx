/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Animated,
  Linking,
  Platform,
} from "react-native";
import axios from "axios";
import ImageList from "../components/ImageList";
import { Card, Surface } from "react-native-paper";
import {
  MaterialIcons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AmenityList from "../components/amenities/AmenityList";
import { formatCurrency } from "../constants";
import BeverageList from "../components/beverages/BeverageList";
import { useCart } from "../contexts/CartContext";
import BookingDetail from "../components/booking/BookingDetail";
import ReviewList from "../components/reviews/ReviewList";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";

const WorkspaceDetail = ({ route }) => {
  const { id } = route.params;
  const [workspaceDetail, setWorkspaceDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const navigation = useNavigation();
  const { state, dispatch } = useCart();
  const { amenityList, beverageList } = state;
  const [numberItems, setNumberItems] = useState(0);

  const [scrollY] = useState(new Animated.Value(0));

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  useEffect(() => {
    dispatch({ type: "CLEAR_CART" });
    const fetchWorkspaceDetails = async () => {
      try {
        const response = await axios.get(
          `https://workhive.info.vn:8443/workspaces/${id}`
        );
        const workspaceData = response.data.getWorkSpaceByIdResult;
        setWorkspaceDetail(workspaceData);

        if (workspaceData.googleMapUrl) {
          const coordsMatch = workspaceData.googleMapUrl.match(
            /@(-?\d+\.\d+),(-?\d+\.\d+)/
          );
          if (coordsMatch && coordsMatch.length >= 3) {
            const latitude = parseFloat(coordsMatch[1]);
            const longitude = parseFloat(coordsMatch[2]);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              });
            }
          }
        }

        dispatch({
          type: "SET_WORKSPACE_ID",
          payload: {
            workspaceId: id + "",
            price: workspaceData.prices.find(
              (price) => price.category === "Ngày"
            )?.price,
            priceType: "2",
          },
        });
        dispatch({ type: "CALCULATE_TOTAL" });
      } catch (error) {
        alert("Error fetching workspace details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [id, dispatch]);

  useEffect(() => {
    setNumberItems(amenityList.length + beverageList.length);
  }, [amenityList, beverageList]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Không thể tải thông tin không gian làm việc
        </Text>
      </View>
    );
  }

  const handleBackPress = () => {
    navigation.goBack();
  };

  const goToHome = () => {
    const state = navigation.getState();
    
    // Find which tab/stack we're currently in
    const currentRoute = state.routes[0];
    const currentRouteName = currentRoute.name;
    
    // If we're in BookingStack, reset it before navigating away
    if (currentRouteName === "Đặt chỗ") {
      // Reset the BookingStack to its initial route
      navigation.reset({
        index: 0,
        routes: [{ name: 'YourBooking' }],
      });
    }
    
    // Navigate to home tab
    navigation.navigate("Trang chủ", { screen: "HomeMain" });
  };

  const openGoogleMaps = (url) => {
    if (!url) {
      alert("Không có thông tin bản đồ cho không gian này");
      return;
    }

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert("Không thể mở Google Maps");
      }
    });
  };

  const getFacilityIcon = (facilityName) => {
    const name = facilityName.toLowerCase();

    if (name.includes("máy lạnh") || name.includes("điều hòa")) {
      return <MaterialIcons name="ac-unit" size={24} color="#835101" />;
    } else if (name.includes("wifi") || name.includes("internet")) {
      return <MaterialIcons name="wifi" size={24} color="#835101" />;
    } else if (name.includes("tv") || name.includes("tivi")) {
      return <MaterialIcons name="tv" size={24} color="#835101" />;
    } else if (name.includes("bảo vệ") || name.includes("an ninh")) {
      return <MaterialIcons name="security" size={24} color="#835101" />;
    } else if (name.includes("đỗ xe") || name.includes("parking")) {
      return <MaterialIcons name="local-parking" size={24} color="#835101" />;
    } else if (name.includes("phòng tắm") || name.includes("toilet")) {
      return <MaterialIcons name="bathroom" size={24} color="#835101" />;
    } else if (name.includes("nước") || name.includes("đồ uống")) {
      return <MaterialIcons name="local-drink" size={24} color="#835101" />;
    } else if (name.includes("máy in") || name.includes("printer")) {
      return <MaterialIcons name="print" size={24} color="#835101" />;
    } else {
      return (
        <MaterialCommunityIcons
          name="office-building"
          size={24}
          color="#835101"
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Animated.ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ transform: [{ scale: headerHeight }] }}>
          <ImageList
            images={workspaceDetail?.images}
            workspaceId={id}
            onBackPress={handleBackPress}
            onHomePress={goToHome}
          />
        </Animated.View>

        <Surface style={styles.contentContainer} elevation={2}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá từ</Text>
            <Text style={styles.price}>
              {formatCurrency(
                workspaceDetail?.prices.find(
                  (price) => price.category === "Giờ"
                )?.price
              )}
            </Text>
            <Text style={styles.priceUnit}>/giờ</Text>
          </View>

          <Text style={styles.name}>{workspaceDetail?.name}</Text>

          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>4.5</Text>
            <Text style={styles.ratingCount}>(128 đánh giá)</Text>
          </View>

          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color="#835101" />
            <Text style={styles.address}>{workspaceDetail?.address}</Text>
          </View>

          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => navigation.navigate("OwnerDetail", { ownerId: workspaceDetail?.ownerId })}
          >
            <Image
              source={require("../../assets/images/workspace2.jpg")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.licenseName}>
                {workspaceDetail?.licenseName}
              </Text>
              <Text style={styles.hostLabel}>Chủ không gian</Text>
            </View>
            <MaterialIcons
            name="chevron-right"
            size={24}
            color="#666"
            style={styles.chevron}
            />
          </TouchableOpacity>
        </Surface>

        <View style={styles.amenitiesSection}>
          <Text style={styles.sectionHeader}>Tiện nghi</Text>
          <View style={styles.amenitiesContainer}>
            {(showAllFacilities
              ? workspaceDetail?.facilities
              : workspaceDetail?.facilities?.slice(0, 4)
            )?.map((facility, index) => (
              <View
                key={index}
                style={[
                  styles.amenityItem,
                  showAllFacilities && styles.amenityItemExpanded,
                ]}
              >
                <View style={styles.amenityIconContainer}>
                  {getFacilityIcon(facility.facilityName)}
                </View>
                <Text
                  style={[
                    styles.amenityName,
                    showAllFacilities && styles.amenityNameExpanded,
                  ]}
                  numberOfLines={showAllFacilities ? 0 : 2}
                >
                  {facility.facilityName}
                </Text>
              </View>
            ))}
          </View>
          {workspaceDetail?.facilities &&
            workspaceDetail.facilities.length > 4 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowAllFacilities(!showAllFacilities)}
              >
                <Text style={styles.viewAllText}>
                  {showAllFacilities ? "Thu gọn" : "Xem tất cả"}
                </Text>
              </TouchableOpacity>
            )}
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapHeaderContainer}>
            <Text style={styles.sectionHeader}>Vị trí</Text>
            <TouchableOpacity
              onPress={() => openGoogleMaps(workspaceDetail?.googleMapUrl)}
            >
              <Text style={styles.viewAllText}>Hiển thị</Text>
            </TouchableOpacity>
          </View>

          {mapRegion ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude,
                  }}
                  title={workspaceDetail?.name}
                />
              </MapView>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => openGoogleMaps(workspaceDetail?.googleMapUrl)}
              >
                <MaterialIcons name="directions" size={16} color="#FFFFFF" />
                <Text style={styles.mapButtonText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noMapContainer}>
              <MaterialIcons name="location-off" size={40} color="#ccc" />
              <Text style={styles.noMapText}>Không có thông tin bản đồ</Text>
            </View>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("details")}
            style={[styles.tab, activeTab === "details" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "details" && styles.activeTabText,
              ]}
            >
              Chi Tiết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("booking")}
            style={[styles.tab, activeTab === "booking" && styles.activeTab]}
          >
            <View style={styles.tabWithBadge}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === "booking" && styles.activeTabText,
                ]}
              >
                Đặt chỗ
              </Text>
              {numberItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{numberItems}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === "details" ? (
          <Surface style={styles.detailsContainer} elevation={1}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="square-foot" size={32} color="#835101" />
                <Text style={styles.statValue}>{workspaceDetail?.area} m²</Text>
                <Text style={styles.statLabel}>Diện tích</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="people" size={32} color="#835101" />
                <Text style={styles.statValue}>
                  {workspaceDetail?.capacity}
                </Text>
                <Text style={styles.statLabel}>Sức chứa</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="business" size={32} color="#835101" />
                <Text style={styles.statValue}>
                  {workspaceDetail?.category}
                </Text>
                <Text style={styles.statLabel}>Loại</Text>
              </View>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>
                {workspaceDetail?.description}
              </Text>
            </View>

            <View style={styles.priceDetailsContainer}>
              <Text style={styles.sectionTitle}>Chi tiết giá</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceType}>Theo giờ:</Text>
                <View>
                  <Text style={styles.priceValue}>
                    {formatCurrency(
                      workspaceDetail?.prices.find(
                        (price) => price.category === "Giờ"
                      )?.price
                    )}
                  </Text>
                  <Text style={styles.priceNote}>(chưa hỗ trợ)</Text>
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceType}>Theo ngày:</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(
                    workspaceDetail?.prices.find(
                      (price) => price.category === "Ngày"
                    )?.price
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.fullSection}>
              <Text style={styles.sectionTitle}>Quy định chung</Text>
              <View style={styles.policiesContainer}>
                {workspaceDetail?.policies.map((policy, index) => (
                  <View key={index} style={styles.policyItem}>
                    <MaterialIcons name="info" size={20} color="#835101" />
                    <Text style={styles.policyText}>{policy.policyName}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.serviceList}>
              <AmenityList ownerId={workspaceDetail?.ownerId} />
            </View>

            <View style={styles.serviceList}>
              <BeverageList ownerId={workspaceDetail?.ownerId} />
            </View>

            <View style={styles.serviceList}>
              <ReviewList workspaceId={workspaceDetail?.id} />
            </View>
          </Surface>
        ) : (
          <BookingDetail
            openTime={workspaceDetail?.openTime}
            closeTime={workspaceDetail?.closeTime}
            workspaceId={id}
          />
        )}
      </Animated.ScrollView>

      {activeTab === "details" && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setActiveTab("booking")}
        >
          <Text style={styles.floatingButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 16,
    padding: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#835101",
  },
  priceUnit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
    color: "#333",
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: "#444",
    marginLeft: 4,
    flex: 1,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#835101",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  mapButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  hostLabel: {
    fontSize: 12,
    color: "#666",
  },
  // chevron: {
  //   marginLeft: "auto",
  // },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 4,
    margin: 12,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#835101",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  tabWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "#ff4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 6,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 16,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  priceDetailsContainer: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceType: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  priceNote: {
    fontSize: 12,
    color: "#ff4444",
    fontStyle: "italic",
    textAlign: "right",
  },
  serviceList: { marginTop: 16 },
  amenitiesSection: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amenityItem: {
    width: "22%",
    alignItems: "center",
    marginBottom: 16,
  },
  amenityItemExpanded: {
    width: "33.33%",
    flexDirection: "column",
    alignItems: "center",
  },
  amenityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  amenityName: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  amenityNameExpanded: {
    fontSize: 13,
  },
  viewAllButton: {
    alignItems: "center",
    padding: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: "#835101",
    fontWeight: "bold",
  },
  fullSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  policiesContainer: {
    marginLeft: 4,
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  policyText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
  },
  mapSection: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 16,
    padding: 16,
  },
  mapHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#835101",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  mapButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 8,
    fontSize: 14,
  },
  noMapContainer: {
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noMapText: {
    color: "#999",
    marginTop: 8,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#835101",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 12,
  },
});

export default WorkspaceDetail;
