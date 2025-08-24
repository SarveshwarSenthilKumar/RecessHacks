const API_BASE_URL = 'http://localhost:5000';
const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  username: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  username?: string;
  error?: string;
  message?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  cookTime: string;
  rating: number;
  image: string;
  ingredients: string[];
  steps: string[];
}

export interface ImageAnalysis {
  analysis: string;
  image_url: string;
}

export async function authenticatedFetch<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  // Create a new headers object without modifying the original
  const headers = new Headers(options.headers);
  
  // Only set Content-Type if it's not FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for session handling
  });
  
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = typeof errorData === 'object' && errorData !== null 
      ? (errorData as { error?: string; message?: string }).error || 
        (errorData as { error?: string; message?: string }).message || 
        'Something went wrong'
      : 'Something went wrong';
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth related functions
export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('user', JSON.stringify({ username: data.username }));
  }
  
  return data;
}

export async function register(userData: {
  username: string;
  password: string;
  email: string;
  name: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('user', JSON.stringify({ username: data.username }));
  }
  
  return data;
}

export async function logout(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    localStorage.removeItem('user');
    return response.json();
  } catch (error) {
    console.error('Logout failed:', error);
    return { success: false, error: 'Failed to logout' };
  }
}

export async function checkAuth(): Promise<{ authenticated: boolean; username?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-auth`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return { authenticated: false };
    }
    
    return response.json();
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false };
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Recipe related functions
export async function generateRecipe(dishName: string): Promise<{ recipe: string }> {
  return authenticatedFetch('/api/generate-recipe', {
    method: 'POST',
    body: JSON.stringify({ dish_name: dishName }),
  });
}

export async function analyzeImage(file: File): Promise<ImageAnalysis> {
  const formData = new FormData();
  formData.append('file', file);
  
  return authenticatedFetch('/api/analyze-image', {
    method: 'POST',
    body: formData,
  });
}

export async function generateDishImage(dishName: string): Promise<{ image_url: string }> {
  return authenticatedFetch('/api/generate-dish-image', {
    method: 'POST',
    body: JSON.stringify({ dish_name: dishName }),
  });
}

// User profile functions
export async function getProfile() {
  return authenticatedFetch('/protected/profile');
}

export async function updateProfile(updates: any) {
  return authenticatedFetch('/protected/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Recipe management
export async function saveRecipe(recipe: Omit<Recipe, 'id'>) {
  return authenticatedFetch('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  });
}

export async function getRecipes(): Promise<Recipe[]> {
  return authenticatedFetch('/api/recipes');
}

export async function getRecipe(id: string): Promise<Recipe> {
  return authenticatedFetch(`/api/recipes/${id}`);
}

// Health check
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    return { status: 'unreachable', error: error.message };
  }
}

// Utility function to get full image URL
export function getImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}