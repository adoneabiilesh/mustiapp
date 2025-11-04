'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase, clearColumnExistsCache } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MigratePage() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationError, setMigrationError] = useState<string>('');

  const migrationMutation = useMutation({
    mutationFn: async () => {
      setMigrationStatus('running');
      setMigrationError('');

      try {
        // Test if the column already exists by trying to query it
        const { data: testData, error: testError } = await supabase
          .from('menu_items')
          .select('available_addons')
          .limit(1);

        if (testError && testError.message.includes('available_addons')) {
          // Column doesn't exist, show manual instructions
          setMigrationStatus('error');
          setMigrationError('Column does not exist. Please run the manual SQL commands in your Supabase dashboard.');
          toast.error('Please run the manual SQL commands in your Supabase dashboard.');
          return;
        }

        if (testError) {
          throw new Error(`Database connection error: ${testError.message}`);
        }

        // If we get here, the column exists
        setMigrationStatus('success');
        clearColumnExistsCache(); // Clear cache to refresh the check
        toast.success('Column already exists! The feature should work now.');
        
      } catch (error: any) {
        setMigrationStatus('error');
        setMigrationError(error.message);
        toast.error('Migration check failed: ' + error.message);
      }
    },
  });

  const handleMigration = () => {
    migrationMutation.mutate();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Database Migration</h1>
              <p className="text-muted-foreground">
                Add the available_addons column to the menu_items table
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Check Migration Status
                </CardTitle>
                <CardDescription>
                  Check if the available_addons column exists in your database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">What this check does:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Tests if the available_addons column exists</li>
                      <li>Verifies database connection</li>
                      <li>Provides next steps based on the result</li>
                    </ul>
                  </div>

                  {migrationStatus === 'idle' && (
                    <Button onClick={handleMigration} className="w-full">
                      Check Database Status
                    </Button>
                  )}

                  {migrationStatus === 'running' && (
                    <Button disabled className="w-full">
                      Checking Database...
                    </Button>
                  )}

                  {migrationStatus === 'success' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ Column exists! The addon assignment feature should work now. Try creating or editing a product.
                      </AlertDescription>
                    </Alert>
                  )}

                  {migrationStatus === 'error' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        ❌ Column missing: {migrationError}
                        <br />
                        <strong>Next step:</strong> Run the manual SQL commands below.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Migration (Required)</CardTitle>
                <CardDescription>
                  Run these SQL commands in your Supabase dashboard to add the missing column.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="mb-2">ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS available_addons JSONB DEFAULT '[]'::jsonb;</div>
                    <div className="mb-2">CREATE INDEX IF NOT EXISTS idx_menu_items_available_addons ON public.menu_items USING GIN (available_addons);</div>
                    <div>UPDATE public.menu_items SET available_addons = '[]'::jsonb WHERE available_addons IS NULL;</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Step-by-step instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                      <li>Select your project</li>
                      <li>Navigate to "SQL Editor" in the left sidebar</li>
                      <li>Copy and paste the SQL commands above</li>
                      <li>Click "Run" to execute the commands</li>
                      <li>Come back here and click "Check Database Status" to verify</li>
                    </ol>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">What this does:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                      <li>Adds the <code>available_addons</code> column to store addon IDs for each product</li>
                      <li>Creates an index for better query performance</li>
                      <li>Sets empty array for all existing products</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
