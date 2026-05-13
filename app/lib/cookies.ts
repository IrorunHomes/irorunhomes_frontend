// lib/cookies.ts - Update for better compatibility
export const cookieService = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
          return decodeURIComponent(cookieValue);
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading cookie:', error);
      return null;
    }
  },

  set(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    
    try {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax;`;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  },

  remove(name: string): void {
    if (typeof document === 'undefined') return;
    
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.error('Error removing cookie:', error);
    }
  },

  getAuthToken(): string | null {
    return this.get('accessToken');
  },

  setAuthToken(token: string, days: number = 7): void {
    this.set('accessToken', token, days);
  },

  clearAuthToken(): void {
    this.remove('accessToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
};