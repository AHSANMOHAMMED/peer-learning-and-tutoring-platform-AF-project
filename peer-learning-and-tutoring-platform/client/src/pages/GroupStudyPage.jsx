import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, Calendar, Clock, BookOpen,
  MessageCircle, Settings, User, Star, ChevronRight, Eye,
  UserPlus, UserMinus, Hash, Globe, Lock
} from 'lucide-react';
import groupController from '../controllers/GroupController';

const GroupStudyPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(groupController.getState());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    maxCapacity: 10,
    tags: [],
    type: 'study_group',
    requiresApproval: false,
    isPublic: true
  });

  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    type: '',
    search: '',
    minCapacity: 3,
    maxCapacity: 50,
    isPublic: true,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const handleStateChange = (newState) => {
      setState(newState);
    };

    groupController.subscribe('groupStudyPage', handleStateChange);
    
    // Load initial data
    loadGroupRooms();

    return () => {
      groupController.unsubscribe('groupStudyPage');
    };
  }, []);

  const loadGroupRooms = async () => {
    try {
      await groupController.getGroupRooms(filters);
      await groupController.getUserGroupRooms();
    } catch (error) {
      console.error('Error loading group rooms:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    try {
      const newRoom = await groupController.createGroupRoom(createFormData);
      setShowCreateForm(false);
      setCreateFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        maxCapacity: 10,
        tags: [],
        type: 'study_group',
        requiresApproval: false,
        isPublic: true
      });
      
      // Navigate to the new room
      navigate(`/groups/${newRoom._id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await groupController.joinGroupRoom(roomId);
      loadGroupRooms(); // Refresh the list
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      if (confirm('Are you sure you want to leave this group room?')) {
        await groupController.leaveGroupRoom(roomId);
        loadGroupRooms(); // Refresh the list
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters with debounce
    const timeoutId = setTimeout(() => {
      groupController.getGroupRooms(newFilters);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const getFilteredAndSortedRooms = () => {
    let filtered = groupController.filterGroupRooms(state.groupRooms, filters);
    return groupController.sortGroupRooms(filtered, filters.sortBy, filters.sortOrder);
  };

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'IT', 'Art', 'Music'];
  const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];
  const roomTypes = ['study_group', 'homework_help', 'exam_prep', 'project_collaboration', 'general_discussion'];

  const filteredRooms = getFilteredAndSortedRooms();
  const userRoomIds = state.userRooms.map(room => room._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Group Study Rooms
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join collaborative study sessions and learn together with peers
            </p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{filteredRooms.length} rooms available</span>
          </div>
        </div>

        {/* Create Room Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Group Room</h3>
            
            <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Title
                </label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Algebra Study Group"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={createFormData.subject}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <select
                  value={createFormData.grade}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  min="3"
                  max="50"
                  value={createFormData.maxCapacity}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>
                      {groupController.getRoomTypeText(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this group room is for..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createFormData.isPublic}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Public room</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createFormData.requiresApproval}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Require approval to join</span>
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Filter Rooms</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search rooms..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>
                      {groupController.getRoomTypeText(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Recently Created</option>
                  <option value="title">Name</option>
                  <option value="participants">Participants</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading group rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No group rooms found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or create a new room</p>
            </div>
          ) : (
            filteredRooms.map((room, index) => {
              const isUserInRoom = userRoomIds.includes(room._id);
              const isHost = groupController.isHost(room, 'current-user'); // Would need actual user ID
              
              return (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Room Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{room.title}</h3>
                          <p className="text-sm text-gray-500">by {room.host?.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {room.isPublic ? (
                          <Globe className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Room Info */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {room.subject}
                        </span>
                        <span className="flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          {room.grade}
                        </span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs ${groupController.getRoomTypeColor(room.type)}`}>
                        {groupController.getRoomTypeText(room.type)}
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{room.participants.length}/{room.maxCapacity}</span>
                      </div>
                      
                      <div className="flex -space-x-2">
                        {room.participants.slice(0, 3).map((participant, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                          >
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                        ))}
                        {room.participants.length > 3 && (
                          <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{room.participants.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {isUserInRoom ? (
                        <>
                          <button
                            onClick={() => navigate(`/groups/${room._id}`)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Enter Room
                          </button>
                          
                          {!isHost && (
                            <button
                              onClick={() => handleLeaveRoom(room._id)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleJoinRoom(room._id)}
                          disabled={!room.isActive || room.participants.length >= room.maxCapacity}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Join Room
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/groups/${room._id}`)}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupStudyPage;
