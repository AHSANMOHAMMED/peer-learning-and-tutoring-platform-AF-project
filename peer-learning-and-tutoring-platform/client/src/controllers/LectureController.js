import { toast } from 'react-hot-toast';
import api from '../services/api';

class LectureController {
  constructor() {
    this.state = {
      courses: [],
      currentCourse: null,
      userCourses: [],
      currentSession: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    };
    
    this.listeners = new Map();
  }

  async getCourses(filters = {}) {
    try {
      this.setLoading(true);
      
      const response = await api.get('/api/lectures/courses', { params: filters });
      
      if (response.data.success) {
        const { courses, pagination } = response.data.data;
        this.setState({ 
          courses,
          pagination: {
            ...this.state.pagination,
            ...pagination
          }
        });
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting courses:', error);
      toast.error(error.response?.data?.message || 'Failed to get courses');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async getCourseDetails(courseId) {
    try {
      this.setLoading(true);
      
      const response = await api.get(`/api/lectures/courses/${courseId}`);
      
      if (response.data.success) {
        this.setState({ currentCourse: response.data.data.course });
        return response.data.data.course;
      }
    } catch (error) {
      console.error('Error getting course details:', error);
      toast.error(error.response?.data?.message || 'Failed to get course details');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async enrollInCourse(courseId) {
    try {
      this.setLoading(true);
      
      const response = await api.post(`/api/lectures/courses/${courseId}/enroll`);
      
      if (response.data.success) {
        toast.success(response.data.message);
        await this.getCourseDetails(courseId);
        await this.getUserCourses();
        return response.data.data;
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async getSessionDetails(courseId, sessionId) {
    try {
      this.setLoading(true);
      
      const response = await api.get(`/api/lectures/courses/${courseId}/sessions/${sessionId}`);
      
      if (response.data.success) {
        this.setState({ currentSession: response.data.data.session });
        return response.data.data.session;
      }
    } catch (error) {
      console.error('Error getting session details:', error);
      toast.error(error.response?.data?.message || 'Failed to get session details');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async submitPollResponse(courseId, sessionId, pollId, answer) {
    try {
      const response = await api.post(`/api/lectures/courses/${courseId}/sessions/${sessionId}/polls/${pollId}/respond`, { answer });
      
      if (response.data.success) {
        toast.success('Response submitted');
        return response.data.data.poll;
      }
    } catch (error) {
      console.error('Error submitting poll response:', error);
      toast.error(error.response?.data?.message || 'Failed to submit response');
      throw error;
    }
  }

  async getUserCourses(filters = {}) {
    try {
      this.setLoading(true);
      
      const response = await api.get('/api/lectures/my-courses', { params: filters });
      
      if (response.data.success) {
        this.setState({ userCourses: response.data.data.courses });
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting user courses:', error);
      toast.error(error.response?.data?.message || 'Failed to get your courses');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  filterCourses(courses, filters) {
    return courses.filter(course => {
      if (filters.subject && course.subject !== filters.subject) return false;
      if (filters.grade && course.grade !== filters.grade) return false;
      if (filters.isFree !== undefined && course.isFree !== filters.isFree) return false;
      if (filters.status && course.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return course.title.toLowerCase().includes(searchLower) || 
               course.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }

  sortCourses(courses, sortBy = 'startDate', order = 'desc') {
    return [...courses].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'startDate':
          comparison = new Date(a.startDate) - new Date(b.startDate);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = (a.stats?.averageRating || 0) - (b.stats?.averageRating || 0);
          break;
        default:
          comparison = new Date(a.startDate) - new Date(b.startDate);
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  }

  getCourseStatus(course) {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'ongoing';
  }

  getCourseStatusColor(status) {
    const colors = {
      upcoming: 'text-blue-600 bg-blue-100',
      ongoing: 'text-green-600 bg-green-100',
      completed: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getCourseStatusText(status) {
    const texts = {
      upcoming: 'Upcoming',
      ongoing: 'In Progress',
      completed: 'Completed'
    };
    return texts[status] || status;
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  getState() {
    return this.state;
  }

  subscribe(key, callback) {
    this.listeners.set(key, callback);
  }

  unsubscribe(key) {
    this.listeners.delete(key);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }
}

const lectureController = new LectureController();
export default lectureController;
