import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WalletTabs = ({ activeTab, setActiveTab, isWalletLocked }) => {
  const tabs = [
    { id: 'wallet', label: 'Ví', icon: 'wallet-outline' },
    { id: 'history', label: 'Lịch sử', icon: 'time-outline' },
    { id: 'bankInfo', label: 'Ngân hàng', icon: 'card-outline' },
    { id: 'withdrawal', label: 'Rút tiền', icon: 'cash-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
            isWalletLocked && tab.id === 'wallet' && styles.lockedTab
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons
            name={tab.icon}
            size={20}
            color={
              isWalletLocked && tab.id === 'wallet' 
                ? '#B45309' 
                : activeTab === tab.id 
                  ? '#835101' 
                  : '#666'
            }
            style={styles.icon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
              isWalletLocked && tab.id === 'wallet' && styles.lockedTabText
            ]}
          >
            {tab.label}
            {isWalletLocked && tab.id === 'wallet' && ' (Khóa)'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#835101',
  },
  lockedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#B45309',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeTabText: {
    color: '#835101',
    fontWeight: '600',
  },
  lockedTabText: {
    color: '#B45309',
    fontWeight: '600',
  },
  icon: {
    marginBottom: 2,
  },
});

export default WalletTabs;