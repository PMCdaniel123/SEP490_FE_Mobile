import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TransactionItem = ({ item, formatCurrency }) => {
  const isIncoming = item.type === "deposit" || item.type === "refund";

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: isIncoming ? "#E6F7ED" : "#FFEBEE" },
        ]}
      >
        <Icon
          name={isIncoming ? "arrow-downward" : "arrow-upward"}
          size={20}
          color={isIncoming ? "#4CAF50" : "#F44336"}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {item.type === "payment"
            ? "Thanh toán"
            : item.type === "refund"
              ? "Hoàn tiền"
              : "Nạp tiền"}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amountText,
            { color: isIncoming ? "#4CAF50" : "#F44336" },
          ]}
        >
          {isIncoming ? "+" : "-"} {formatCurrency(item.amount)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Hoàn thành" ? "#E6F7ED" : "#FFEBEE",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === "Hoàn thành" ? "#4CAF50" : "#F44336" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const TransactionHistory = ({ transactions, formatCurrency }) => {
  if (transactions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="receipt-long" size={60} color="#CCCCCC" />
        <Text style={styles.emptyStateText}>Chưa có giao dịch nào</Text>
        <Text style={styles.emptyStateSubtext}>
          Các giao dịch của bạn sẽ hiển thị ở đây
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={({ item }) => <TransactionItem item={item} formatCurrency={formatCurrency} />}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.transactionsList}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  transactionsList: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    color: "#333",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

export default TransactionHistory;