'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { uploadProductImage } from '@/lib/storage';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Edit, Trash2, Calendar, Percent, Euro, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  image_url?: string;
  valid_from: string;
  valid_until: string;
  terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    image_url: '',
    valid_from: '',
    valid_until: '',
    terms: '',
    is_active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      setError(null);
      
      const imageUrl = await uploadProductImage(file, { folder: 'promotions' });
      setFormData({ ...formData, image_url: imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Load promotions
  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const promotionData = {
        ...formData,
        discount: parseFloat(formData.discount),
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      };

      if (editingPromotion) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editingPromotion.id);

        if (error) throw error;
        setSuccess('Promotion updated successfully!');
      } else {
        // Create new promotion
        const { error } = await supabase
          .from('promotions')
          .insert([promotionData]);

        if (error) throw error;
        setSuccess('Promotion created successfully!');
      }

      // Reset form and reload data
      setFormData({
        title: '',
        description: '',
        discount: '',
        discount_type: 'percentage',
        image_url: '',
        valid_from: '',
        valid_until: '',
        terms: '',
        is_active: true,
      });
      setEditingPromotion(null);
      setIsDialogOpen(false);
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      setError('Failed to save promotion');
    }
  };

  // Handle edit
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discount: promotion.discount.toString(),
      discount_type: promotion.discount_type,
      image_url: promotion.image_url || '',
      valid_from: promotion.valid_from ? new Date(promotion.valid_from).toISOString().split('T')[0] : '',
      valid_until: new Date(promotion.valid_until).toISOString().split('T')[0],
      terms: promotion.terms || '',
      is_active: promotion.is_active,
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Promotion deleted successfully!');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setError('Failed to delete promotion');
    }
  };

  // Toggle active status
  const toggleActive = async (promotion: Promotion) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promotion.is_active })
        .eq('id', promotion.id);

      if (error) throw error;
      setSuccess(`Promotion ${!promotion.is_active ? 'activated' : 'deactivated'} successfully!`);
      loadPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      setError('Failed to update promotion');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Promotions Management</h1>
              <p className="text-gray-600">Manage special offers and promotions</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPromotion(null);
              setFormData({
                title: '',
                description: '',
                discount: '',
                discount_type: 'percentage',
                image_url: '',
                valid_from: '',
                valid_until: '',
                terms: '',
                is_active: true,
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion ? 'Update the promotion details below.' : 'Fill in the details to create a new promotion.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., New Customer Special"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the promotion..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">
                    Discount {formData.discount_type === 'percentage' ? '(%)' : '(€)'} *
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '20' : '5.00'}
                    required
                  />
                </div>
                <div>
                  <Label>Promotion Image</Label>
                  <ImageUploader
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url || '' })}
                    onFileSelect={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until *</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  placeholder="e.g., Valid for new customers only. Minimum order €15."
                  rows={2}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPromotion ? 'Update' : 'Create'} Promotion
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
          </div>

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {promotion.image_url && (
                    <div className="w-48 h-32 relative">
                      <Image
                        src={promotion.image_url}
                        alt={promotion.title}
                        fill
                        className="object-cover"
                        unoptimized={promotion.image_url.includes('unsplash.com') || promotion.image_url.includes('placeholder.com')}
                        onError={(e) => {
                          console.log('Image failed to load:', promotion.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{promotion.title}</h3>
                        <p className="text-gray-600 mt-1">{promotion.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                          {promotion.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {isExpired(promotion.valid_until) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        {promotion.discount_type === 'percentage' ? (
                          <Percent className="w-4 h-4" />
                        ) : (
                          <Euro className="w-4 h-4" />
                        )}
                        <span>
                          {promotion.discount_type === 'percentage' 
                            ? `${promotion.discount}% OFF` 
                            : `€${promotion.discount} OFF`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Until {formatDate(promotion.valid_until)}</span>
                      </div>
                    </div>

                    {promotion.terms && (
                      <p className="text-sm text-gray-500 mb-4">{promotion.terms}</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(promotion)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(promotion)}
                      >
                        {promotion.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(promotion.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {promotions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No promotions yet</h3>
                <p className="text-gray-600 mb-4">Create your first promotion to get started.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Promotion
                </Button>
              </CardContent>
            </Card>
          )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
