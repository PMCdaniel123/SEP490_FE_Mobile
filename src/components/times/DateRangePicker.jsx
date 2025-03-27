/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useCart } from "../../contexts/CartContext";
import dayjs from "dayjs";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import axios from "axios";

LocaleConfig.locales["vn"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ],
  dayNames: ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  today: "Hôm nay",
};

LocaleConfig.defaultLocale = "vn";

const DateRangePicker = ({ openTime, closeTime }) => {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({
    [today]: {
      selected: true,
      startingDay: true,
      endingDay: true,
      color: "#835101",
      textColor: "white",
    },
  });
  const { state, dispatch } = useCart();
  const { workspaceId } = state;
  const [timeList, setTimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeList = async () => {
      try {
        const response = await axios.get(
          `http://35.78.210.59:8080/users/booking/workspacetimes?WorkspaceId=${workspaceId}`
        );
        setLoading(false);
        const filterTimeList =
          response.data.workspaceTimes === null ||
          response.data.workspaceTimes === undefined
            ? []
            : response.data.workspaceTimes.filter(
                (time) =>
                  time.startDate >= today &&
                  (time.status === "Handling" || time.status === "InUse")
              );
        setTimeList(filterTimeList);
      } catch (error) {
        console.error("Error fetching time list:", error);
      }
    };
    fetchTimeList();
  }, [workspaceId, today]);

  useEffect(() => {
    if (timeList.length === 0) return;

    let disabledDates = {};

    timeList.forEach((item) => {
      let start = dayjs(item.startDate).format("YYYY-MM-DD");
      let end = dayjs(item.endDate).format("YYYY-MM-DD");

      let currentDate = dayjs(start);
      let endDate = dayjs(end);

      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        let dateString = currentDate.format("YYYY-MM-DD");
        disabledDates[dateString] = { disabled: true, disableTouchEvent: true };
        currentDate = currentDate.add(1, "day");
      }
    });

    setMarkedDates((prev) => ({ ...prev, ...disabledDates }));
    dispatch({ type: "CLEAR_WORKSPACE_TIME" });
    if (openTime && closeTime && startDate && endDate) {
      dispatch({
        type: "SET_WORKSPACE_TIME",
        payload: {
          startTime: openTime + " " + dayjs(startDate).format("DD/MM/YYYY"),
          endTime: closeTime + " " + dayjs(endDate).format("DD/MM/YYYY"),
          category: "Ngày",
        },
      });
      dispatch({ type: "CALCULATE_TOTAL" });
    }
  }, [openTime, closeTime, startDate, endDate, dispatch, timeList]);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;

    const isDisabled = timeList.some((item) => {
      const start = dayjs(item.startDate).format("YYYY-MM-DD");
      const end = dayjs(item.endDate).format("YYYY-MM-DD");
      return selectedDate >= start && selectedDate <= end;
    });

    if (isDisabled) {
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          selected: true,
          startingDay: true,
          color: "#835101",
        },
      });
    } else {
      const range = getRange(startDate, selectedDate);
      const rangeDates = Object.keys(range);

      const isRangeInvalid = timeList.some((item) => {
        const start = dayjs(item.startDate).format("YYYY-MM-DD");
        const end = dayjs(item.endDate).format("YYYY-MM-DD");

        return rangeDates.some((date) => date >= start && date <= end);
      });

      if (isRangeInvalid) {
        return;
      }

      setEndDate(selectedDate);
      setMarkedDates(range);
    }
  };

  const getRange = (start, end) => {
    let range = {};
    let currentDate = new Date(start);
    let endDate = new Date(end);

    while (currentDate <= endDate) {
      let dateString = currentDate.toISOString().split("T")[0];
      range[dateString] = {
        selected: true,
        color: "#835101",
        textColor: "white",
        startingDay: dateString === start,
        endingDay: dateString === end,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return range;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  return (
    <Calendar
      onDayPress={handleDayPress}
      markingType="period"
      markedDates={markedDates}
      minDate={new Date().toISOString().split("T")[0]}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DateRangePicker;
