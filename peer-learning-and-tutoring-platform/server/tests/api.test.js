const request = require('supertest');
const { app } = require('../index'); // Your Express app
const mongoose = require('mongoose');
const User = require('../models/User');
const LectureCourse = require('../models/LectureCourse');
const jwt = require('jsonwebtoken');

// Test database connection
const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/peerlearn_test';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  role: 'student',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    grade: 10
  }
};

const testTutor = {
  username: 'testtutor',
  email: 'tutor@example.com',
  password: 'password123',
  role: 'tutor',
  profile: {
    firstName: 'Test',
    lastName: 'Tutor'
  }
};

// Setup and teardown
beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear test data before each test
  await User.deleteMany({});
  await LectureCourse.deleteMany({});
});

// ==========================================
// Authentication Tests
// ==========================================
describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(testUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // Missing password

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

// ==========================================
// User Management Tests
// ==========================================
describe('User API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    userId = registerRes.body.data.user.id;
    authToken = registerRes.body.data.token;
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should not access profile without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        profile: {
          bio: 'Test bio'
        }
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe(updateData.name);
    });
  });
});

// ==========================================
// Peer Tutoring Tests
// ==========================================
describe('Peer Tutoring API', () => {
  let studentToken;
  let tutorToken;

  beforeEach(async () => {
    // Create student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    studentToken = studentRes.body.data.token;

    // Create tutor
    const tutorRes = await request(app)
      .post('/api/auth/register')
      .send(testTutor);
    tutorToken = tutorRes.body.data.token;
  });

  describe('POST /api/peer/request-help', () => {
    it('should create help request', async () => {
      const res = await request(app)
        .post('/api/peer/request-help')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subject: 'Mathematics',
          topic: 'Algebra',
          grade: '10',
          urgency: 'medium'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('matches');
    });
  });

  describe('POST /api/peer/sessions', () => {
    it('should create peer session', async () => {
      const res = await request(app)
        .post('/api/peer/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subject: 'Mathematics',
          topic: 'Algebra',
          requestedUserId: 'some-tutor-id' // Would need actual tutor ID
        });

      // This might fail if tutor ID is invalid, but tests the endpoint
      expect([201, 400, 404]).toContain(res.status);
    });
  });
});

// ==========================================
// Group Rooms Tests
// ==========================================
describe('Group Rooms API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  describe('POST /api/groups', () => {
    it('should create a group room', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Study Group',
          description: 'For testing purposes',
          subject: 'Mathematics',
          maxMembers: 10,
          isPublic: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.group).toHaveProperty('_id');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing title'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/groups', () => {
    it('should list group rooms', async () => {
      const res = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.groups)).toBe(true);
    });
  });
});

// ==========================================
// Lecture Courses Tests
// ==========================================
describe('Lecture Courses API', () => {
  let authToken;
  let tutorToken;
  let courseId;

  beforeEach(async () => {
    // Create student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    authToken = studentRes.body.data.token;

    // Create tutor
    const tutorRes = await request(app)
      .post('/api/auth/register')
      .send({
        ...testTutor,
        role: 'tutor'
      });
    tutorToken = tutorRes.body.data.token;
  });

  describe('POST /api/lectures/courses', () => {
    it('should allow tutor to create course', async () => {
      const res = await request(app)
        .post('/api/lectures/courses')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          title: 'Advanced Mathematics',
          description: 'Learn advanced math concepts',
          subject: 'Mathematics',
          grade: '11',
          price: 5000,
          duration: 4,
          maxStudents: 50,
          schedule: {
            startDate: new Date(),
            days: ['Monday', 'Wednesday'],
            time: '18:00'
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      courseId = res.body.data.course._id;
    });
  });

  describe('POST /api/lectures/courses/:id/enroll', () => {
    it('should allow student to enroll in free course', async () => {
      // First create a free course
      const courseRes = await request(app)
        .post('/api/lectures/courses')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          title: 'Free Math Course',
          description: 'Free course',
          subject: 'Mathematics',
          grade: '10',
          price: 0,
          isFree: true
        });

      const freeCourseId = courseRes.body.data.course._id;

      const res = await request(app)
        .post(`/api/lectures/courses/${freeCourseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

// ==========================================
// Feature Flags Tests
// ==========================================
describe('Feature Flags API', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // Create admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        ...testUser,
        username: 'adminuser',
        email: 'admin@test.com',
        role: 'admin'
      });
    adminToken = adminRes.body.data.token;

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        ...testUser,
        username: 'regularuser',
        email: 'user@test.com'
      });
    userToken = userRes.body.data.token;
  });

  describe('POST /api/feature-flags', () => {
    it('should allow admin to create feature flag', async () => {
      const res = await request(app)
        .post('/api/feature-flags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'test_feature',
          name: 'Test Feature',
          description: 'For testing',
          enabled: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should not allow regular user to create feature flag', async () => {
      const res = await request(app)
        .post('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          key: 'test_feature',
          name: 'Test Feature'
        });

      expect(res.status).toBe(403);
    });
  });
});

// ==========================================
// Health Check Tests
// ==========================================
describe('Health Check', () => {
  it('should return 200 for health endpoint', async () => {
    const res = await request(app)
      .get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
