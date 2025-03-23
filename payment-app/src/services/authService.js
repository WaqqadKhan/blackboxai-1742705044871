// Simulated user data store
let currentUser = null;
const users = [
  {
    id: 1,
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    name: 'John Doe',
    balance: 5000.00
  }
];

const authService = {
  // Login function
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          // Don't send password to frontend
          const { password, ...userWithoutPassword } = user;
          currentUser = userWithoutPassword;
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 300);
    });
  },

  // Register function
  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        if (users.some(u => u.email === userData.email)) {
          reject(new Error('User already exists'));
          return;
        }

        // Create new user
        const newUser = {
          id: users.length + 1,
          ...userData,
          balance: 0.00
        };
        users.push(newUser);

        // Log in the new user
        const { password, ...userWithoutPassword } = newUser;
        currentUser = userWithoutPassword;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        resolve(userWithoutPassword);
      }, 300);
    });
  },

  // Logout function
  logout: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentUser = null;
        localStorage.removeItem('user');
        resolve();
      }, 300);
    });
  },

  // Get current user
  getCurrentUser: () => {
    if (currentUser) {
      return currentUser;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      return currentUser;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getCurrentUser();
  }
};

export default authService;