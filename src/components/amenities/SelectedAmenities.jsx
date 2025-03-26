import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

function SelectedAmenities() {
  const { state, dispatch } = useCart();
  const { amenityList } = state;

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch({
        type: "UPDATE_AMENITY_QUANTITY",
        payload: {
          id: item.id,
          quantity: item.quantity - 1,
        },
      });
    } else {
      removeItem(item);
    }
    dispatch({ type: "CALCULATE_TOTAL" });
  };

  const increaseQuantity = (item) => {
    dispatch({
      type: "UPDATE_AMENITY_QUANTITY",
      payload: {
        id: item.id,
        quantity: item.quantity + 1,
      },
    });
    dispatch({ type: "CALCULATE_TOTAL" });
  };

  const removeItem = (item) => {
    dispatch({
      type: "REMOVE_AMENITY",
      payload: {
        id: item.id,
      },
    });
    dispatch({ type: "CALCULATE_TOTAL" });
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItemCard} key={item.id}>
      <Image source={{ uri: item.imgUrl }} style={styles.listItemImage} />
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.listItemPrice}>
          Đơn giá: {formatCurrency(item.price)}
        </Text>
        <View style={styles.cartControls}>
          <TouchableOpacity onPress={() => decreaseQuantity(item)}>
            <Ionicons name="remove-circle-outline" size={24} color="red" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => increaseQuantity(item)}>
            <Ionicons name="add-circle-outline" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item)}>
            <Ionicons name="trash-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Các tiện ích đã đặt</Text>
      <View style={styles.listContainer}>
        {amenityList.length > 0 ? (
          amenityList.map((item) => renderItem({ item }))
        ) : (
          <Text style={styles.emptyText}>Trống</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  listContainer: {
    paddingBottom: 20,
  },
  listItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  listItemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cartControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

export default SelectedAmenities;
