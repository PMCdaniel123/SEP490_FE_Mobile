import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { formatCurrency } from "../constants";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 24; // Subtracting padding and margin

const OwnerDetail = ({ route }) => {
  const { ownerId } = route.params;
  const navigation = useNavigation();
  const [ownerData, setOwnerData] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://workhive.info.vn:8443/workspace-owners/${ownerId}`
      );
      if (response.data && response.data.owner) {
        setOwnerData(response.data.owner);
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/workspaces/owner/${ownerId}`
      );
      if (response.data && response.data.workspaces) {
        const activeWorkspaces = response.data.workspaces
          .filter(workspace => workspace.status === "Active")
          .map(workspace => ({
            ...workspace,
            shortTermPrice: workspace.prices.find(price => price.category === "Giờ")?.price || 0,
            longTermPrice: workspace.prices.find(price => price.category === "Ngày")?.price || 0,
          }));
        setWorkspaces(activeWorkspaces);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/workspace-owners/${ownerId}/promotions`
      );
      if (response.data && response.data.promotions) {
        const activePromotions = response.data.promotions.filter(
          promo => promo.status === "Active"
        );
        setPromotions(activePromotions);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchOwnerData(),
        fetchWorkspaces(),
        fetchPromotions()
      ]);
      setLoading(false);
      setRefreshing(false);
    };

    fetchAllData();
  }, [ownerId]);

  const onRefresh = () => {
    setRefreshing(true);
    const fetchAllData = async () => {
      await Promise.all([
        fetchOwnerData(),
        fetchWorkspaces(),
        fetchPromotions()
      ]);
      setRefreshing(false);
    };
    fetchAllData();
  };

  const renderWorkspaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workspaceCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })}
    >
      <Image
        source={{ uri: item.images && item.images.length > 0 ? item.images[0].imgUrl : null }}
        style={styles.workspaceImage}
        defaultSource={require('../../assets/images/workspace1.jpg')}
      />
      <View style={styles.badgeContainer}>
        <View style={styles.ratingBadge}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || 4.0}</Text>
        </View>
      </View>
      <View style={styles.workspaceInfo}>
        <Text style={styles.licenseName} numberOfLines={1}>{item.licenseName || "Chưa có giấy phép"}</Text>
        <Text style={styles.workspaceName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color="#835101" />
          <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="people" size={14} color="#666" />
            <Text style={styles.statText}>{item.capacity}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="aspect-ratio" size={14} color="#666" />
            <Text style={styles.statText}>{item.area}m²</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          {item.prices && item.prices.length > 1 ? (
            <Text style={styles.priceText}>
              {formatCurrency(item.shortTermPrice)} - {formatCurrency(item.longTermPrice)}
            </Text>
          ) : item.longTermPrice > 0 ? (
            <Text style={styles.priceText}>
              {formatCurrency(item.longTermPrice)}/ngày
            </Text>
          ) : (
            <Text style={styles.priceText}>Liên hệ</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPromotionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.promotionCard}
      onPress={() => navigation.navigate("WorkspaceDetail", { id: item.workspaceID })}
    >
      <View style={styles.promotionContent}>
        <View style={styles.promotionTop}>
          <View style={styles.promotionCodeContainer}>
            <Text style={styles.promoCode}>{item.code}</Text>
            {item.description && (
              <Text style={styles.promotionDescription} numberOfLines={2}>{item.description}</Text>
            )}
          </View>
          <View style={styles.discountCircle}>
            <Text style={styles.discountValue}>{item.discount}%</Text>
            {/* <Text style={styles.discountLabel}>OFF</Text> */}
          </View>
        </View>

        <View style={styles.promotionFooter}>
          <View style={styles.dateContainer}>
            <Icon name="event" size={12} color="#835101" style={styles.dateIcon} />
            <Text style={styles.promotionDates}>
              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.expiryDate}>
            <Text style={styles.expiryLabel}>Hết hạn: </Text>
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.cornerCut}></View>
     
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin chủ không gian</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#835101"]}
          />
        }
      >
        {ownerData ? (
          <View style={styles.ownerCard}>
            <Image
              source={{ uri: ownerData.avatar || null }}
              style={styles.ownerAvatar}
              defaultSource={require('../../assets/images/owner.png')}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{ownerData.licenseName}</Text>
              <Text style={styles.ownerAddress}>{ownerData.licenseAddress}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noOwnerContainer}>
            <Text style={styles.noDataText}>Không tìm thấy thông tin chủ không gian</Text>
          </View>
        )}

        {promotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khuyến mãi đang áp dụng</Text>
            <FlatList
              data={promotions}
              renderItem={renderPromotionItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promotionList}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Không gian làm việc</Text>
          {workspaces.length > 0 ? (
            <View style={styles.workspacesContainer}>
              {workspaces.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.workspaceCard}
                  onPress={() => navigation.navigate("WorkspaceDetail", { id: item.id })}
                >
                  <Image
                    source={{ uri: item.images && item.images.length > 0 ? item.images[0].imgUrl : null }}
                    style={styles.workspaceImage}
                    defaultSource={require('../../assets/images/workspace1.jpg')}
                  />
                  {/* <View style={styles.badgeContainer}>
                    <View style={styles.ratingBadge}>
                      <Icon name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{item.rating || 4.0}</Text>
                    </View>
                  </View> */}
                  <View style={styles.workspaceInfo}>
                    <Text style={styles.licenseName} numberOfLines={1}>{item.licenseName || "Chưa có giấy phép"}</Text>
                    <Text style={styles.workspaceName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.locationRow}>
                      <Icon name="location-on" size={14} color="#835101" />
                      <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
                    </View>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Icon name="people" size={14} color="#666" />
                        <Text style={styles.statText}>{item.capacity}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="aspect-ratio" size={14} color="#666" />
                        <Text style={styles.statText}>{item.area}m²</Text>
                      </View>
                    </View>
                    <View style={styles.priceRow}>
                      {item.prices && item.prices.length > 1 ? (
                        <Text style={styles.priceText}>
                          {formatCurrency(item.shortTermPrice)} - {formatCurrency(item.longTermPrice)}
                        </Text>
                      ) : item.longTermPrice > 0 ? (
                        <Text style={styles.priceText}>
                          {formatCurrency(item.longTermPrice)}/ngày
                        </Text>
                      ) : (
                        <Text style={styles.priceText}>Liên hệ</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="location-off" size={40} color="#ccc" />
              <Text style={styles.noDataText}>Không có không gian làm việc</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  ownerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ownerAddress: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  promotionList: {
    paddingRight: 16,
  },
  promotionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    width: 250,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    position: "relative",
    overflow: "hidden",
  },
  promotionContent: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderLeftWidth: 4,
    borderLeftColor: "#835101",
  },
  promotionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  promotionCodeContainer: {
    flex: 1,
    paddingRight: 10,
  },
  discountCircle: {
    backgroundColor: "#835101",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  discountValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
//   discountLabel: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
  promoCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  promotionDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    lineHeight: 18,
  },
  promotionFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 4,
  },
  promotionDates: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  expiryDate: {
    fontSize: 12,
    color: "#ff6b6b",
    fontWeight: "600",
    marginTop: 4,
  },
  expiryLabel: {
    fontWeight: "bold",
  },
  cornerCut: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderTopRightRadius: 12,
    zIndex: 2,
  },

  workspacesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  workspaceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    width: cardWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  workspaceImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
  workspaceInfo: {
    padding: 10,
  },
  licenseName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  workspaceName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  priceRow: {
    marginTop: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#835101",
  },
  noOwnerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});

export default OwnerDetail;