const API_BASE_URL = 'http://localhost:5000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  // Remove content-type for FormData (handled by browser)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Authentication expired');
  }
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
}

// Auth related functions
export async function login(username: string, password: string) {
  return authenticatedFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, password: string) {
  return authenticatedFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
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