import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Image
          source={require('../../assets/images/workspace2.jpg')}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>Khanh Quang</Text>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.location}>Thu Duc</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="notifications-none" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: '#666',
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default Header;