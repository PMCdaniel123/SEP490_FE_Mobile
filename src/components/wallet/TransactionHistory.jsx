import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TransactionFilter from './TransactionFilter';

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

  const getFormattedStatus = () => {
    if (!item.status) {
      return "Đang xử lý";
    }
    
    // Log unhandled status for debugging
    console.log("Processing status:", item.status);
    
    // First check for Vietnamese status texts - exact match
    if (item.status === "Hoàn thành" || item.status === "Thất bại" || item.status === "Đang xử lý") {
      return item.status;
    }
    
    // Convert to uppercase for case-insensitive comparison
    const upperStatus = item.status.toUpperCase();
    
    // Check for success statuses
    if (upperStatus === "PAID" || upperStatus === "REFUND" || upperStatus === "WITHDRAW SUCCESS" || upperStatus === "ACTIVE") {
      return "Hoàn thành";
    } 
    // Check for failure statuses
    else if (upperStatus.includes("FAIL") || item.status.toLowerCase().includes("thất bại")) {
      return "Thất bại";
    } 
    // Default to processing
    else {
      return "Đang xử lý";
    }
  };

  const transactionInfo = getTransactionTypeAndIcon();
  const formattedStatus = getFormattedStatus();

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
        <Text style={styles.balanceText}>
          Số dư: {formatCurrency(item.afterTransactionAmount || 0)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: "#E6F7ED" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: "#4CAF50" }
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
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  
  // Sort transactions by newest first
  const sortTransactionsByNewest = (transactionsToSort) => {
    return [...transactionsToSort].sort((a, b) => {
      const dateA = new Date(a.date || a.created_At || 0);
      const dateB = new Date(b.date || b.created_At || 0);
      return dateB - dateA; // Newest first
    });
  };
  
  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters(activeFilters);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, activeFilters]);

  const applyFilters = (filters) => {
    console.log("Applying filters:", filters);
    setActiveFilters(filters);
    
    // If no filters, show all transactions sorted by date
    if (!filters || Object.keys(filters).length === 0) {
      const sortedTransactions = sortTransactionsByNewest(transactions);
      setFilteredTransactions(sortedTransactions);
      return;
    }
    
    let result = [...transactions];
    
    // Sort by date (newest first) - this is always applied
    result = sortTransactionsByNewest(result);
    
    // Apply type filters if selected
    if (filters.types) {
      result = result.filter(item => {
        // Match transaction types from filter with transaction data
        return filters.types.some(type => {
          if (type === 'deposit' && (item.type === 'deposit' || 
              (item.description && item.description.toLowerCase().includes('nạp tiền')))) {
            return true;
          }
          if (type === 'withdraw' && (item.type === 'withdraw' || 
              (item.description && item.description.toLowerCase().includes('rút tiền')))) {
            return true;
          }
          if (type === 'payment' && (item.type === 'payment' || 
              (item.description && item.description.toLowerCase().includes('thanh toán')))) {
            return true;
          }
          if (type === 'refund' && (item.type === 'refund' || 
              (item.description && item.description.toLowerCase().includes('hoàn tiền')))) {
            return true;
          }
          return false;
        });
      });
    }
    
    // Apply date filters if selected
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0); // Ensure start date is at beginning of day
      
      console.log("Filtering by start date:", startDate.toISOString());
      
      result = result.filter(item => {
        let itemDate;
        try {
          // Convert string date to Date object
          itemDate = new Date(item.date || item.created_At);
          return itemDate >= startDate;
        } catch (error) {
          console.error("Date comparison error for item:", item, error);
          return false;
        }
      });
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Ensure end date is at end of day
      
      console.log("Filtering by end date:", endDate.toISOString());
      
      result = result.filter(item => {
        let itemDate;
        try {
          // Convert string date to Date object
          itemDate = new Date(item.date || item.created_At);
          return itemDate <= endDate;
        } catch (error) {
          console.error("Date comparison error for item:", item, error);
          return false;
        }
      });
    }
    
    console.log("Filter result count:", result.length, "of", transactions.length);
    setFilteredTransactions(result);
  };

  // Initialize with all transactions sorted by newest on first render
  useEffect(() => {
    if (transactions.length > 0) {
      const sortedTransactions = sortTransactionsByNewest(transactions);
      setFilteredTransactions(sortedTransactions);
    }
  }, [transactions]);

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
    <View style={styles.container}>
      <TransactionFilter onApplyFilters={applyFilters} />
      
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={({ item }) => <TransactionItem item={item} formatCurrency={formatCurrency} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={50} color="#CCCCCC" />
          <Text style={styles.noResultsText}>Không tìm thấy giao dịch</Text>
          <Text style={styles.noResultsSubtext}>
            Không có giao dịch nào phù hợp với bộ lọc của bạn
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    color: "#333",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

export default TransactionHistory;