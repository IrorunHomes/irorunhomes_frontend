// context/PropertyContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { propertyService } from '../api/propertyService';
import { useUser } from './UserContext';
import { Property, PropertyFlatData } from '../types/property';
import { AxiosError } from 'axios';
import { useMessage } from '../components/ui/MessagePopup';

// --- Context Types ---

interface PropertyContextType {
  properties: Property[];
  favorites: Property[];
  views: Property[];
  incrementViewCount: (propertyId: string) => Promise<void>;
  adminProperties: Property[];
  loadingProperties: boolean;
  loadingFavorites: boolean;
  loadingListNew: boolean;
  loadingUpdate: boolean;
  loadingDelete: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  fetchAdminProperties: () => Promise<void>;
  fetchAdminProperty: (id: string) => Promise<Property>; // New function
  fetchPublicProperty: (id: string) => Promise<Property>;
  addRemoveFavorite: (propertyId: string, isFavorite: boolean) => Promise<boolean>;
  fetchFavorites: () => Promise<void>;
  fetchViews: () => Promise<void>;
  listNewProperty: (
    payload: PropertyFlatData,
    imageFiles: File[], 
    videoFiles: File[]
  ) => Promise<{ success: boolean; property?: Property }>;
  updateProperty: (
    propertyId: string, 
    updates: Partial<PropertyFlatData>,
    newImages?: File[], 
    newVideos?: File[]
  ) => Promise<{ success: boolean; updatedProperty?: Property; message?: string }>;
  clearError: () => void;
  deleteProperty: (propertyId: string) => Promise<{ success: boolean; message?: string }>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// --- Context Provider ---
export function PropertyProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [views, setViews] = useState<Property[]>([]);
  const [adminProperties, setAdminProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingListNew, setLoadingListNew] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess } = useMessage();

  // Clear error when state changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // --- Fetching Logic ---
  const fetchProperties = useCallback(async () => {
    setLoadingProperties(true);
    setError(null);
    try {
      const response = await propertyService.getAllPublicProperties();
      const propertiesData = response.properties || [];
      setProperties(propertiesData);
    } catch (err: unknown) {
      console.error('Failed to fetch properties:', err);
      let errorMessage = 'Failed to load properties. Please try again.';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          errorMessage = 'Properties endpoint not found.';
        } else if ((err.response?.status ?? 0) >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = err.response?.data?.message || err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  // Fetch single admin property by ID
  const fetchAdminProperty = useCallback(async (id: string): Promise<Property> => {
    if (!user) {
      throw new Error('You must be logged in to view property details');
    }

    try {
      const response = await propertyService.getAdminProperty(id);
      return response.property;
    } catch (err: unknown) {
      console.error(`Failed to fetch admin property ${id}:`, err);
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          throw new Error('Please log in to view property details');
        } else if (err.response?.status === 403) {
          throw new Error('You do not have permission to view this property');
        } else if (err.response?.status === 404) {
          throw new Error('Property not found');
        } else {
          throw new Error(err.response?.data?.message || err.message || 'Failed to fetch property');
        }
      }
      
      throw err;
    }
  }, [user]);

  // View public property by id and increment view count
  const incrementViewCount = useCallback(async (propertyId: string): Promise<void> => {
    try {
      await propertyService.incrementViews(propertyId);
    } catch (error) {
      console.error(`Error incrementing views for property ${propertyId}:`, error);
    }
  }, []);

  const fetchPublicProperty = useCallback(async (id: string): Promise<Property> => {
    try {
      const response = await propertyService.getPublicProperty(id);
      return response.property;
    } catch (err: unknown) {
      console.error(`Failed to fetch public property ${id}:`, err);
      throw err;
    }
  }, []);

  // Fetch admin properties
  const fetchAdminProperties = useCallback(async () => {
    if (userLoading || !user) {
      setAdminProperties([]);
      return;
    }
    
    setLoadingProperties(true);
    setError(null);
    try {
      const response = await propertyService.getAdminAllProperties();
      const propertiesData = response.properties || [];
      setAdminProperties(propertiesData);
    } catch (err: unknown) {
      console.error('Failed to fetch admin properties:', err);
      setError('Failed to load admin properties.');
      setAdminProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  }, [user, userLoading]);

  const fetchFavorites = useCallback(async () => {
    if (userLoading || !user) {
      setFavorites([]);
      return;
    }

    setLoadingFavorites(true);
    try {
      const response = await propertyService.getFavorites();
      const favoritesData = response.favourites || [];
      setFavorites(favoritesData);
    } catch (err: unknown) {
      console.error('Failed to fetch favorites:', err);
      setFavorites([]);
    } finally {
      setLoadingFavorites(false);
    }
  }, [user, userLoading]);

  // Fetch favorites whenever the user changes
  useEffect(() => {
    if (!userLoading) {
      fetchFavorites();
    }
  }, [user, userLoading, fetchFavorites]);

  // --- Action Logic ---
  const addRemoveFavorite = useCallback(async (propertyId: string, isFavorite: boolean): Promise<boolean> => {
    if (!user) {
      setError("You must be logged in to manage favorites.");
      return false;
    }

    try {
      if (isFavorite) {
        await propertyService.removeFavorite(propertyId);
        setFavorites(prev => prev.filter(p => p._id !== propertyId));
        showSuccess('Property removed from favorites');
      } else {
        await propertyService.addFavorite(propertyId);
        await fetchFavorites();
        showSuccess('Property added to favorites');
      }
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Failed to update favorites.';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          errorMessage = 'Please log in to manage favorites.';
        } else {
          errorMessage = err.response?.data?.message || err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return false;
    }
  }, [user, fetchFavorites]);


  // fetch properties viewed by the user
  const fetchViews = useCallback(async () => {
    if (userLoading || !user) {
      return;
    }

    try {
      const response = await propertyService.getViews();
      const viewsData = response.views || [];
      setViews(viewsData);
    } catch (err: unknown) {
      console.error('Failed to fetch views:', err);
    }
  }, [user, userLoading]);

  // New property listing - updated to accept flat data
  const listNewProperty = useCallback(async (
    payload: PropertyFlatData,
    imageFiles: File[], 
    videoFiles: File[]
  ): Promise<{ success: boolean; property?: Property; }> => {
    if (!user) {
      setError("You must be logged in to list a new property.");
      return { success: false };
    }

    const userRole = user.role?.toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    
    if (!isAdmin) {
      setError("Only administrators can list properties. Please contact your system administrator.");
      showSuccess("Only administrators can list properties. Please contact your system administrator.");
      return { success: false };
    }

    setLoadingListNew(true);
    setError(null);

    try {
      const response = await propertyService.listNewProperty(payload, imageFiles, videoFiles);
      await fetchAdminProperties();

      showSuccess('Property listed successfully');
      
      return {
        success: true,
        property: response.property,
      };
      
    } catch (err: unknown) {
      console.error('Failed to list new property:', err);
      let errorMessage = 'Failed to create property listing. Please try again.';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          errorMessage = 'Please log in to list properties.';
        } else if (err.response?.status === 403) {
          errorMessage = err.response?.data?.message || 'You do not have permission to list properties. Only administrators can perform this action.';
        } else {
          errorMessage = err.response?.data?.message || err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoadingListNew(false);
    }
  }, [user, fetchAdminProperties]);

  // Update property function - updated to accept flat data
  const updateProperty = useCallback(async (
    propertyId: string,
    updates: Partial<PropertyFlatData>,
    newImages: File[] = [],
    newVideos: File[] = []
  ): Promise<{ success: boolean; updatedProperty?: Property; message?: string }> => {
    if (!user) {
      setError("You must be logged in to update a property.");
      showSuccess("You must be logged in to update a property.");
      return { success: false, message: "You must be logged in to update a property." };
    }

    setLoadingUpdate(true);
    setError(null);

    try {
      const formData = new FormData();

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      newImages.forEach(file => {
        formData.append('newImages', file, file.name);
      });

      newVideos.forEach(file => {
        formData.append('newVideos', file, file.name);
      });

      const response = await propertyService.updateProperty(propertyId, formData);
      
      if (response.updatedProperty) {
        setProperties(prev => prev.map(prop => 
          prop._id === propertyId ? response.updatedProperty! : prop
        ));
        
        setAdminProperties(prev => prev.map(prop => 
          prop._id === propertyId ? response.updatedProperty! : prop
        ));

        showSuccess('Property updated successfully');

        return {
          success: true,
          updatedProperty: response.updatedProperty
        };
      } else {
        return {
          success: false,
          message: "No updated property returned from server"
        };
      }

    } catch (err: unknown) {
      console.error('Failed to update property:', err);
      let errorMessage = 'Failed to update property. Please try again.';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          errorMessage = 'Please log in to update properties.';
        } else if (err.response?.status === 403) {
          errorMessage = err.response?.data?.message || 'You do not have permission to update this property.';
        } else {
          errorMessage = err.response?.data?.message || err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoadingUpdate(false);
    }
  }, [user]);

  // Delete a Property
  const deleteProperty = useCallback(async (propertyId: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      setError("You must be logged in to delete a property.");
      return { success: false, message: "You must be logged in to delete a property." };
    }

    setLoadingDelete(true);
    setError(null);

    try {
      await propertyService.deleteProperty(propertyId);
      
      setProperties(prev => prev.filter(p => p._id !== propertyId));
      setAdminProperties(prev => prev.filter(p => p._id !== propertyId));
      setFavorites(prev => prev.filter(p => p._id !== propertyId));
      showSuccess('Property deleted successfully');

      return { success: true };

    } catch (err: unknown) {
      console.error('Failed to delete property:', err);
      let errorMessage = 'Failed to delete property. Please try again.';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          errorMessage = 'Please log in to delete properties.';
        } else if (err.response?.status === 403) {
          errorMessage = err.response?.data?.message || 'You do not have permission to delete this property.';
        } else {
          errorMessage = err.response?.data?.message || err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoadingDelete(false);
    }
  }, [user]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const value: PropertyContextType = {
    properties,
    favorites,
    views,
    adminProperties,
    fetchAdminProperties,
    fetchAdminProperty,
    fetchPublicProperty,
    loadingProperties,
    loadingFavorites,
    loadingListNew,
    loadingUpdate,
    loadingDelete,
    error,
    fetchProperties,
    fetchFavorites,
    fetchViews,
    addRemoveFavorite,
    listNewProperty,
    incrementViewCount,
    updateProperty,
    deleteProperty,
    clearError,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

// --- Hook for Components ---
export function useProperty() {
  const context = useContext(PropertyContext);
  
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  
  return context;
}