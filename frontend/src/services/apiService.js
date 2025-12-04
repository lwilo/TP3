import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  constructor() {
    this.keycloak = null;
  }

  setKeycloak(keycloak) {
    this.keycloak = keycloak;
  }

  getAuthHeaders() {
    if (!this.keycloak || !this.keycloak.token) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.keycloak.token}`
    };
  }

  async getCourses() {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createCourse(course) {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses`, course, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.error('Token invalid or expired');
        if (this.keycloak) {
          this.keycloak.login();
        }
      } else if (error.response.status === 403) {
        console.error('Access forbidden - insufficient permissions');
      }
    }
  }
}

export default new ApiService();
