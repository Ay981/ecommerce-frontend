import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always show the locale prefix
  localePrefix: 'always'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(es|fr|en)/:path*']
};
