'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface RefundDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RefundDialog({ order, open, onOpenChange }: RefundDialogProps) {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: async ({ orderId, amount, reason }: { 
      orderId: string; 
      amount: number; 
      reason: string; 
    }) => {
      // This would call your refund API endpoint
      // For now, we'll simulate the refund process
      console.log('Processing refund:', { orderId, amount, reason });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { success: true, refundId: `ref_${Date.now()}` };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Refund processed successfully! Refund ID: ${data.refundId}`);
      onOpenChange(false);
      setRefundAmount('');
      setRefundReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process refund');
    },
  });

  const handleRefund = async () => {
    if (!order) return;
    
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }
    
    if (amount > order.total) {
      toast.error('Refund amount cannot exceed order total');
      return;
    }
    
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setIsProcessing(true);
    try {
      await refundMutation.mutateAsync({
        orderId: order.id,
        amount,
        reason: refundReason.trim(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setRefundAmount('');
      setRefundReason('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Refund for Order #{order?.id.slice(-6)}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Order Total:</span>
                <span className="font-semibold">€{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Customer:</span>
                <span className="font-medium">{order.users?.name || 'Guest'}</span>
              </div>
            </div>

            {/* Refund Amount */}
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount (€)</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0"
                max={order.total}
                placeholder={`0.00 (max: €${order.total.toFixed(2)})`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason for Refund</Label>
              <Input
                id="refundReason"
                placeholder="e.g., Customer requested cancellation"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Warning */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This action cannot be undone. The refund will be processed immediately.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefund}
                disabled={isProcessing || !refundAmount || !refundReason}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Process Refund'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}