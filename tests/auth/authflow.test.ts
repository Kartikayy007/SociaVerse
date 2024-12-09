import axios from 'axios';

const API_URL = 'http://localhost:3000';

describe('Auth Tests', () => {
  describe('Signup', () => {
    test('User can signup with email and password', async () => {
      const user = {
        name: 'kartikay',
        email: 'kartikay' + Math.random() + '@gmail.com',
        password: '1234@abcd'
      };

      const response = await axios.post(`${API_URL}/api/v1/signup`, user, {
        headers: {'Content-Type': 'application/json'}
      });

      expect(response.status).toBe(200);

      const updatedResponse = await axios.post(`${API_URL}/api/v1/signup`, user, {
        headers: { 'Content-Type': 'application/json' }
      })

      expect(updatedResponse).toBe(400);
    });

    test('Should fail signup with invalid email', async () => {
      const user = {
        email: 'invalid-email',
        password: '1234@abcd'
      };
      
      const response = await axios.post(`${API_URL}/api/v1/signup`, user, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      expect(response.status).toBe(400);
    });

    test('Should fail signup with short password', async () => {
      const user = {
        name: 'kartikay',
        email: 'test@gmail.com',
        password: '123' 
      };

      const response = await axios.post(`${API_URL}/api/v1/signup`, user, {
        headers: { 'content-Type': 'application/json' }
      })

      expect(response.status).toBe(400)
    });

  });

  describe('OAuth', () => {
    test('Can login with Google OAuth', async () => {
      const mockGoogleToken = 'mock_google_token';
      
      const response = await axios.post(`${API_URL}/api/v1/auth/google`, {
        token: mockGoogleToken
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
    });

    test('Should fail with invalid OAuth token', async () => {
      const invalidToken = 'invalid_token';

      await expect(axios.post(`${API_URL}/api/v1/auth/google`, {
        token: invalidToken
      })).rejects.toThrow();
    });
  });

  describe('SignIn', () => {
    test('user can signin if email and passwords are correct', async () => {
      const user = {
        email: 'kartikay@gmail.com',
        password: '12345678'
      }

      const response = await axios.post(`${API_URL}/api/v1/signin`, user)

      expect(response.status).toBe(200);
      expect(response.data.token).toBeDefined()
    })

    test('signin fails if the username and the password are incorect', async () => {
      const user = {
        email: 'incorrect@gmail.com',
        password: 'incorrectpassword'
      }

      const response = await axios.post(`${API_URL}/api/v1/signin`, user)

      expect(response.status).toBe(403)
    })
  })

});