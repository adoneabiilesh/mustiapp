import { Redirect, Slot, Tabs } from "expo-router";
import useAuthStore from "../../store/auth.store";
import { TabBarIconProps } from "../../type";
import { Image, Text, View } from "react-native";
import { images } from "../../constants";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';

const TabBarIcon = ({ focused, icon, title }: TabBarIconProps) => (
  <View style={{ 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 35, 
    paddingVertical: 2 
  }}>
    <Image 
      source={icon} 
      style={{ 
        width: 20, 
        height: 20, 
        marginBottom: 2,
        tintColor: focused ? Colors.primary[500] : Colors.neutral[400]
      }} 
      resizeMode="contain"
    />
    <Text style={{
      fontSize: 10,
      fontWeight: focused ? '600' : '500',
      color: focused ? Colors.primary[500] : Colors.neutral[500],
      textAlign: 'center',
    }}>
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/sign-in" />

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
      },
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[200],
        height: 70,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 8,
        paddingTop: 6,
        paddingHorizontal: 12,
        ...Shadows.lg,
      },
      tabBarActiveTintColor: Colors.primary[500],
      tabBarInactiveTintColor: Colors.neutral[500],
      tabBarIconStyle: {
        marginTop: 2,
      },
    }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Menu" icon={images.home} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Search" icon={images.search} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='cart'
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Cart" icon={images.bag} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='orders'
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Orders" icon={images.clock} focused={focused} />
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Profile" icon={images.person} focused={focused} />
        }}
      />
    </Tabs>
  );
}