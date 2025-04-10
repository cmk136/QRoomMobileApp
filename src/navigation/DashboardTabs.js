// src/navigation/DashboardTabs.js

import React, { useState } from 'react';
import { TouchableOpacity, Platform, StyleSheet, Text } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import RoomBookingScreen from '../screens/RoomBookingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const DashboardTabs = () => {
  const navigation = useNavigation();
  const [currentTab, setCurrentTab] = useState('Home');

  const getIconName = (routeName) => {
    switch (routeName) {
      case 'RoomBooking':
        return 'calendar-outline';
      case 'Profile':
        return 'person-outline';
      default:
        return 'ellipse';
    }
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => {
    const isActive = routeName === selectedTab;
    const iconColor = isActive ? '#1c1c1d' : '#28282a';
    const labelColor = isActive ? '#1c1c1d' : '#28282a';

    return (
      <TouchableOpacity
        style={styles.tabBarItem}
        onPress={() => {
          setCurrentTab(routeName);
          navigate(routeName);
        }}
      >
        <Ionicons name={getIconName(routeName)} size={24} color={iconColor} />
        <Text style={[styles.tabLabel, { color: labelColor }]}>{routeName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <CurvedBottomBarExpo.Navigator
      type="DOWN"
      circlePosition="CENTER"
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      backgroundColor="#f5f5f3"
      height={60}
      borderTopLeftRight
      shadowStyle={styles.shadow}
      tabBar={renderTabBar}
      onTabChange={(tabName) => setCurrentTab(tabName)}
      renderCircle={({ navigate }) => (
        <TouchableOpacity
          style={styles.btnCircle}
          onPress={() => {
            if (currentTab === 'Home') {
              navigation.navigate('QRScanner');
            } else {
              setCurrentTab('Home');
              navigate('Home');
            }
          }}
        >
          <Ionicons
            name={currentTab === 'Home' ? 'qr-code' : 'home-outline'}
            size={28}
            color="#1c1c1d"
          />
        </TouchableOpacity>
      )}
    >
      <CurvedBottomBarExpo.Screen name="RoomBooking" component={RoomBookingScreen} position="LEFT" />
      <CurvedBottomBarExpo.Screen name="Home" component={HomeScreen} position="CIRCLE" />
      <CurvedBottomBarExpo.Screen name="Profile" component={ProfileScreen} position="RIGHT" />
    </CurvedBottomBarExpo.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 30,
    ...Platform.select({
      android: { elevation: 5 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
});

export default DashboardTabs;
