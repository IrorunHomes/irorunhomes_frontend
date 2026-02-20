// services/propertyService.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { 
  Property,
  PropertyFlatData  // Changed from PropertyFormData to PropertyFlatData
} from '../types/property';
import { User } from '../types/auth';
import { cookieService } from '../lib/cookies';

// Base URL for property endpoints
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/properties`;

// Create Axios instance for public endpoints (no auth required)
const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't send credentials for public endpoints
  withCredentials: false,
});

// Create Axios instance for authenticated endpoints
const authApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth interceptor only to authenticated API
authApi.interceptors.request.use(
  (config) => {
    const token = cookieService.getAuthToken?.() || cookieService.get?.('accessToken');
    
    // Add Authorization header - this ensures the token is sent
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found for Authorization header');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling (for both APIs)
const responseErrorHandler = (error: AxiosError) => {
  console.error('🚨 API Response Error:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url
  });

  // Handle 401 Unauthorized errors
  if (error.response?.status === 401) {
    console.error('🔐 Authentication failed - 401 Unauthorized');
    // Clear invalid tokens
    cookieService.clearAuthToken?.();
    cookieService.remove?.('accessToken');
    
    // Redirect to login or trigger auth refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-required'));
    }
  }

  return Promise.reject(error);
};

publicApi.interceptors.response.use(
  (response) => response,
  responseErrorHandler
);

authApi.interceptors.response.use(
  (response) => response,
  responseErrorHandler
);

// Define specific response interfaces for each endpoint
interface PropertiesResponse {
  properties: Property[];
  count: number;
}

interface PropertyResponse {
  property: Property & { userId: User };
}

interface FavoriteResponse {
  favourites: Property[];
  count: number;
}

interface MessageResponse {
  message: string;
}

// Updated interface to match your actual API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  properties?: Property[];
  count?: number;
  favourites?: Property[];
  property?: Property;
  updatedProperty?: Property;
}

class PropertyService {
  /**
   * Safely extract data from API response
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!response || !response.data) {
      throw new Error('No response received from server');
    }

    const apiResponse: ApiResponse<T> = response.data;
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Request failed');
    }

    // Handle different response structures from your API
    if (apiResponse.data !== undefined) {
      return apiResponse.data;
    }

    // For endpoints that return properties directly
    if (apiResponse.properties !== undefined) {
      return { 
        properties: apiResponse.properties, 
        count: apiResponse.count || apiResponse.properties.length 
      } as unknown as T;
    }

    // For favorites endpoint
    if (apiResponse.favourites !== undefined) {
      return { 
        favourites: apiResponse.favourites, 
        count: apiResponse.count || apiResponse.favourites.length 
      } as unknown as T;
    }

    // For single property endpoint
    if (apiResponse.property !== undefined) {
      return { property: apiResponse.property } as unknown as T;
    }

    // For updated property endpoint
    if (apiResponse.updatedProperty !== undefined) {
      return { updatedProperty: apiResponse.updatedProperty } as unknown as T;
    }

    // If we have success but no data, return empty object
    return {} as T;
  }

  // --- Authenticated Property Methods (Token Required) ---

  // Lists a new property - REQUIRES TOKEN
  async listNewProperty(
    payload: PropertyFlatData,  // Changed from PropertyFormData
    imageFiles: File[], 
    videoFiles: File[]
  ): Promise<PropertyResponse> {
    try {
      const formData = new FormData();

      console.log('🚀 Sending property data:');

      // Append ALL properties from payload as FLAT FIELDS
      Object.entries(payload).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          console.log(`⚠️ Skipping ${key}: null/undefined`);
          return;
        }
        
        // Convert value to string based on type
        let stringValue: string;
        
        if (typeof value === 'boolean') {
          stringValue = value ? 'true' : 'false';
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else if (Array.isArray(value)) {
          // For arrays, join with commas (backend expects string for amenities/extras)
          stringValue = value.join(',');
        } else if (typeof value === 'object' && value instanceof Date) {
          // For Date objects, convert to ISO string
          stringValue = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          // For other objects, stringify them
          stringValue = JSON.stringify(value);
        } else {
          stringValue = String(value);
        }
        
        console.log(`📝 ${key}: ${stringValue}`);
        formData.append(key, stringValue);
      });

      // Append files - backend expects 'images' and 'videos' field names
      imageFiles.forEach((file, index) => {
        console.log(`🖼️ Image ${index + 1}: ${file.name}`);
        formData.append('images', file, file.name);
      });

      // Append videos - backend expects only one video
      if (videoFiles.length > 0) {
        // Only send the first video (backend accepts only one)
        const videoFile = videoFiles[0];
        console.log(`🎥 Video: ${videoFile.name}`);
        formData.append('videos', videoFile, videoFile.name);
      }

      // Debug: Show what's being sent
      console.log('📋 Final FormData to be sent:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File (${value.name})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await authApi.post<ApiResponse<PropertyResponse>>(
        `/list-property`, 
        formData, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return this.handleResponse<PropertyResponse>(response);
      
    } catch (error) {
      console.error('❌ Error listing new property:', error);
      
      if (error instanceof AxiosError) {
        console.error('🔍 AxiosError details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Log the specific error message from backend
        if (error.response?.data) {
          console.error('📋 Backend error response:', error.response.data);
        }
      }
      
      throw error;
    }
  }

  // Fetches all public properties no checks
  async getAllPublicProperties(): Promise<PropertiesResponse> {
    try {
      const response = await publicApi.get<ApiResponse<PropertiesResponse>>(`/public`);
      return this.handleResponse<PropertiesResponse>(response);
    } catch (error) {
      console.error('Error fetching all public properties:', error);
      throw error;
    }
  }

  // Fetches a single public property by ID
  async getPublicProperty(id: string): Promise<PropertyResponse> {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }
      const response = await publicApi.get<ApiResponse<PropertyResponse>>(`/public/${id}`);
      return this.handleResponse<PropertyResponse>(response);
    } catch (error) {
      console.error(`Error fetching public property ${id}:`, error);
      throw error;
    }
  }

  // Admin get all properties - REQUIRES TOKEN
  async getAdminAllProperties(): Promise<PropertiesResponse> {
    try {
      const response = await authApi.get<ApiResponse<PropertiesResponse>>(`/all-properties`);
      return this.handleResponse<PropertiesResponse>(response);
    } catch (error) {
    if (error instanceof Error) {
      throw error;
    }      throw error;
    }
  }

  // Admin get single property - REQUIRES TOKEN
  async getAdminProperty(id: string): Promise<PropertyResponse> {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }
      const response = await authApi.get<ApiResponse<PropertyResponse>>(`/property/${id}`);
      return this.handleResponse<PropertyResponse>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    if (error instanceof Error) {
      throw error;
    }      throw error;
    }
  }

  async updateProperty(
    id: string, 
    formData: FormData
  ): Promise<{ updatedProperty: Property }> {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }      
            
      const response = await authApi.put<ApiResponse<{ updatedProperty: Property }>>(
        `/update-property/${id}`, 
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
        }
      );
            
      // Ensure we always return an updatedProperty
      const result = this.handleResponse<{ updatedProperty: Property }>(response);
      if (!result.updatedProperty) {
        throw new Error('No updated property returned from server');
      }
      
      return result;
      
    } catch (error) {
    if (error instanceof Error) {
      throw error;
    }      
      if (error instanceof AxiosError) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      throw error;
    }
  }

  // Helper method to prepare FormData for property updates
  prepareUpdateFormData(updates: Partial<PropertyFlatData>): FormData {
    const formData = new FormData();
    
    // Append all update fields as flat fields
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      // Convert value to string based on type
      if (Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else if (typeof value === 'object' && value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });
    
    return formData;
  }

  // Deletes a property - REQUIRES TOKEN
  async deleteProperty(id: string): Promise<{ message: string }> {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }
            
      const response = await authApi.delete<ApiResponse<{ message: string }>>(`/delete-property/${id}`);
      
      return this.handleResponse<{ message: string }>(response);
      
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      
      if (error instanceof AxiosError) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      throw error;
    }
  }

  // --- Favourites Methods (REQUIRE TOKEN) ---

  async addFavorite(propertyId: string): Promise<MessageResponse> {
    try {
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      const response = await authApi.post<ApiResponse<MessageResponse>>(`/add-favorite/${propertyId}`);
      return this.handleResponse<MessageResponse>(response);
    } catch (error) {
      console.error(`Error adding favorite ${propertyId}:`, error);
      throw error;
    }
  }

  async removeFavorite(propertyId: string): Promise<MessageResponse> {
    try {
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      const response = await authApi.delete<ApiResponse<MessageResponse>>(`/remove-favorite/${propertyId}`);
      return this.handleResponse<MessageResponse>(response);
    } catch (error) {
      console.error(`Error removing favorite ${propertyId}:`, error);
      throw error;
    }
  }

  async getFavorites(): Promise<FavoriteResponse> {
    try {
      const response = await authApi.get<ApiResponse<FavoriteResponse>>(`/my-favourites`);
      return this.handleResponse<FavoriteResponse>(response);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }
}

export const propertyService = new PropertyService();