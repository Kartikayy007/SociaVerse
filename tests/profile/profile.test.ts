import axios from 'axios'

const API_URL = 'http://localhost:3000';

describe('User Info Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    const username = {
      name: 'kartikay',
      email: 'kartikay' + Math.random() + '@gmail.com',
      password: '1234@abcd'
    }

    const response = await axios.post(`${API_URL}/api/v1/signup`, username, {
      headers: { 'Content-Type': 'application/json' }
    })

    token = response.data.token;
  })

  test('creating profile', async () => {
    const profile = {
      bio: "this is example bio",
      avatar: 2
    }

    const response = await axios.post(`${API_URL}/api/v1/profile`, profile, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200)
  })

  test('updating profile', async () => {
    const updatedProfile = {
      bio: "this is updated bio",
      avatar: 3
    }

    const response = await axios.put(`${API_URL}/api/v1/profile`, updatedProfile, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200)
  })

  test('getting profile', async () => {
    const response = await axios.get(`${API_URL}/api/v1/profile`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200)
  })

  test('creating profile with invalid data', async () => {
    const invalidProfile = {
      bio: "",
      avatar: -1
    }
    const response = await axios.post(`${API_URL}/api/v1/profile`, invalidProfile, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.status).toBe(400)
  })

  test('updating profile with invalid data', async () => {
    const invalidProfile = {
      bio: "", 
      avatar: -1
    }
    
    const response = await axios.put(`${API_URL}/api/v1/profile`, invalidProfile, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.status).toBe(400)  
  })
})