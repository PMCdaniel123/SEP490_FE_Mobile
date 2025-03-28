import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const bootstrapAsync = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch('http://35.78.210.59:8080/users/decodejwttoken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        if (response.ok) {
          const { claims } = await response.json();
          setUserToken(token);
          setUserData(claims);
        } else {
          throw new Error('Token không hợp lệ');
        }
      }
    } catch (e) {
      alert('Lỗi khi khôi phục token', e);
      await AsyncStorage.removeItem('userToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapAsync();
  }, [bootstrapAsync]);

  const login = useCallback(async (auth, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://35.78.210.59:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auth, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        await bootstrapAsync();
        return { 
          success: true, 
          message: data.notification || 'Đăng nhập thành công'
        };
      } else {
        return { 
          success: false, 
          message: data.notification || 'Đăng nhập thất bại'
        };
      }
    } catch (error) {
      alert('Lỗi đăng nhập:', error);
      return { 
        success: false, 
        message: 'Có lỗi xảy ra, vui lòng thử lại sau'
      };
    } finally {
      setIsLoading(false);
    }
  }, [bootstrapAsync]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      setUserData(null);
    } catch (e) {
      alert('Lỗi khi đăng xuất', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    isLoading,
    userToken,
    userData,
    login,
    logout,
  }), [isLoading, userToken, userData, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
