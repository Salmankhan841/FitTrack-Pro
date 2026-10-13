// Mock delay to simulate real network request
const mockDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loginUser = async (credentials) => {
  await mockDelay(600);
  
  const emailLower = credentials.email.toLowerCase().trim();

  // Super Admin Login
  if (emailLower === 'admin@fitnesstracker.com' || emailLower === 'admin@admin.com') {
    if (credentials.password === 'Salman987$') {
      return {
        data: {
          user: { 
            id: 999, 
            name: 'Super Admin', 
            email: 'admin@fitnesstracker.com',
            role: 'admin'
          },
          token: 'mock-jwt-admin-token-12345'
        }
      };
    } else {
      throw { response: { data: { message: 'Invalid admin password. (Use: Salman987$)' } } };
    }
  }

  // Regular User Login (any valid email and non-empty password)
  if (credentials.email && credentials.password) {
    const displayName = credentials.email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    
    return {
      data: {
        user: { 
          id: Date.now(), 
          name: formattedName || 'Fitness Athlete', 
          email: credentials.email,
          role: 'user',
          age: 26,
          weight: 78.5,
          height: 182,
          gender: 'Male'
        },
        token: 'mock-jwt-user-token-' + Date.now()
      }
    };
  }

  throw { response: { data: { message: 'Please enter a valid email and password' } } };
};

export const registerUser = async (userData) => {
  await mockDelay(600);
  return {
    data: {
      user: { 
        id: Date.now(), 
        name: userData.name, 
        email: userData.email,
        role: 'user',
        age: 25,
        weight: 75,
        height: 180,
        gender: 'Male'
      },
      token: 'mock-jwt-token-' + Date.now()
    }
  };
};

export const logoutUser = async () => {
  await mockDelay(300);
  return { data: { success: true } };
};
