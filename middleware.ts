import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Check if environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If env vars not configured, allow access to login page only
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not configured');
    
    // In production, allow access to all pages (env vars should be set in Vercel)
    if (process.env.NODE_ENV === 'production') {
      return res;
    }
    
    // Allow login page
    if (req.nextUrl.pathname.startsWith('/login')) {
      return res;
    }
    
    // Redirect everything else to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Only import and use Supabase if env vars are present
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            res.cookies.set(name, value, options);
          },
          remove(name: string, options: any) {
            res.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If no session and not on login page, redirect to login
    if (!session && !req.nextUrl.pathname.startsWith('/login')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // If session exists and not on login page, allow access
    // (Removed strict admin email check for now - can be added back later)
    
    // If logged in and on login page, redirect to dashboard
    if (session && req.nextUrl.pathname.startsWith('/login')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login
    if (!req.nextUrl.pathname.startsWith('/login')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
    
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * 
     * TEMPORARILY DISABLED - letting all pages through for debugging
     */
    // '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
