import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ iconName, message, time }) => (
  <View style={styles.notificationItem}>
    <View style={styles.iconContainer}>
      <Ionicons name={iconName} size={24} color="#555" />
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  </View>
);

export default NotificationItem;