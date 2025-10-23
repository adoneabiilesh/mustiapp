// Professional image sources for food app
export const ImageSources = {
  // High-quality food images from Unsplash
  getFoodImage: (foodName: string, width: number = 400, height: number = 300) => {
    const encodedName = encodeURIComponent(foodName);
    return `https://images.unsplash.com/photo-${getRandomPhotoId()}?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`;
  },
  
  // Specific food categories
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  drink: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  
  // Restaurant/Chef images
  chef: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  
  // Placeholder for missing images
  placeholder: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
};

// Random photo IDs for variety
const photoIds = [
  '1565299624946-b28f40a0ca4b',
  '1513104890138-7c749659a591',
  '1568901346375-23c9450c58cd',
  '1621996346565-e3dbc353d2e5',
  '1512621776951-a57141f2eefd',
  '1551024506-0bccd828d307',
  '1544148103-0773bf10d330',
  '1583394838336-acd977736f90',
  '1517248135467-4c7edcad34c4',
];

function getRandomPhotoId(): string {
  return photoIds[Math.floor(Math.random() * photoIds.length)];
}

// Food category mapping
export const FoodCategories = {
  pizza: 'Italian',
  burger: 'American',
  pasta: 'Italian',
  salad: 'Healthy',
  dessert: 'Sweet',
  drink: 'Beverage',
  sushi: 'Japanese',
  tacos: 'Mexican',
  curry: 'Indian',
  steak: 'Grilled',
};
