'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddons, createAddon, updateAddon, deleteAddon } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Package, Euro, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const addonSchema = z.object({
  name: z.string().min(1, 'Addon name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Price must be a non-negative number'
  ),
  type: z.enum(['size', 'addon', 'spice'], {
    required_error: 'Please select an addon type',
  }),
  is_required: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type AddonFormData = z.infer<typeof addonSchema>;

export default function AddonsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any>(null);
  const [deleteAddonId, setDeleteAddonId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: addons, isLoading } = useQuery({
    queryKey: ['addons'],
    queryFn: getAddons,
  });

  const form = useForm<AddonFormData>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '0',
      type: 'addon',
      is_required: false,
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createAddon,
    onSuccess: (data) => {
      console.log('Addon created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('Addon created successfully!');
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Error creating addon:', error);
      toast.error(error.message || 'Failed to create addon');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAddon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('Addon updated successfully!');
      setIsDialogOpen(false);
      setEditingAddon(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update addon');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('Addon deleted successfully!');
      setDeleteAddonId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete addon');
    },
  });

  const handleSubmit = (data: AddonFormData) => {
    console.log('Form data:', data);
    
    try {
      const addonData = {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        type: data.type,
        is_required: data.is_required || false,
        is_active: data.is_active !== false,
      };

      console.log('Processed addon data:', addonData);

      if (editingAddon) {
        console.log('Updating addon:', editingAddon.id);
        updateMutation.mutate({ id: editingAddon.id, data: addonData });
      } else {
        console.log('Creating new addon');
        createMutation.mutate(addonData);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error processing form data');
    }
  };

  const handleEdit = (addon: any) => {
    setEditingAddon(addon);
    form.reset({
      name: addon.name,
      description: addon.description || '',
      price: addon.price.toString(),
      type: addon.type,
      is_required: addon.is_required || false,
      is_active: addon.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteAddonId(id);
  };

  const confirmDelete = () => {
    if (deleteAddonId) {
      deleteMutation.mutate(deleteAddonId);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'size': return 'bg-blue-100 text-blue-800';
      case 'addon': return 'bg-green-100 text-green-800';
      case 'spice': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'size': return <Package className="w-4 h-4" />;
      case 'addon': return <Plus className="w-4 h-4" />;
      case 'spice': return <Tag className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <Header />
          <div className="pt-16 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading addons...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Addons & Customizations</h1>
                <p className="text-gray-600 mt-1">Manage product addons, sizes, and spice levels</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingAddon(null);
                    form.reset({
                      name: '',
                      description: '',
                      price: '0',
                      type: 'addon',
                      is_required: false,
                      is_active: true,
                    });
                    setIsDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Addon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddon ? 'Edit Addon' : 'Create New Addon'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAddon ? 'Update the addon details below.' : 'Add a new addon or customization option for your products.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={(e) => {
                      console.log('Form submitted');
                      console.log('Form errors:', form.formState.errors);
                      console.log('Form values:', form.getValues());
                      form.handleSubmit(handleSubmit)(e);
                    }} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Extra Cheese, Large Size" {...field} />
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
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of the addon"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (€)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
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
                                <select 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="addon">Addon</option>
                                  <option value="size">Size</option>
                                  <option value="spice">Spice Level</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <FormField
                          control={form.control}
                          name="is_required"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                Required Selection
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                Active
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending || updateMutation.isPending}
                          className="min-w-[120px]"
                        >
                          {createMutation.isPending || updateMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {editingAddon ? 'Updating...' : 'Creating...'}
                            </div>
                          ) : (
                            editingAddon ? 'Update Addon' : 'Create Addon'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Addons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {addons?.map((addon: any) => (
                <Card key={addon.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(addon.type)}
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                      </div>
                      <Badge className={getTypeColor(addon.type)}>
                        {addon.type}
                      </Badge>
                    </div>
                    {addon.description && (
                      <CardDescription className="text-sm text-gray-600">
                        {addon.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Euro className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-lg">
                          €{addon.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {addon.is_required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {!addon.is_active && (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(addon)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(addon.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {addons?.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addons yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first addon or customization option.</p>
                <Button onClick={() => {
                  setEditingAddon(null);
                  form.reset({
                    name: '',
                    description: '',
                    price: '0',
                    type: 'addon',
                    is_required: false,
                    is_active: true,
                  });
                  setIsDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Addon
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteAddonId} onOpenChange={() => setDeleteAddonId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delete Addon</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this addon? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteAddonId(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
