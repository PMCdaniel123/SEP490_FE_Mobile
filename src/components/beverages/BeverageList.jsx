/* eslint-disable no-console */
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import axios from "axios";
import BeverageItem from "./BeverageItem";

function BeverageList({ ownerId }) {
  const [beverageList, setBeverageList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeverageList = async () => {
      try {
        const response = await axios.get(
          `http://35.78.210.59:8080/beverages/Owner/${ownerId}`
        );
        setBeverageList(response.data.beverages || []);
      } catch (error) {
        console.error("Error fetching beverages list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeverageList();
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
        <Text style={styles.errorText}>Không thể tải thông tin thực đơn</Text>
      </View>
    );
  }

  const renderBeverageItem = ({ item }) => <BeverageItem beverage={item} />;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thực đơn</Text>
        {/* <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity> */}
      </View>
      <FlatList
        data={beverageList}
        renderItem={renderBeverageItem}
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

export default BeverageList;
