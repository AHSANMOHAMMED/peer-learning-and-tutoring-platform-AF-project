# PeerLearn MVC Refactoring Guide

## New Folder Structure

```
client/src/
├── App.jsx                          # Main routing
├── main.jsx                         # Entry point
├── index.html
│
├── models/                          # Data shapes, interfaces, DTOs
│   ├── Material.js                  # { id, title, desc, category, tags, fileUrl, status, createdBy }
│   ├── Session.js                   # { id, studentId, tutorId, subject, date, time, status, roomId }
│   ├── Report.js                    # { id, type, contentId, userId, description, status, action }
│   └── User.js                      # { id, name, email, role, avatar }
│
├── components/                      # Reusable UI components
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/
│   │   ├── DashboardLayout.jsx      # Main layout with sidebar (NEW)
│   │   └── Sidebar.jsx              # Role-aware sidebar (NEW)
│   ├── materials/
│   │   ├── MaterialCard.jsx         # Displays single material
│   │   ├── MaterialFilter.jsx       # Filter by subject/tags
│   │   └── FileUploader.jsx         # Drag-drop file upload
│   ├── sessions/
│   │   ├── SessionCard.jsx          # Displays session info
│   │   ├── SessionForm.jsx          # Schedule session form
│   │   ├── FeedbackForm.jsx         # Post-session feedback
│   │   └── JitsiMeeting.jsx         # Jitsi embed component (NEW)
│   ├── moderation/
│   │   ├── ReportCard.jsx           # Display single report
│   │   ├── ReportForm.jsx           # Submit report modal
│   │   └── ActionButtons.jsx        # Approve/reject/ban buttons
│   └── auth/
│       └── RoleProtectedRoute.jsx   # Role-based access (NEW)
│
├── controllers/                     # Business logic as custom hooks (NEW FOLDER)
│   ├── useMaterialController.js     # Material CRUD + approve/reject
│   ├── useTutoringController.js     # Session scheduling + feedback
│   └── useModerationController.js   # Reports + moderation actions
│
├── pages/                           # Page/screen components (RENAMED from views)
│   ├── Home.jsx
│   ├── Dashboard.jsx                # Main dashboard (role-aware)
│   ├── materials/
│   │   ├── MaterialListPage.jsx     # Browse materials with filters
│   │   ├── MaterialDetailPage.jsx   # Single material view
│   │   └── UploadMaterialPage.jsx   # Upload/create material
│   ├── sessions/
│   │   ├── ScheduleSessionPage.jsx  # Create new session booking
│   │   ├── MySessionsPage.jsx       # List my sessions (accept/reject/join)
│   │   └── SessionRoomPage.jsx      # Jitsi room + embedded meeting
│   └── moderation/
│       ├── ModerationDashboardPage.jsx # Reports list + actions
│       └── ApprovalQueuePage.jsx    # Pending materials approval (mod only)
│
├── services/                        # API communication
│   ├── api.js                       # Axios configuration + interceptors
│   ├── materialService.js           # /api/materials endpoints
│   ├── sessionService.js            # /api/sessions endpoints
│   ├── reportService.js             # /api/moderation/reports endpoints
│   └── userService.js               # /api/users endpoints
│
├── contexts/                        # React Context
│   └── AuthContext.jsx              # User + roles + token
│
├── styles/
│   └── globals.css
│
└── utils/
    └── constants.js                 # Status enums, roles, etc
```

## Architecture Patterns

### Controller Pattern (Custom Hooks)
Each controller is a custom hook that returns state + functions:
```javascript
const useMaterialController = () => {
  const [data, setData] = useState({ materials: [], material: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const functions = {
    list: async (filters) => { /* fetch all materials */ },
    create: async (formData) => { /* upload material */ },
    update: async (id, data) => { /* edit material */ },
    delete: async (id) => { /* delete material */ },
    approve: async (id) => { /* moderator: approve */ },
    reject: async (id, reason) => { /* moderator: reject */ },
  };
  
  return { ...data, loading, error, ...functions };
};
```

### View Pattern (Presentational Components)
Views receive props and call controller functions:
```javascript
const MaterialListPage = () => {
  const { materials, loading, error, list, approve } = useMaterialController();
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    list(filters);
  }, [filters]);
  
  if (loading) return <LoadingSpinner />;
  return <div>{materials.map(m => <MaterialCard key={m.id} material={m} />)}</div>;
};
```

