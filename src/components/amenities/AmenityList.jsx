/* eslint-disable no-console */
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AmenityItem from "./AmenityItem";
import axios from "axios";

function AmenityList({ ownerId }) {
  const [amenityList, setAmenityList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenityList = async () => {
      try {
        const response = await axios.get(
          `http://35.78.210.59:8080/amenities/Owner/${ownerId}`
        );
        setAmenityList(response.data.amenities || []);
      } catch (error) {
        alert("Error fetching amenities list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenityList();
  }, [ownerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  if (!ownerId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin tiện ích</Text>
      </View>
    );
  }

  const renderAmenityItem = ({ item }) => <AmenityItem amenity={item} />;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tiện ích</Text>
        {/* <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity> */}
      </View>
      <FlatList
        data={amenityList}
        renderItem={renderAmenityItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AmenityList;
