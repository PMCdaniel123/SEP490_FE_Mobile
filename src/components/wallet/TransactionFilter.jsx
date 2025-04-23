import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';

const TransactionFilter = ({ onApplyFilters }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
  
  const transactionTypes = [
    { id: 'deposit', name: 'Nạp tiền', icon: 'arrow-downward', color: '#4CAF50' },
    { id: 'withdraw', name: 'Rút tiền', icon: 'arrow-upward', color: '#2196F3' },
    { id: 'payment', name: 'Thanh toán', icon: 'arrow-upward', color: '#F44336' },
    { id: 'refund', name: 'Hoàn tiền', icon: 'replay', color: '#FF9800' },
  ];

  const toggleType = (typeId) => {
    let newSelectedTypes;
    if (selectedTypes.includes(typeId)) {
      newSelectedTypes = selectedTypes.filter(id => id !== typeId);
    } else {
      newSelectedTypes = [...selectedTypes, typeId];
    }
    setSelectedTypes(newSelectedTypes);
    console.log("Selected types:", newSelectedTypes);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setStartDate(null);
    setEndDate(null);
  };

  const applyFilters = () => {
    // Create filter object with only valid selections
    const filters = {};
    
    if (selectedTypes.length > 0) {
      filters.types = [...selectedTypes]; // Create a copy to ensure it's a new array
    }
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    
    console.log("Applying filters from TransactionFilter:", filters);
    
    // Ensure we're passing a non-empty object
    if (Object.keys(filters).length === 0) {
      console.log("No filters selected, showing all transactions");
    }
    
    onApplyFilters(filters);
    setModalVisible(false);
  };

  const showCalendar = (isStart) => {
    setIsSelectingStartDate(isStart);
    setCalendarVisible(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Format date for calendar marking
  const formatCalendarDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  // Get marked dates for the calendar
  const getMarkedDates = () => {
    const markedDates = {};
    
    if (startDate) {
      const formattedStartDate = formatCalendarDate(startDate);
      markedDates[formattedStartDate] = {
        selected: true, 
        selectedColor: '#835101',
        startingDay: true
      };
    }
    
    if (endDate) {
      const formattedEndDate = formatCalendarDate(endDate);
      markedDates[formattedEndDate] = {
        selected: true, 
        selectedColor: '#835101',
        endingDay: true
      };
    }
    
    // If both dates are selected, mark the period
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Mark dates in between
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + 1);
      
      while (currentDate < end) {
        const formattedDate = formatCalendarDate(currentDate);
        markedDates[formattedDate] = {
          selected: true,
          selectedColor: '#E3F2FD'
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return markedDates;
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    console.log("Selected day:", day);
    const selectedDate = new Date(day.dateString);
    // Reset time to midnight to ensure proper date comparison
    selectedDate.setHours(0, 0, 0, 0);
    
    if (isSelectingStartDate) {
      console.log("Setting start date:", selectedDate);
      setStartDate(selectedDate);
      // If end date exists and is before the new start date, reset it
      if (endDate && selectedDate > new Date(endDate)) {
        setEndDate(null);
      }
      setIsSelectingStartDate(false); // Switch to selecting end date
    } else {
      // Ensure end date isn't before start date
      if (startDate && selectedDate < new Date(startDate)) {
        // If selected date is before start date, make it the new start date
        console.log("Selected end date is before start date, updating start date");
        setStartDate(selectedDate);
      } else {
        console.log("Setting end date:", selectedDate);
        setEndDate(selectedDate);
        setCalendarVisible(false); // Close calendar after selecting end date
      }
    }
  };

  // Count active filters
  const activeFilterCount = (selectedTypes.length > 0 ? 1 : 0) + 
                           ((startDate || endDate) ? 1 : 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setModalVisible(true)}
      >
        <Icon name="filter-list" size={22} color="#333" />
        <Text style={styles.filterText}>Lọc</Text>
        {activeFilterCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc giao dịch</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Transaction types section */}
              <Text style={styles.sectionTitle}>Loại giao dịch</Text>
              <View style={styles.typesContainer}>
                {transactionTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeItem,
                      selectedTypes.includes(type.id) && styles.selectedType
                    ]}
                    onPress={() => toggleType(type.id)}
                  >
                    <Icon 
                      name={type.icon} 
                      size={18} 
                      color={selectedTypes.includes(type.id) ? '#FFF' : type.color} 
                    />
                    <Text 
                      style={[
                        styles.typeText,
                        selectedTypes.includes(type.id) && styles.selectedTypeText
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date range section */}
              <Text style={styles.sectionTitle}>Khoảng thời gian</Text>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => showCalendar(true)}
                >
                  <Icon name="event" size={18} color="#666" />
                  <Text style={styles.dateText}>
                    {startDate ? formatDate(startDate) : 'Từ ngày'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => showCalendar(false)}
                >
                  <Icon name="event" size={18} color="#666" />
                  <Text style={styles.dateText}>
                    {endDate ? formatDate(endDate) : 'Đến ngày'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Calendar */}
              {calendarVisible && (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>
                      {isSelectingStartDate ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc'}
                    </Text>
                    <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                      <Icon name="close" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <Calendar
                    onDayPress={handleDateSelect}
                    markedDates={getMarkedDates()}
                    enableSwipeMonths={true}
                    theme={{
                      todayTextColor: '#835101',
                      arrowColor: '#835101',
                      dotColor: '#835101',
                      textDayFontSize: 14,
                      textMonthFontSize: 16,
                      textDayHeaderFontSize: 14,
                    }}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    alignSelf: 'flex-end',
    margin: 15
  },
  filterText: {

    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#835101',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  modalBody: {
    padding: 16,
    maxHeight: '70%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedType: {
    backgroundColor: '#835101',
    borderColor: '#835101',
  },
  typeText: {
    marginLeft: 4,
    color: '#333',
  },
  selectedTypeText: {
    color: '#fff',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '48%',
  },
  dateText: {
    marginLeft: 8,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#835101',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  calendarContainer: {
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default TransactionFilter;