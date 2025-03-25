import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";

const WorkspaceDetail = ({ route }) => {
  const { id } = route.params; // Get workspace ID from navigation params
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      try {
        const response = await axios.get(`http://35.78.210.59:8080/workspaces/${id}`);
        setWorkspace(response.data.getWorkSpaceByIdResult);
      } catch (error) {
        console.error("Error fetching workspace details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  if (!workspace) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin không gian làm việc</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {workspace.images.map((image) => (
        <Image key={image.id} source={{ uri: image.imgUrl }} style={styles.image} />
      ))}

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <Text style={styles.text}>Tên: {workspace.name}</Text>
        <Text style={styles.text}>Mô tả: {workspace.description}</Text>
        <Text style={styles.text}>Địa chỉ: {workspace.address}</Text>
        <Text style={styles.text}>Sức chứa: {workspace.capacity}</Text>
        <Text style={styles.text}>Diện tích: {workspace.area} m²</Text>
        <Text style={styles.text}>Loại: {workspace.category}</Text>
        <Text style={styles.text}>Mở cửa: {workspace.openTime}</Text>
        <Text style={styles.text}>Đóng cửa: {workspace.closeTime}</Text>
        <Text style={styles.text}>Hoạt động 24h: {workspace.is24h ? "Có" : "Không"}</Text>
        <Text style={styles.text}>Google Map URL: {workspace.googleMapUrl}</Text>

        <Text style={styles.sectionTitle}>Giá</Text>
        {workspace.prices.map((price) => (
          <Text key={price.id} style={styles.text}>
            {price.category}: {formatCurrency(price.price)}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Tiện ích</Text>
        {workspace.facilities.map((facility) => (
          <Text key={facility.id} style={styles.text}>
            - {facility.facilityName}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Chính sách</Text>
        {workspace.policies.map((policy) => (
          <Text key={policy.id} style={styles.text}>
            - {policy.policyName}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 8,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
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
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
});

export default WorkspaceDetail;