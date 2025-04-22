import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentMethodModal = ({
  isVisible,
  onClose,
  rawAmount,
  formatCurrency,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onConfirm,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalAmountText}>
            Số tiền nạp:{" "}
            <Text style={styles.modalAmountValue}>
              {formatCurrency(rawAmount)}
            </Text>
          </Text>

          <View style={styles.paymentMethodsContainer}>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                selectedPaymentMethod === "Chuyển khoản ngân hàng" &&
                  styles.selectedPaymentMethod,
              ]}
              onPress={() => setSelectedPaymentMethod("Chuyển khoản ngân hàng")}
            >
              <Image
                source={require("../../../assets/images/vietqr.png")}
                style={styles.paymentMethodIcon}
              />
              <Text style={styles.paymentMethodText}>
                Chuyển khoản ngân hàng
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                !selectedPaymentMethod && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={!selectedPaymentMethod}
            >
              <Text style={styles.confirmButtonText}>
                Xác nhận thanh toán
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalAmountText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  modalAmountValue: {
    fontWeight: "bold",
    color: "#835101",
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  paymentMethodButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  selectedPaymentMethod: {
    borderColor: "#835101",
    backgroundColor: "#f8f1e7",
  },
  paymentMethodIcon: {
    width: 190,
    height: 60,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#835101",
    marginLeft: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
});

export default PaymentMethodModal;