import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { Toaster } from 'react-hot-toast';
import LoginView from '../views/LoginView';
import PeerMatchingPage from '../pages/PeerMatchingPage';
import LectureCatalogPage from '../pages/LectureCatalogPage';

// Mock API
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Test wrapper with providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </I18nextProvider>
  </BrowserRouter>
);

// ==========================================
// Login Component Tests
// ==========================================
describe('LoginView', () => {
  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginView />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    render(
      <TestWrapper>
        <LoginView />
      </TestWrapper>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const mockPost = require('../services/api').post;
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          token: 'test-token',
          user: { _id: '1', name: 'Test User', email: 'test@example.com' }
        }
      }
    });

    render(
      <TestWrapper>
        <LoginView />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});

// ==========================================
// Peer Matching Page Tests
// ==========================================
describe('PeerMatchingPage', () => {
  const mockMatches = [
    {
      _id: '1',
      name: 'Expert Math Tutor',
      score: 95,
      details: {
        subjectMatch: 40,
        gradeMatch: 30,
        reputationScore: 20,
        availabilityScore: 5
      },
      profile: {
        expertise: ['Mathematics', 'Algebra'],
        grades: ['9', '10', '11'],
        reputation: 4.8
      }
    },
    {
      _id: '2',
      name: 'Science Specialist',
      score: 75,
      details: {
        subjectMatch: 30,
        gradeMatch: 25,
        reputationScore: 15,
        availabilityScore: 5
      },
      profile: {
        expertise: ['Physics', 'Chemistry'],
        grades: ['10', '11', '12'],
        reputation: 4.5
      }
    }
  ];

  beforeEach(() => {
    const mockGet = require('../services/api').get;
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { matches: mockMatches } }
    });
  });

  it('renders peer matching interface', async () => {
    render(
      <TestWrapper>
        <PeerMatchingPage />
      </TestWrapper>
    );

    expect(screen.getByText(/find study partners/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Expert Math Tutor')).toBeInTheDocument();
    });
  });

  it('displays match scores correctly', async () => {
    render(
      <TestWrapper>
        <PeerMatchingPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('allows filtering by subject', async () => {
    render(
      <TestWrapper>
        <PeerMatchingPage />
      </TestWrapper>
    );

    const subjectFilter = screen.getByLabelText(/subject/i);
    fireEvent.change(subjectFilter, { target: { value: 'Mathematics' } });

    await waitFor(() => {
      expect(require('../services/api').get).toHaveBeenCalled();
    });
  });
});

// ==========================================
// Course Catalog Page Tests
// ==========================================
describe('LectureCatalogPage', () => {
  const mockCourses = [
    {
      _id: '1',
      title: 'Advanced Mathematics',
      subject: 'Mathematics',
      grade: '11',
      price: 5000,
      isFree: false,
      instructor: { name: 'Dr. Smith' },
      stats: { totalEnrollments: 45, averageRating: 4.5 },
      thumbnail: 'math.jpg'
    },
    {
      _id: '2',
      title: 'Introduction to Physics',
      subject: 'Physics',
      grade: '10',
      price: 0,
      isFree: true,
      instructor: { name: 'Prof. Johnson' },
      stats: { totalEnrollments: 120, averageRating: 4.8 },
      thumbnail: 'physics.jpg'
    }
  ];

  beforeEach(() => {
    const mockGet = require('../services/api').get;
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { courses: mockCourses } }
    });
  });

  it('renders course catalog', async () => {
    render(
      <TestWrapper>
        <LectureCatalogPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Physics')).toBeInTheDocument();
    });
  });

  it('displays course prices correctly', async () => {
    render(
      <TestWrapper>
        <LectureCatalogPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('LKR 5,000')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  it('handles enroll button click', async () => {
    const mockPost = require('../services/api').post;
    mockPost.mockResolvedValueOnce({
      data: { success: true, message: 'Enrolled successfully' }
    });

    render(
      <TestWrapper>
        <LectureCatalogPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const enrollButtons = screen.getAllByText(/enroll/i);
      fireEvent.click(enrollButtons[0]);
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });
});

// ==========================================
// Navigation Tests
// ==========================================
describe('Navigation', () => {
  it('renders navbar with correct links', () => {
    render(
      <TestWrapper>
        <div>Test Page</div>
      </TestWrapper>
    );

    // Assuming Navbar component is rendered in App layout
    expect(screen.getByText(/peerlearn/i)).toBeInTheDocument();
  });
});

// ==========================================
// Error Handling Tests
// ==========================================
describe('Error Handling', () => {
  it('displays error message on API failure', async () => {
    const mockGet = require('../services/api').get;
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    render(
      <TestWrapper>
        <PeerMatchingPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading matches/i)).toBeInTheDocument();
    });
  });
});

// ==========================================
// Accessibility Tests
// ==========================================
describe('Accessibility', () => {
  it('login form has proper ARIA labels', () => {
    render(
      <TestWrapper>
        <LoginView />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  it('buttons have proper focus indicators', () => {
    render(
      <TestWrapper>
        <LoginView />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toHaveClass('focus:ring-2');
  });
});
