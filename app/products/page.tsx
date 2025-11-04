'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, MenuItem, getAddons } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/ImageUploader';
import { uploadProductImage } from '@/lib/storage';

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnExists, setColumnExists] = useState<boolean | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
  });

  // Check if available_addons column exists
  useEffect(() => {
    const checkColumn = async () => {
      try {
        await getMenuItems();
        setColumnExists(true);
      } catch (error) {
        setColumnExists(false);
      }
    };
    checkColumn();
  }, []);

  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Product created successfully');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MenuItem> }) =>
      updateMenuItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Product updated successfully');
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          {/* Database Migration Warning */}
          {columnExists === false && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Database Migration Required:</strong> The addon assignment feature requires a database update. 
                <a href="/migrate" className="ml-2 text-blue-600 underline">Go to Migration Page</a> to fix this.
              </AlertDescription>
            </Alert>
          )}

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Products</h1>
              <p className="text-muted-foreground">
                Manage your menu items ({filteredProducts.length})
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Addon Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Total Products</p>
                    <p className="text-2xl font-bold">{filteredProducts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">With Addons</p>
                    <p className="text-2xl font-bold">
                      {filteredProducts.filter(p => p.available_addons && p.available_addons.length > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Without Addons</p>
                    <p className="text-2xl font-bold">
                      {filteredProducts.filter(p => !p.available_addons || p.available_addons.length === 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="h-48 bg-muted relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Badge variant="outline">€{product.price.toFixed(2)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    {product.available_addons && product.available_addons.length > 0 && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {product.available_addons.length} addon{product.available_addons.length > 1 ? 's' : ''} available
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(product.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No products found</CardTitle>
                <CardDescription>
                  {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
                </CardDescription>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new menu item for your restaurant
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSubmit={(data) => updateMutation.mutate({ id: selectedProduct.id, updates: data })}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProductFormProps {
  product?: MenuItem;
  onSubmit: (data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => void;
  isLoading: boolean;
}

function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    description: product?.description || '',
    image_url: product?.image_url || '',
    calories: product?.calories || 0,
    protein: product?.protein || 0,
    rating: product?.rating || 0,
    type: product?.type || 'main',
    categories: product?.categories || [],
    available_addons: product?.available_addons || [],
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch addons for selection
  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: getAddons,
  });

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadProductImage(file, { folder: 'products' });
      setFormData(prev => ({ ...prev, image_url: url }));
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddonToggle = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      available_addons: prev.available_addons.includes(addonId)
        ? prev.available_addons.filter(id => id !== addonId)
        : [...prev.available_addons, addonId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Product Image</Label>
          <ImageUploader
            value={formData.image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
            onFileSelect={handleFileSelect}
            disabled={isUploading || isLoading}
          />
          {formData.image_url && (
            <p className="text-xs text-muted-foreground break-all">{formData.image_url}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            value={formData.protein}
            onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Available Addons Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Available Addons</Label>
          <p className="text-sm text-muted-foreground">
            Select which addons customers can choose for this product
          </p>
        </div>
        
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
                      const isSelected = formData.available_addons.includes(addon.id);
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
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No addons available</p>
            <p className="text-xs">Create addons first in the Addons section</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" className="flex-1" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isUploading} className="flex-1">
          {(isLoading || isUploading) ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}