/* eslint-disable no-console */
import { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import BeverageItem from "./BeverageItem";

function BeverageList({ ownerId }) {
  const [beverageList, setBeverageList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const fetchBeverageList = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `https://workhive.info.vn:8443/beverages/Owner/${ownerId}`
        );
        const beverages = response.data.beverages || [];
        setBeverageList(beverages);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setError("Không thể tải danh sách thực đơn. Vui lòng thử lại sau.");
        console.error("Error fetching beverages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchBeverageList();
    }
  }, [ownerId, fadeAnim]);

  if (!ownerId) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff4444" />
        <Text style={styles.errorText}>Không thể tải thông tin thực đơn</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải thực đơn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBeverageItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <BeverageItem beverage={item} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="local-drink" size={24} color="#835101" />
          <Text style={styles.sectionTitle}>Thực đơn</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{beverageList?.length || 0}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={beverageList}
        renderItem={renderBeverageItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  countBadge: {
    backgroundColor: "#835101",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  listContainer: {
    paddingVertical: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  errorText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#835101",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BeverageList;
