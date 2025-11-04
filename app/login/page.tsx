'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Only show config error in development
    if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
      setConfigError(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Attempting login...');
    console.log('Email:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ Login successful!', data.user);
        console.log('🔄 Redirecting to dashboard...');
        
        // Wait a moment for session to be set, then redirect
        setTimeout(() => {
          console.log('🔄 Executing redirect now...');
          window.location.replace('/');
        }, 500);
      } else {
        throw new Error('Login failed - no user data returned');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Configuration Required</CardTitle>
            <CardDescription className="text-center">
              Admin dashboard needs to be configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Missing Environment Variables</strong>
                <p className="mt-2">The admin dashboard is not configured yet.</p>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">Quick Setup (5 minutes):</h3>
              
              <div className="space-y-2 text-sm">
                <p><strong>1. Create .env.local file</strong></p>
                <p className="text-xs text-gray-600 ml-4">Location: <code className="bg-gray-200 px-1 rounded">admin-dashboard/.env.local</code></p>
                
                <p className="mt-3"><strong>2. Add these variables:</strong></p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto ml-4">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key`}
                </pre>
                
                <p className="mt-3"><strong>3. Get credentials from:</strong></p>
                <p className="text-xs text-gray-600 ml-4">
                  <a 
                    href="https://app.supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://app.supabase.com
                  </a>
                  {' '}→ Settings → API
                </p>
                
                <p className="mt-3"><strong>4. Restart the server:</strong></p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs ml-4">
npm run admin:dev
                </pre>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>📚 Detailed Instructions:</strong>
                <ul className="mt-2 text-sm space-y-1 ml-4 list-disc">
                  <li>See: <code>FIX_ADMIN_PANEL_NOW.md</code></li>
                  <li>See: <code>ENV_SETUP_GUIDE.md</code></li>
                  <li>See: <code>SETUP_STEPS.md</code></li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                I've Added the Configuration - Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the Musti Place dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mustiapp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
              <strong>💡 Make sure:</strong>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>User is created in Supabase Auth</li>
                <li>Email is confirmed</li>
                <li>Using correct password</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>This is a protected admin area.</p>
            <p className="mt-1">Create an account in Supabase first.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
