'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMenuItem, updateMenuItem, getCategories, getAddons } from '@/lib/supabase';
import { uploadProductImage, updateProductImage } from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ImageUploader';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Price must be a positive number'
  ),
  description: z.string().optional(),
  calories: z.string().optional(),
  protein: z.string().optional(),
  rating: z.string().optional().refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 5),
    'Rating must be between 0 and 5'
  ),
  type: z.string().optional(),
  categories: z.array(z.string()).optional(),
  is_vegetarian: z.boolean().optional(),
  is_vegan: z.boolean().optional(),
  is_gluten_free: z.boolean().optional(),
  is_spicy: z.boolean().optional(),
  available_addons: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      description: '',
      calories: '',
      protein: '',
      rating: '',
      type: '',
      categories: [],
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_spicy: false,
    },
  });

  // Fetch product data
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['menu-item', productId],
    queryFn: () => getMenuItem(productId),
    enabled: !!productId,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: getAddons,
  });

  // Populate form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price.toString(),
        description: product.description || '',
        calories: product.calories?.toString() || '',
        protein: product.protein?.toString() || '',
        rating: product.rating?.toString() || '',
        type: product.type || '',
        categories: product.categories || [],
        is_vegetarian: product.is_vegetarian || false,
        is_vegan: product.is_vegan || false,
        is_gluten_free: product.is_gluten_free || false,
        is_spicy: product.is_spicy || false,
        available_addons: product.available_addons || [],
      });
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    }
  }, [product, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      let imageUrl = product?.image_url || '';

      // Upload/update image if new one selected
      if (imageFile) {
        toast.loading('Uploading image...');
        imageUrl = await updateProductImage(product?.image_url || null, imageFile, productId);
        toast.dismiss();
      }

      // Update product
      return await updateMenuItem(productId, {
        name: data.name,
        price: parseFloat(data.price),
        image_url: imageUrl,
        description: data.description || '',
        calories: data.calories ? parseInt(data.calories) : null,
        protein: data.protein ? parseInt(data.protein) : null,
        rating: data.rating ? parseFloat(data.rating) : null,
        type: data.type || '',
        categories: data.categories || [],
        available_addons: data.available_addons || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-item', productId] });
      toast.success('Product updated successfully');
      router.push('/products');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  const handleCategoryToggle = (categoryName: string) => {
    const currentCategories = form.getValues('categories') || [];
    const newCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter(c => c !== categoryName)
      : [...currentCategories, categoryName];
    form.setValue('categories', newCategories);
  };

  const handleAddonToggle = (addonId: string) => {
    const currentAddons = form.getValues('available_addons') || [];
    const newAddons = currentAddons.includes(addonId)
      ? currentAddons.filter(id => id !== addonId)
      : [...currentAddons, addonId];
    form.setValue('available_addons', newAddons);
  };

  if (productLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <Header />
          <div className="pt-16 p-6 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential details about the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cheeseburger Deluxe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (€) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="9.99" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your product..." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Product Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                  <CardDescription>Upload a new image or keep the existing one</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={imagePreview}
                    onChange={(url) => setImagePreview(url || '')}
                    onFileSelect={(file) => setImageFile(file)}
                  />
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>Optional nutritional and product information</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="350" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (0-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="5" 
                            placeholder="4.5" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Main Course" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Select categories for this product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {categories?.map((category) => {
                      const isSelected = form.watch('categories')?.includes(category.name);
                      return (
                        <Button
                          key={category.id}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => handleCategoryToggle(category.name)}
                        >
                          {category.name}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Available Addons */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Addons</CardTitle>
                  <CardDescription>Select which addons customers can choose for this product</CardDescription>
                </CardHeader>
                <CardContent>
                  {addons && addons.length > 0 ? (
                    <div className="space-y-4">
                      {/* Group addons by type */}
                      {['size', 'addon', 'spice'].map((type) => {
                        const typeAddons = addons.filter((addon: any) => addon.type === type);
                        if (typeAddons.length === 0) return null;
                        
                        return (
                          <div key={type} className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 capitalize">
                              {type === 'size' ? 'Size Options' : 
                               type === 'addon' ? 'Add-ons' : 
                               'Spice Levels'}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {typeAddons.map((addon: any) => {
                                const isSelected = form.watch('available_addons')?.includes(addon.id);
                                return (
                                  <Button
                                    key={addon.id}
                                    type="button"
                                    variant={isSelected ? 'default' : 'outline'}
                                    onClick={() => handleAddonToggle(addon.id)}
                                    className="text-xs"
                                  >
                                    {addon.name} {addon.price > 0 && `(+€${addon.price})`}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No addons available. Create addons first in the Addons section.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dietary Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle>Dietary Restrictions</CardTitle>
                  <CardDescription>Mark dietary restrictions for this product</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_vegetarian"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Vegetarian</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_vegan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Vegan</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_gluten_free"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Gluten Free</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_spicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Spicy</FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  size="lg"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
