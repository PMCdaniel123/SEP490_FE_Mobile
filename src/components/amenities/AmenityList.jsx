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
import AmenityItem from "./AmenityItem";
import axios from "axios";

function AmenityList({ ownerId }) {
  const [amenityList, setAmenityList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const fetchAmenityList = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://35.78.210.59:8080/amenities/Owner/${ownerId}`
        );
        const amenities = response.data.amenities || [];
        setAmenityList(amenities);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setError("Không thể tải danh sách tiện ích. Vui lòng thử lại sau.");
        console.error("Error fetching amenities:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchAmenityList();
    }
  }, [ownerId, fadeAnim]);

  if (!ownerId) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff4444" />
        <Text style={styles.errorText}>Không thể tải thông tin tiện ích</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải tiện ích...</Text>
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

  const renderAmenityItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <AmenityItem amenity={item} />
    </Animated.View>
  );

  const displayedAmenities = showAll ? amenityList : amenityList?.slice(0, 5);
  const hasMoreAmenities = amenityList?.length > 5;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="stars" size={24} color="#835101" />
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{amenityList?.length || 0}</Text>
          </View>
        </View>
        {hasMoreAmenities && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAll(!showAll)}
          >
            <Text style={styles.toggleButtonText}>
              {showAll ? "Thu gọn" : "Xem tất cả"}
            </Text>
            <MaterialIcons
              name={showAll ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color="#835101"
            />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={displayedAmenities}
        renderItem={renderAmenityItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={!showAll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          showAll && styles.gridContainer,
        ]}
        numColumns={showAll ? 2 : 1}
        key={showAll ? "grid" : "list"}
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
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toggleButtonText: {
    color: "#835101",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    paddingVertical: 8,
  },
  gridContainer: {
    gap: 12,
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

export default AmenityList;
