import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TransactionItem = ({ item, formatCurrency }) => {
  // Determine transaction type from description
  const getTransactionTypeAndIcon = () => {
    const description = item.description?.toLowerCase() || "";
    
    if (description.includes("nạp tiền") || description.includes("deposit")) {
      return {
        icon: "arrow-downward",
        color: "#4CAF50",
        bgColor: "#E6F7ED",
        text: "Nạp tiền"
      };
    } else if (description.includes("hoàn tiền") || description.includes("refund")) {
      return {
        icon: "replay",
        color: "#FF9800",
        bgColor: "#FFF3E0",
        text: "Hoàn tiền"
      };
    } else if (description.includes("rút tiền") || description.includes("withdraw")) {
      return {
        icon: "arrow-upward",
        color: "#2196F3",
        bgColor: "#E3F2FD",
        text: "Rút tiền"
      };
    } else {
      return {
        icon: "arrow-upward",
        color: "#F44336",
        bgColor: "#FFEBEE",
        text: "Thanh toán"
      };
    }
  };

  // Format status based on API response
  const getFormattedStatus = () => {
    const status = item.status || "";
    
    if (status === "PAID" || status === "REFUND" || status === "Withdraw Success") {
      return "Hoàn thành";
    } else if (status.toLowerCase().includes("fail") || status.toLowerCase().includes("thất bại")) {
      return "Thất bại";
    } else {
      return "Đang xử lý";
    }
  };

  // Get status color like web version
  const getStatusColor = () => {
    const status = getFormattedStatus();
    if (status === "Hoàn thành") {
      return "#4CAF50"; // Green
    } else if (status === "Đang xử lý") {
      return "#2196F3"; // Blue
    } else {
      return "#F44336"; // Red
    }
  };

  const transactionInfo = getTransactionTypeAndIcon();
  const formattedStatus = getFormattedStatus();
  const statusColor = getStatusColor();
  
  // Determine if this is an incoming transaction (adding money to wallet)
  const isIncoming = transactionInfo.text === "Nạp tiền" || transactionInfo.text === "Hoàn tiền";

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: transactionInfo.bgColor },
        ]}
      >
        <Icon
          name={transactionInfo.icon}
          size={20}
          color={transactionInfo.color}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {transactionInfo.text}
        </Text>
        <Text style={styles.transactionDesc} numberOfLines={1}>
          {item.description || "Giao dịch " + transactionInfo.text.toLowerCase()}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date || item.created_At).toLocaleDateString("vi-VN", {
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
        {item.afterTransactionAmount !== undefined && (
          <Text style={styles.balanceText}>
            Số dư: {formatCurrency(item.afterTransactionAmount)}
          </Text>
        )}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: formattedStatus === "Hoàn thành" ? "#E6F7ED" : 
                formattedStatus === "Đang xử lý" ? "#E3F2FD" : "#FFEBEE" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColor }
            ]}
          >
            {formattedStatus}
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
    marginBottom: 2,
  },
  transactionDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#888",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  balanceText: {
    fontSize: 12,
    color: "#666",
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