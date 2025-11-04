import {Text, TouchableOpacity, Image, View} from 'react-native'
import {MenuItem} from "@/type";
import {useCartStore} from "@/store/cart.store";
import {images} from "@/constants";

const MenuCard = ({ item: { $id, image_url, name, price }}: { item: MenuItem}) => {
    // Use image_url directly (it's already a public URL from Supabase or external source)
    const imageUrl = image_url;
    const { addItem } = useCartStore();

    return (
        <View className="food-card mb-4">
            <View className="food-card-image">
                <Image 
                    source={{ uri: imageUrl || 'https://via.placeholder.com/300x200' }} 
                    className="w-full h-full" 
                    resizeMode="cover" 
                />
            </View>
            <View className="food-card-overlay">
                <Text className="card-title" numberOfLines={1}>{name}</Text>
                <Text className="price-text">€{price.toFixed(2)}</Text>
            </View>
            <View className="food-card-heart">
                <Image source={images.star} className="size-5" tintColor="white" />
            </View>
            <TouchableOpacity 
                className="absolute bottom-3 right-3 bg-primary-500 rounded-full p-2"
                onPress={() => addItem({ id: $id, name, price, image_url: imageUrl, customizations: []})}
            >
                <Image source={images.plus} className="size-4" tintColor="white" />
            </TouchableOpacity>
        </View>
    )
}
export default MenuCard
