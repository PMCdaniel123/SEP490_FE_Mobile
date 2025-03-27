/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import ImageList from "../components/ImageList";
import { Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AmenityList from "../components/amenities/AmenityList";
import { formatCurrency } from "../constants";
import BeverageList from "../components/beverages/BeverageList";
import { useCart } from "../contexts/CartContext";
import BookingDetail from "../components/booking/BookingDetail";

const WorkspaceDetail = ({ route }) => {
  const { id } = route.params;
  const [workspaceDetail, setWorkspaceDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const navigation = useNavigation();
  const { state, dispatch } = useCart();
  const { amenityList, beverageList } = state;
  const [numberItems, setNumberItems] = useState(0);

  useEffect(() => {
    dispatch({ type: "CLEAR_CART" });
    const fetchWorkspaceDetails = async () => {
      try {
        const response = await axios.get(
          `http://35.78.210.59:8080/workspaces/${id}`
        );
        setWorkspaceDetail(response.data.getWorkSpaceByIdResult);
        dispatch({
          type: "SET_WORKSPACE_ID",
          payload: {
            workspaceId: id,
            price: response.data.getWorkSpaceByIdResult.prices[1].price,
            priceType: "2",
          },
        });
        dispatch({ type: "CALCULATE_TOTAL" });
      } catch (error) {
        console.error("Error fetching workspace details:", error);
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

  return (
    <ScrollView style={styles.container}>
      <ImageList
        images={workspaceDetail?.images}
        onBackPress={handleBackPress}
      />

      <View style={{ margin: 12, gap: 8 }}>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.price}>
            {formatCurrency(workspaceDetail?.prices[0].price)} -{" "}
            {formatCurrency(workspaceDetail?.prices[1].price)}
          </Text>
        </View>
        <Text style={styles.name}>{workspaceDetail?.name}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginBottom: 8,
          }}
        >
          <MaterialIcons name="location-on" size={20} color="#835101" />
          <Text>{workspaceDetail?.address}</Text>
        </View>
        <View style={styles.userInfo}>
          <Image
            source={require("../../assets/images/workspace2.jpg")}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.licenseName}>
              {workspaceDetail?.licenseName}
            </Text>
          </View>
        </View>
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
          <Text
            style={[
              styles.tabText,
              activeTab === "booking" && styles.activeTabText,
            ]}
          >
            Đặt chỗ ({numberItems})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "details" ? (
        <View style={styles.infoContainer}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.detailContainer}>
              <MaterialIcons name={"square-foot"} size={36} color="#484848" />
              <Text style={styles.detailText}>{workspaceDetail?.area} m²</Text>
            </View>
            <View style={styles.detailContainer}>
              <MaterialIcons name={"people"} size={36} color="#484848" />
              <Text style={styles.detailText}>
                {workspaceDetail?.capacity} người
              </Text>
            </View>
            <View style={styles.detailContainer}>
              <MaterialIcons name={"business"} size={36} color="#484848" />
              <Text style={styles.detailText}>{workspaceDetail?.category}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 6,
            }}
          >
            <Text style={styles.boldText}>Mô tả:</Text>
            <Text>{workspaceDetail?.description}</Text>
            <View
              style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
            >
              <Text>
                Đặt theo giờ: {formatCurrency(workspaceDetail?.prices[0].price)}
              </Text>
              <Text style={{ color: "red", fontSize: 12, fontStyle: "italic" }}>
                {" "}
                (chưa hỗ trợ)
              </Text>
            </View>
            <Text>
              Đặt theo ngày: {formatCurrency(workspaceDetail?.prices[1].price)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={styles.boldText}>Thời gian hoạt động: </Text>
            {!workspaceDetail?.is24h ? (
              <Text>
                {workspaceDetail?.openTime} - {workspaceDetail?.closeTime}
              </Text>
            ) : (
              <Text>Mở cửa 24h</Text>
            )}
          </View>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>🚀 Cơ sở vật chất</Text>
              {workspaceDetail?.facilities.map((facility) => (
                <Text key={facility.id} style={styles.text}>
                  ✔ {facility.facilityName}
                </Text>
              ))}
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>📜 Quy định chung</Text>
              {workspaceDetail?.policies.map((policy) => (
                <Text key={policy.id} style={styles.text}>
                  ⚠ {policy.policyName}
                </Text>
              ))}
            </Card.Content>
          </Card>

          <View style={styles.serviceList}>
            <AmenityList ownerId={workspaceDetail?.ownerId} />
          </View>

          <View style={styles.serviceList}>
            <BeverageList ownerId={workspaceDetail?.ownerId} />
          </View>
        </View>
      ) : (
        <BookingDetail
          openTime={workspaceDetail?.openTime}
          closeTime={workspaceDetail?.closeTime}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  licenseName: {
    fontSize: 14,
  },
  price: { fontSize: 24, fontWeight: "bold", color: "#835101" },
  name: { fontSize: 18, fontWeight: "bold", color: "#835101" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#835101",
    padding: 8,
    justifyContent: "space-around",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  activeTabText: {
    color: "#835101",
  },
  infoContainer: {
    margin: 12,
    gap: 12,
  },
  text: {
    fontSize: 14,
    marginBottom: 6,
  },
  boldText: { fontWeight: "bold", fontSize: 16 },
  detailContainer: {
    flexDirection: "column",
    backgroundColor: "#EFF0F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    gap: 4,
  },
  detailText: { color: "#484848" },
  card: {
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceList: { marginTop: 16 },
});

export default WorkspaceDetail;
