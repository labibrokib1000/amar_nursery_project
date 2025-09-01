// API Test utility for debugging
export const testAPIConnection = async () => {
  const baseURL = import.meta.env.VITE_API_URL || 'https://amar-nursery-project-api.vercel.app/api';
  
  console.log('Testing API connection to:', baseURL);
  
  try {
    // Test the root endpoint
    const response = await fetch(baseURL.replace('/api', ''), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    
    if (!response.ok) {
      console.error('API Response not OK:', response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.text();
    console.log('API Response Data:', data);
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error('API Connection Error:', error);
    return { success: false, error: error.message };
  }
};

// Test products endpoint
export const testProductsAPI = async () => {
  const baseURL = import.meta.env.VITE_API_URL || 'https://amar-nursery-project-api.vercel.app/api';
  
  console.log('Testing Products API:', `${baseURL}/products`);
  
  try {
    const response = await fetch(`${baseURL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Products API Response Status:', response.status);
    
    if (!response.ok) {
      console.error('Products API Response not OK:', response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    console.log('Products API Response Data:', data);
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error('Products API Connection Error:', error);
    return { success: false, error: error.message };
  }
};
