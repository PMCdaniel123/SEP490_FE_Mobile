import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

const DepositSection = ({ 
  amount, 
  onAmountChange, 
  onDeposit, 
  rawAmount, 
  predefinedAmounts, 
  formatCurrency, 
  selectPredefinedAmount,
  isWalletLocked = false
}) => {
  
  if (isWalletLocked) {
    return (
      <View style={styles.depositSection}>
        <Text style={styles.sectionTitle}>Nạp tiền vào ví</Text>
        
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconContainer}>
            <Ionicons name="lock-closed" size={36} color="#EF4444" />
          </View>
          <Text style={styles.lockedTitle}>Ví của bạn đang bị khóa</Text>
          <Text style={styles.lockedDescription}>
            Ví của bạn hiện đang bị khóa do có yêu cầu rút tiền đang xử lý. Bạn không thể nạp tiền trong thời gian này.
          </Text>
          <Text style={styles.lockedNote}>
            Vui lòng liên hệ hỗ trợ hoặc đợi đến khi yêu cầu rút tiền của bạn được xử lý.
          </Text>
        </View>
        
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Hướng dẫn sử dụng ví</Text>
          <View style={styles.helpItem}>
            <Icon
              name="info-outline"
              size={20}
              color="#835101"
              style={styles.helpIcon}
            />
            <Text style={styles.helpText}>
              Khi bạn có một yêu cầu rút tiền đang xử lý, ví sẽ tạm thời bị khóa
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Icon
              name="info-outline"
              size={20}
              color="#835101"
              style={styles.helpIcon}
            />
            <Text style={styles.helpText}>
              Sau khi yêu cầu rút tiền được hoàn tất, ví sẽ được mở khóa tự động
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.depositSection}>
      <Text style={styles.sectionTitle}>Nạp tiền vào ví</Text>

      <View style={styles.amountInputContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="Nhập số tiền"
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="numeric"
        />
        {amount !== "" && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onAmountChange("")}
          >
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.quickAmountLabel}>Chọn nhanh:</Text>
      <View style={styles.predefinedAmountsContainer}>
        {predefinedAmounts.map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.predefinedAmountButton,
              rawAmount === value && styles.selectedAmountButton,
            ]}
            onPress={() => selectPredefinedAmount(value)}
          >
            <Text
              style={[
                styles.predefinedAmountText,
                rawAmount === value && styles.selectedAmountText,
              ]}
            >
              {formatCurrency(value)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.depositButton,
          (!amount || parseFloat(amount.replace(/[^0-9]/g, "")) <= 0) &&
            styles.disabledButton,
        ]}
        onPress={onDeposit}
        disabled={
          !amount || parseFloat(amount.replace(/[^0-9]/g, "")) <= 0
        }
      >
        <Text style={styles.depositButtonText}>Nạp tiền</Text>
      </TouchableOpacity>
      
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Hướng dẫn sử dụng ví</Text>
        <View style={styles.helpItem}>
          <Icon
            name="info-outline"
            size={20}
            color="#835101"
            style={styles.helpIcon}
          />
          <Text style={styles.helpText}>
            Nạp tiền vào ví để thanh toán nhanh chóng cho các dịch vụ của
            WorkHive
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Icon
            name="info-outline"
            size={20}
            color="#835101"
            style={styles.helpIcon}
          />
          <Text style={styles.helpText}>
            Số dư ví sẽ được cập nhật ngay sau khi giao dịch thành công
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Icon
            name="info-outline"
            size={20}
            color="#835101"
            style={styles.helpIcon}
          />
          <Text style={styles.helpText}>
            Liên hệ hỗ trợ nếu bạn gặp vấn đề với giao dịch
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  depositSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  predefinedAmountsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  predefinedAmountButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAmountButton: {
    borderColor: "#835101",
    backgroundColor: "#f8f1e7",
  },
  predefinedAmountText: {
    fontSize: 14,
    color: "#666",
  },
  selectedAmountText: {
    color: "#835101",
    fontWeight: "500",
  },
  depositButton: {
    backgroundColor: "#835101",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  depositButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  helpSection: {
    marginTop: 10,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  helpIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  lockedIconContainer: {
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  lockedDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default DepositSection;