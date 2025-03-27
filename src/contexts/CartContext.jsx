import React, { createContext, useReducer, useContext } from "react";
import dayjs from "dayjs";
import { parseDate } from "../constants";

const CartContext = createContext();

const initialState = {
  workspaceId: "",
  price: 0,
  priceType: "1",
  startTime: "",
  endTime: "",
  beverageList: [],
  amenityList: [],
  total: 0,
  category: "",
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_WORKSPACE_ID":
      return { ...state, ...action.payload };

    case "SET_WORKSPACE_TIME":
      return { ...state, ...action.payload };

    case "CLEAR_WORKSPACE_TIME":
      return { ...state, startTime: "", endTime: "", total: 0, category: "" };

    case "ADD_BEVERAGE": {
      const existingItem = state.beverageList.find(
        (item) => item.id === action.payload.id
      );
      const beverageList = existingItem
        ? state.beverageList.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.beverageList, action.payload];
      return { ...state, beverageList };
    }

    case "REMOVE_BEVERAGE":
      return {
        ...state,
        beverageList: state.beverageList.filter(
          (item) => item.id !== action.payload.id
        ),
      };

    case "UPDATE_BEVERAGE_QUANTITY":
      return {
        ...state,
        beverageList: state.beverageList.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "ADD_AMENITY": {
      const existingItem = state.amenityList.find(
        (item) => item.id === action.payload.id
      );
      const amenityList = existingItem
        ? state.amenityList.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.amenityList, action.payload];
      return { ...state, amenityList };
    }

    case "REMOVE_AMENITY":
      return {
        ...state,
        amenityList: state.amenityList.filter(
          (item) => item.id !== action.payload.id
        ),
      };

    case "UPDATE_AMENITY_QUANTITY":
      return {
        ...state,
        amenityList: state.amenityList.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_BEVERAGE_AMENITY":
      return { ...state, beverageList: [], amenityList: [], total: 0 };

    case "CLEAR_CART":
      return initialState;

    case "CALCULATE_TOTAL": {
      const beverageTotal = state.beverageList.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const amenityTotal = state.amenityList.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      let duration = 0;
      if (state.priceType === "1") {
        const start = dayjs(state.startTime, "HH:mm DD/MM/YYYY")
          .toDate()
          .getTime();
        const end = dayjs(state.endTime, "HH:mm DD/MM/YYYY").toDate().getTime();
        duration = (end - start) / (1000 * 60 * 60);
      } else {
        if (!state.startTime || !state.endTime) return state;
        const startDate = parseDate(state.startTime);
        const endDate = parseDate(state.endTime);

        const diffTime = endDate - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        duration = diffDays + 1;
      }

      const price = state.price * duration;
      return { ...state, total: price + beverageTotal + amenityTotal };
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
