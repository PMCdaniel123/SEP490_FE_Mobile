import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency } from "../../constants";
import { useCart } from "../../contexts/CartContext";
import { useState } from "react";

function BeverageItem({ beverage }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_BEVERAGE",
      payload: {
        id: beverage.id,
        name: beverage.name,
        imgUrl: beverage.imgUrl,
        price: beverage.price,
        quantity: 1,
      },
    });
    dispatch({ type: "CALCULATE_TOTAL" });
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: beverage.imgUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.price}>{formatCurrency(beverage.price)}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {beverage.name}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            Loại: {beverage.category}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{beverage.name}</Text>
            <Text style={styles.modalText}>Loại: {beverage.category}</Text>
            <Text style={styles.modalText}>
              Giá: {formatCurrency(beverage.price)}
            </Text>
            <Text style={styles.modalText}>
              Mô tả: {beverage.description || "Không có mô tả"}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.modalButtonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#835101",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: 320,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
    color: "#555",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF4D4D",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  modalButton: {
    marginTop: 12,
    backgroundColor: "#835101",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BeverageItem;