### Controller Functions Return API Responses
Each function handles: API call -> loading -> error/success -> state update -> toast feedback
```javascript
const approve = async (materialId) => {
  setLoading(true);
  setError(null);
  try {
    const res = await materialService.approveMaterial(materialId);
    setData(prev => ({ ...prev, materials: prev.materials.map(...) }));
    toast.success('Material approved!');
  } catch (err) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Member C Feature Coverage

### 1. Study Materials & Resource Library
- **Upload**: `UploadMaterialPage` + `FileUploader` component
- **List**: `MaterialListPage` with `MaterialFilter` + `MaterialCard`
- **View**: `MaterialDetailPage`
- **Approve/Reject**: Moderator actions in `useMaterialController`

### 2. Peer Tutoring Sessions
- **Schedule**: `ScheduleSessionPage` → `useTutoringController.schedule()`
- **List**: `MySessionsPage` (role-aware: show requests if tutor, bookings if student)
- **Accept/Reject**: `useTutoringController.acceptSession() / rejectSession()`
- **Join Video**: `SessionRoomPage` with Jitsi embed
- **Feedback**: `FeedbackForm` component in session room or post-session modal

### 3. Safety & Moderation
- **Report**: `ReportForm` component (modal) - available on any content
- **Review**: `ModerationDashboardPage` → `useModerationController.listReports()`
- **Actions**: Approve material, ban user, dismiss report
- **Access Control**: `RoleProtectedRoute` for mod-only pages

### 4. Role-aware UI
- **DashboardLayout**: Single layout with conditional Sidebar
- **Sidebar**: Shows different links based on `useAuthContext()` user.role
- **Conditional Rendering**: hasRole('moderator'), hasRole('tutor'), etc.

## API Endpoints (Assumed Backend Implementations)

```
Materials:
  GET    /api/materials                 # List all
  GET    /api/materials/:id             # Get single
  POST   /api/materials                 # Create (file upload)
  PUT    /api/materials/:id             # Update
  DELETE /api/materials/:id             # Delete
  PUT    /api/materials/:id/approve     # Approve (mod only)
  PUT    /api/materials/:id/reject      # Reject (mod only) + reason

Sessions:
  GET    /api/sessions                  # List my sessions (student/tutor)
  GET    /api/sessions/:id              # Get single
  POST   /api/sessions                  # Create booking
  PUT    /api/sessions/:id/accept       # Tutor accept
  PUT    /api/sessions/:id/reject       # Tutor reject
  PUT    /api/sessions/:id/feedback     # Post session feedback

Reports:
  GET    /api/moderation/reports        # List (mod only)
  POST   /api/moderation/reports        # Submit report
  PUT    /api/moderation/reports/:id    # Review action (mod only)
  DELETE /api/moderation/reports/:id    # Dismiss (mod only)

Users (for banning):
  PUT    /api/users/:id/ban             # Ban user (mod only)
  PUT    /api/users/:id/suspend         # Suspend user (mod only)
```

## Key Implementation Notes

1. **Jitsi Meeting**: Use public meet.jit.si server
   - Room name: `peerlearn-${sessionId}` or generate UUID
   - Embed as iframe or use @jitsi/react-sdk

2. **File Upload**: 
   - Backend expects FormData with file + metadata
   - Use Cloudinary/Multer on backend
   - Frontend: FileUploader component handles drag-drop

3. **Role Access**:
   - Check `useAuthContext().user.role` in components
   - Wrap pages with `<RoleProtectedRoute role="moderator" />`
   - Use helper: `hasRole(role)` in conditions

4. **State Management**:
   - Controllers use `useState` for data, loading, error
   - Forms use `useState` for form fields
   - API calls wrapped in try-catch

5. **Error Handling**:
   - Controllers catch errors + set state
   - Components use `error` prop to display toast
   - Form validation on both frontend & backend

6. **Toasts & Feedback**:
   - Use `react-hot-toast` for success/error messages
   - Called in controller functions after API response

## Migration Checklist

- [ ] Create `/controllers` folder
- [ ] Implement 3 controller hooks
- [ ] Rename `/views` → `/pages`
- [ ] Create page components using controllers
- [ ] Create supporting reusable components
- [ ] Update routing in App.jsx
- [ ] Update imports in existing components
- [ ] Remove old ViewModel classes
- [ ] Test each feature end-to-end
- [ ] Update backend if needed (CRUD endpoints)

---
**Status**: Ready to implement  
**Priority**: Materials → Sessions → Moderation  
**Timeline**: ~2-3 hours for full implementation
