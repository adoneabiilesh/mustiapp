import {View, Text, TouchableOpacity, Image} from 'react-native'
import {router} from "expo-router";
import {images} from "../constants";

interface CustomHeaderProps {
    title?: string;
}

const CustomHeader = ({ title = "Header" }: CustomHeaderProps) => {
    return (
        <View className="app-header">
            <TouchableOpacity 
                onPress={() => router.back()}
                className="size-10 bg-gray-100 rounded-full flex-center"
                activeOpacity={0.7}
            >
                <Image source={images.arrowBack} className="size-5" tintColor="#333" />
            </TouchableOpacity>
            
            <Text className="text-lg font-quicksand-bold text-secondary-900">
                {title}
            </Text>
            
            <View className="size-10" />
        </View>
    )
}

export default CustomHeader