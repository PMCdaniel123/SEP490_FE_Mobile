import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const highRatedSpaces = [
  {
    id: 1,
    name: 'Workaholic Bàn cá nhân',
    address: '21A1 Đ Làng Tăng Phú, Tăng Nhơn Phú A, Thủ Đức, Hồ Chí Minh, Việt Nam',
    googleMapUrl: 'https://www.google.com/maps/place/WORKAHOLIC+CAFE+24%2F7/',
    description: 'Coffee and workspace Workaholic',
    capacity: 5,
    category: 'Bàn cá nhân',
    status: 'Active',
    createdAt: '2025-03-24T16:38:43.984Z',
    updatedAt: '2025-03-24T16:38:43.984Z',
    cleanTime: 15,
    rate: 4.6,
    area: 10,
    openTime: '00:00:00',
    closeTime: '23:59:00',
    is24h: 1,
    prices: [
      {
        id: 1,
        price: 100,
        category: 'Giờ',
      },
      {
        id: 2,
        price: 500,
        category: 'Ngày',
      },
    ],
    images: [
      {
        id: 1,
        imgUrl: 'https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894818/IMAGES/djgfdgh9elztkr0svfwi.jpg',
      },
      {
        id: 2,
        imgUrl: 'https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894872/IMAGES/jxr6ekgv5gvlgygbtlly.jpg',
      },
    ],
    facilities: [
      {
        id: 1,
        facilityName: 'Quầy tự phục vụ',
      },
      {
        id: 2,
        facilityName: 'Tivi 65 inch',
      },
    ],
    policies: [
      {
        id: 1,
        policyName: 'Không mang thức ăn từ bên ngoài vào',
      },
      {
        id: 2,
        policyName: 'Không mang theo động vật',
      },
    ],
  },
  {
    id: 2,
    name: 'Opal Grove Inn',
    address: 'Le Van Viet, Thu Duc',
    googleMapUrl: 'https://www.google.com/maps/place/OPAL+GROVE+INN/',
    description: 'A cozy workspace with modern amenities',
    capacity: 10,
    category: 'Phòng họp',
    status: 'Active',
    createdAt: '2025-03-24T16:38:43.984Z',
    updatedAt: '2025-03-24T16:38:43.984Z',
    cleanTime: 20,
    rate: 4.5,
    area: 20,
    openTime: '08:00:00',
    closeTime: '20:00:00',
    is24h: 0,
    prices: [
      {
        id: 1,
        price: 200,
        category: 'Giờ',
      },
      {
        id: 2,
        price: 1000,
        category: 'Ngày',
      },
    ],
    images: [
      {
        id: 1,
        imgUrl: 'https://res.cloudinary.com/dcq99dv8p/image/upload/v1741894920/IMAGES/ul4gto2ywr0vwpbgamhy.jpg',
      },
    ],
    facilities: [
      {
        id: 1,
        facilityName: 'Máy lạnh',
      },
      {
        id: 2,
        facilityName: 'Wifi tốc độ cao',
      },
    ],
    policies: [
      {
        id: 1,
        policyName: 'Không hút thuốc',
      },
    ],
  },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const HighRatedSpaces = () => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Không gian được đánh giá cao</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {highRatedSpaces.map((space) => (
          <TouchableOpacity key={space.id} style={styles.spaceCard}>
            <Image source={{ uri: space.images[0]?.imgUrl }} style={styles.spaceImage} />
            <TouchableOpacity style={styles.favoriteButton}>
              <Icon name="favorite-border" size={20} color="#FF5A5F" />
            </TouchableOpacity>
            <View style={styles.spaceInfo}>
              <Text style={styles.spaceName}>{space.name}</Text>
              <Text style={styles.spaceLocation} numberOfLines={1}>
                {space.address}
              </Text>
              <View style={styles.priceRatingContainer}>
                <Text style={styles.spacePrice}>
                  {space.prices.length > 1
                    ? `${formatCurrency(Math.min(...space.prices.map((p) => p.price)))} - ${formatCurrency(
                        Math.max(...space.prices.map((p) => p.price))
                      )}`
                    : `${formatCurrency(space.prices[0]?.price)}`}
                </Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{space.rate}</Text>
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
    marginBottom: 24,
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
  spaceCard: {
    width: 250,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  spaceImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },
  spaceInfo: {
    padding: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  spaceLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacePrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default HighRatedSpaces;