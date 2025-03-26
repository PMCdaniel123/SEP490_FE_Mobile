import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatCurrency } from "../../constants";
import { useCart } from "../../contexts/CartContext";
import SelectedAmenities from "../amenities/SelectedAmenities";
import SelectedBeverages from "../beverages/SelectedBeverages";
import { useNavigation } from "@react-navigation/native";

function BookingDetail() {
  const { state, dispatch } = useCart();
  const { total, amenityList, beverageList } = state;
  const navigation = useNavigation();

  const clearAll = () => {
    dispatch({ type: "CLEAR_BEVERAGE_AMENITY" });
    dispatch({ type: "CALCULATE_TOTAL" });
  };

  return (
    <View style={styles.infoContainer}>
      <TouchableOpacity
        onPress={clearAll}
        style={{
          backgroundColor: "red",
          padding: 8,
          borderRadius: 8,
          alignItems: "center",
          display:
            amenityList.length + beverageList.length > 1 ? "flex" : "none",
          width: "30%",
          alignSelf: "flex-end",
        }}
      >
        <Text style={{ color: "#fff" }}>Xóa tất cả</Text>
      </TouchableOpacity>
      <View>
        {amenityList.length > 0 && <SelectedAmenities />}
        {beverageList.length > 0 && <SelectedBeverages />}
      </View>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>Tổng cộng:</Text>
          <Text style={styles.price}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Checkout")}
          style={{
            backgroundColor: total === 0 ? "#ccc" : "#835101",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 16,
          }}
          disabled={total === 0}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            Thanh toán
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    margin: 12,
    gap: 12,
  },
  price: { fontSize: 24, fontWeight: "bold", color: "#835101" },
});

export default BookingDetail;
