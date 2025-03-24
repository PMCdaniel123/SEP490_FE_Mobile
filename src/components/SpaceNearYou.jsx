import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const spacesNearYou = [
  {
    id: 1,
    name: 'Cozy Workspace',
    address: '123 Main Street, District 1, Ho Chi Minh City, Vietnam',
    googleMapUrl: 'https://www.google.com/maps/place/COZY+WORKSPACE/',
    description: 'A cozy workspace for professionals.',
    capacity: 8,
    category: 'Shared Space',
    status: 'Active',
    cleanTime: 10,
    rate: 4.8,
    area: 15,
    openTime: '07:00:00',
    closeTime: '22:00:00',
    is24h: 0,
    prices: [
      {
        id: 1,
        price: 50000,
        category: 'Giờ',
      },
      {
        id: 2,
        price: 300000,
        category: 'Ngày',
      },
    ],
    images: [
      {
        id: 1,
        imgUrl: 'https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894960/IMAGES/mkjegiedszefqdwdsz64.jpg',
      },
    ],
    facilities: [
      {
        id: 1,
        facilityName: 'Wifi tốc độ cao',
      },
      {
        id: 2,
        facilityName: 'Máy lạnh',
      },
    ],
    policies: [
      {
        id: 1,
        policyName: 'Không hút thuốc',
      },
    ],
  },
  {
    id: 2,
    name: 'Modern Meeting Room',
    address: '456 Business Avenue, District 3, Ho Chi Minh City, Vietnam',
    googleMapUrl: 'https://www.google.com/maps/place/MODERN+MEETING+ROOM/',
    description: 'A modern meeting room with premium facilities.',
    capacity: 12,
    category: 'Meeting Room',
    status: 'Active',
    cleanTime: 15,
    rate: 4.7,
    area: 25,
    openTime: '08:00:00',
    closeTime: '20:00:00',
    is24h: 0,
    prices: [
      {
        id: 1,
        price: 100000,
        category: 'Giờ',
      },
      {
        id: 2,
        price: 600000,
        category: 'Ngày',
      },
    ],
    images: [
      {
        id: 1,
        imgUrl: 'https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894988/IMAGES/kkmmgzyvbml4bajjybgl.jpg',
      },
    ],
    facilities: [
      {
        id: 1,
        facilityName: 'Máy chiếu',
      },
      {
        id: 2,
        facilityName: 'Bảng trắng',
      },
    ],
    policies: [
      {
        id: 1,
        policyName: 'Không gây ồn ào',
      },
    ],
  },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const SpaceNearYou = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Không gian gần bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {spacesNearYou.map((space) => (
          <TouchableOpacity
            key={space.id}
            style={styles.listItemCard}
            onPress={() => navigation.navigate('WorkspaceDetail', { workspace: space })}
          >
            <Image source={{ uri: space.images[0]?.imgUrl }} style={styles.listItemImage} />
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemName}>{space.name}</Text>
              <View style={styles.listItemLocation}>
                <Icon name="location-on" size={14} color="#666" />
                <Text style={styles.listItemLocationText} numberOfLines={2}>
                  {space.address}
                </Text>
              </View>
              <View style={styles.listItemFooter}>
                <Text style={styles.listItemPrice}>
                  {space.prices.length > 1
                    ? `${formatCurrency(space.prices[0].price)} - ${formatCurrency(space.prices[1].price)}`
                    : `${formatCurrency(space.prices[0]?.price)}`}
                </Text>
                <View style={styles.listItemRating}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.listItemRatingText}>{space.rate}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#B25F00',
    fontWeight: '500',
  },
  listItemCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  listItemInfo: {
    flex: 1,
    padding: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listItemLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemLocationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 4,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemRatingText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default SpaceNearYou;