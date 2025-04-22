import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BalanceCard = ({ balance, onRefresh, formatCurrency }) => {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Icon name="wallet" size={24} color="#835101" />
        <Text style={styles.balanceTitle}>Số dư ví</Text>
      </View>
      <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="refresh" size={20} color="#835101" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#835101",
  },
  refreshButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
});

export default BalanceCard;