import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';

const WalletHeader = ({ title }) => {
  const navigation = useNavigation();
  
  const handleBack = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ 
          name: 'Tài khoản',
          params: { screen: 'ProfileMain' }
        }],
      })
    );
  };
  
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title || 'Ví WorkHive'}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WalletHeader;