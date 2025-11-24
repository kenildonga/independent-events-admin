import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Get the pathname of the request
    const { pathname } = request.nextUrl

    // Define public routes that don't require authentication
    const publicRoutes = ['/login']

    // Define static assets and API routes to skip
    const skipRoutes = [
        '/_next',
        '/api',
        '/favicon.ico',
        '/public'
    ]

    // Check if the current path should be skipped
    const shouldSkip = skipRoutes.some(route => pathname.startsWith(route))
    if (shouldSkip) {
        return NextResponse.next()
    }

    // Get the token from cookies
    const token = request.cookies.get('token')?.value

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If user is authenticated and trying to access login page, redirect to users
    if (token && isPublicRoute) {
        const usersUrl = new URL('/users', request.url)
        return NextResponse.redirect(usersUrl)
    }

    // If it's a public route and no token, allow the request to continue
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // If no token is found in cookies, redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url)

        // Add the current path as a redirect parameter
        // so users can be redirected back after login
        if (pathname !== '/') {
            loginUrl.searchParams.set('redirect', pathname)
        }

        return NextResponse.redirect(loginUrl)
    }

    // If token exists, allow the request to continue
    // You can add additional token validation here if needed
    // For example, you could make an API call to validate the token
    return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
    ],
}