import { Redirect, Slot, Tabs } from "expo-router";
import useAuthStore from "../../store/auth.store";
import { TabBarIconProps } from "../../type";
import { Image, Text, View } from "react-native";
import { images } from "../../constants";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';

const TabBarIcon = ({ focused, icon }: { focused: boolean; icon: any }) => (
  <View style={{ 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 24,
    height: 24,
  }}>
    <Image 
      source={icon} 
      tintColor={focused ? Colors.primary[500] : Colors.neutral[400]}
      style={{ 
        width: 24, 
        height: 24,
      }} 
      resizeMode="contain"
    />
  </View>
);

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  // Allow browsing without authentication
  // Login will be required only when placing orders

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 0,
        marginBottom: 0,
      },
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[200],
        height: 65,
        paddingBottom: 8,
        paddingTop: 8,
        paddingHorizontal: 8,
        ...Shadows.lg,
      },
      tabBarActiveTintColor: Colors.primary[500],
      tabBarInactiveTintColor: Colors.neutral[500],
      tabBarIconStyle: {
        marginTop: 0,
        marginBottom: 0,
      },
    }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={images.home} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={images.search} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='cart'
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={images.bag} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='orders'
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={images.clock} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={images.person} focused={focused} />
        }}
      />
    </Tabs>
  );
}