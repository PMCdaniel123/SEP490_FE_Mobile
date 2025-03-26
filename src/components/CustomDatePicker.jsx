import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const CustomDatePicker = ({ isVisible, onClose, onConfirm, selectedDay, selectedMonth, selectedYear, setSelectedDay, setSelectedMonth, setSelectedYear }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => 1950 + i);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
          
          <View style={styles.datePickerContainer}>
            <PickerColumn
              label="Ngày"
              items={days}
              selectedValue={selectedDay}
              onValueChange={setSelectedDay}
            />
            <PickerColumn
              label="Tháng"
              items={months}
              selectedValue={selectedMonth}
              onValueChange={setSelectedMonth}
            />
            <PickerColumn
              label="Năm"
              items={years}
              selectedValue={selectedYear}
              onValueChange={setSelectedYear}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
              <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PickerColumn = ({ label, items, selectedValue, onValueChange }) => (
  <View style={styles.pickerColumn}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <ScrollView style={styles.picker}>
      {items.map(item => (
        <TouchableOpacity
          key={`${label}-${item}`}
          style={[
            styles.pickerItem,
            selectedValue === item && styles.selectedPickerItem
          ]}
          onPress={() => onValueChange(item)}
        >
          <Text style={[
            styles.pickerItemText,
            selectedValue === item && styles.selectedPickerItemText
          ]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#835101',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  picker: {
    height: 150,
    width: '100%',
  },
  pickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPickerItem: {
    backgroundColor: '#f0e6d8',
    borderRadius: 5,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPickerItemText: {
    color: '#835101',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#835101',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default CustomDatePicker;
