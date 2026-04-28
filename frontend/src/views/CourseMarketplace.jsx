import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Star, Clock, Users,
  ChevronDown, Grid, List, Heart, BookOpen,
  GraduationCap, ArrowUpRight, ArrowRight,
  ShoppingBag, Eye, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi } from '../services/api';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const CourseCard = ({ course, featured: isFeatured = false, viewMode, addToCart }) => {
  const navigate = useNavigate();
  
  if (viewMode === 'list') {
    return (
      <div
        className="group bg-white border border-slate-200 rounded-xl p-4 flex flex-col xl:flex-row items-center gap-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        onClick={() => navigate(`/lectures/${course._id}`)}
      >
        <div className="w-full xl:w-60 h-40 rounded-xl overflow-hidden relative border border-slate-100 shrink-0">
          <img src={course.thumbnail || "/images/maths-3d.png"} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
             <div className="px-2 py-1 bg-white/90 backdrop-blur rounded text-xs font-bold text-slate-800 shadow-sm">
                {course.subject || 'General'}
             </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
               Grade {course.grade || '11'}
            </span>
            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
              <Star size={14} fill="currentColor" />
              <span className="text-sm pt-0.5">{course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          
          <div className="space-y-1">
             <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
             <p className="text-sm text-slate-500 font-medium">Instructor: {course.instructor?.name || 'Faculty Member'}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2"><Users size={16} className="text-slate-400" /> {course.stats?.totalEnrollments || 0} enrolled</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> {course.duration || 4} Weeks</span>
            <span className="font-bold text-slate-900">{course.isFree ? 'Free' : `Rs. ${course.price?.toLocaleString()}`}</span>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/lectures/${course._id}`); }}
          className="w-full xl:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          View Details <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col h-full",
        isFeatured && "ring-2 ring-blue-500 border-transparent shadow-blue-100"
      )}
    >
      <div className="relative h-44 rounded-lg overflow-hidden mb-4 shrink-0">
        <img src={course.thumbnail || "/images/maths-3d.png"} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
        
        {isFeatured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white font-bold text-xs rounded shadow-sm">
            Top Rated
          </div>
        )}
        
        <button onClick={(e) => { e.stopPropagation(); }} className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white hover:text-red-500 transition-colors text-white shadow-sm">
          <Heart size={16} className="fill-transparent hover:fill-current" />
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
               {course.instructor?.avatar ? <img src={course.instructor.avatar} alt="avatar" /> : <GraduationCap size={16} className="text-slate-600" />}
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-bold text-white leading-none line-clamp-1">{course.instructor?.name || 'Faculty Member'}</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {course.subject || 'General'}
           </span>
           <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={12} fill="currentColor" />
              <span className="text-xs pt-0.5">{course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
           </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
          {course.title}
        </h3>

        <div className="h-px bg-slate-100 w-full mb-4" />

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-slate-900">
             {course.isFree ? 'Free' : `Rs. ${course.price?.toLocaleString()}`}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/lectures/${course._id}`); }}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(course); }}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-200"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseMarketplace = () => {
  const [courses, setCourses] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    query: '',
    subject: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'popular'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  });

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToCart = (course) => {
    if (cart.find(item => item._id === course._id)) {
      return toast.error('Course already in cart');
    }
    setCart([...cart, course]);
    toast.success('Added to cart');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      for (const item of cart) {
        await marketplaceApi.purchase(item._id);
      }
      toast.success('Enrollment successful! Redirecting to dashboard...');
      setCart([]);
      setIsCheckoutOpen(false);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    searchCourses();
  }, [filters, pagination.current]);

  const fetchInitialData = async () => {
    try {
      const [featuredRes, categoriesRes] = await Promise.all([
        marketplaceApi.getAll({ featured: true, limit: 4 }),
        marketplaceApi.getAll({ categories: true })
      ]);
      if (featuredRes.data.success) setFeatured(featuredRes.data.data.courses);
      if (categoriesRes.data.success) setCategories(featuredRes.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const searchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('page', pagination.current.toString());

      const response = await marketplaceApi.getAll({ 
        search: params.get('q'),
        subject: params.get('subject'),
        grade: params.get('grade'),
        minPrice: params.get('minPrice'),
        maxPrice: params.get('maxPrice'),
        page: pagination.current,
        sortBy: filters.sortBy
      });
      if (response.data.success) {
        setCourses(response.data.data.courses);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
             <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
                <div className="max-w-2xl">
                   <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Courses</h1>
                   <p className="text-slate-500 font-medium text-base">Find the right classes to match your curriculum, taught by verified faculty and top-ranked peers.</p>
                </div>
                <div className="w-full xl:w-96 relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                   <input
                     type="text"
                     placeholder="Search subjects, topics, or tutors..."
                     value={filters.query}
                     onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-none rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
             </div>
          </div>

          {/* Featured Courses */}
          {featured.length > 0 && !filters.query && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <Star className="text-amber-500" fill="currentColor" size={20} /> Featured Picks
                  </h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featured.map((course) => (
                    <CourseCard key={course._id} course={course} featured viewMode="grid" addToCart={addToCart} />
                  ))}
               </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col xl:flex-row gap-8">
             
             {/* Sidebar Filters */}
             <div className="w-full xl:w-72 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                   <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                      <Filter size={18} className="text-slate-700" />
                      <h3 className="font-bold text-slate-800">Filters</h3>
                   </div>
                   
                   <div className="space-y-6">
                      
                      {/* Subject */}
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                         <div className="relative">
                            <select
                              value={filters.subject}
                              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 font-medium appearance-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                               <option value="">All Subjects</option>
                               {categories.map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                         </div>
                      </div>

                      {/* Grade Category */}
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Grade Level</label>
                         <div className="grid grid-cols-2 gap-2">
                            {[6, 9, 11, 12, 13].map((g) => (
                               <button
                                 key={g}
                                 onClick={() => setFilters({ ...filters, grade: filters.grade === g.toString() ? '' : g.toString() })}
                                 className={cn(
                                   "py-2 rounded-lg text-sm font-semibold transition-colors border",
                                   filters.grade === g.toString() 
                                     ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                     : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                 )}
                               >
                                  Grade {g}
                                </button>
                            ))}
                         </div>
                      </div>

                      {/* Price Range */}
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Price (LKR)</label>
                         <div className="flex items-center gap-2">
                            <input
                               type="number"
                               placeholder="Min"
                               value={filters.minPrice}
                               onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                               type="number"
                               placeholder="Max"
                               value={filters.maxPrice}
                               onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                            />
                         </div>
                      </div>

                   </div>

                   <button
                     onClick={() => setFilters({ query: '', subject: '', grade: '', minPrice: '', maxPrice: '', sortBy: 'popular' })}
                     className="w-full mt-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-lg transition-colors"
                   >
                      Clear All Filters
                   </button>
                </div>
             </div>

             {/* Results Grid */}
             <div className="flex-1">
                
                {/* Result Controls */}
                <div className="flex sm:flex-row flex-col sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 gap-4">
                   <p className="text-sm font-semibold text-slate-600">
                      Showing <span className="text-slate-900">{pagination.count}</span> courses
                   </p>

                   <div className="flex items-center gap-4">
                      <div className="relative">
                         <select
                           value={filters.sortBy}
                           onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                           className="bg-slate-50 border border-slate-200 pl-4 pr-9 py-2 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                         >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest First</option>
                         </select>
                         <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      <div className="flex bg-slate-100 p-1 rounded-lg">
                         <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}><Grid size={18} /></button>
                         <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}><List size={18} /></button>
                      </div>
                   </div>
                </div>

                {/* Course List */}
                {loading ? (
                   <div className="py-20 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                      <p className="text-slate-500 font-semibold">Loading courses...</p>
                   </div>
                ) : courses.length > 0 ? (
                   <div className={cn(
                     "grid gap-6",
                     viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                   )}>
                      {courses.map((course) => (
                         <CourseCard key={course._id} course={course} viewMode={viewMode} addToCart={addToCart} />
                      ))}
                   </div>
                ) : (
                   <div className="py-20 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl text-center px-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                         <BookOpen size={24} className="text-slate-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">No courses found</h4>
                      <p className="text-slate-500 text-sm max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
                      <button onClick={() => setFilters({ query: '', subject: '', grade: '', minPrice: '', maxPrice: '', sortBy: 'popular' })} className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors">
                         Clear Filters
                      </button>
                   </div>
                )}

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                     {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                       <button
                         key={page}
                         onClick={() => setPagination({ ...pagination, current: page })}
                         className={cn(
                           "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                           pagination.current === page 
                             ? "bg-blue-600 text-white" 
                             : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                         )}
                       >
                         {page}
                       </button>
                     ))}
                  </div>
                )}

             </div>
          </div>
          
        </div>

        {/* Floating Cart Button */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.button
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 20 }}
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:bg-blue-500 hover:scale-110 transition-all active:scale-95"
            >
              <ShoppingBag size={24} />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center tabular-nums">
                {cart.length}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cart Drawer */}
        <AnimatePresence>
          {isCartOpen && (
            <div className="fixed inset-0 z-[1000] flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Your Cart</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cart.length} Courses Selected</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {cart.map(item => (
                    <CartItem key={item._id} item={item} onRemove={removeFromCart} />
                  ))}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900">Rs. {calculateTotal().toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {isCheckoutOpen && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden my-auto"
              >
                <div className="p-8 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Order Review & Secure Payment</p>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Courses</h4>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                      {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-sm font-bold text-slate-700 truncate mr-4">{item.title}</span>
                          <span className="text-sm font-black text-slate-900 shrink-0">Rs. {item.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                      <span className="font-bold tabular-nums">Rs. {calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Service Fee</span>
                      <span className="font-bold tabular-nums">Rs. 0</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest">Total to Pay</span>
                      <span className="text-2xl font-black tabular-nums">Rs. {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <AlertCircle className="text-amber-500 shrink-0" size={20} />
                      <p className="text-xs font-bold text-amber-800 leading-relaxed">
                        This is a secure enrollment process. Once payment is confirmed, courses will be added to your My Learning tab immediately.
                      </p>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="animate-spin mr-3" size={18} />
                          Processing Order...
                        </>
                      ) : 'Confirm and Pay Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

// Sub-components for better organization
const CartItem = ({ item, onRemove }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
      <img src={item.thumbnail || "/images/maths-3d.png"} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 text-sm truncate">{item.title}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.instructor?.name || 'Faculty Member'}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="font-bold text-slate-900 text-sm">Rs. {item.price?.toLocaleString()}</p>
      <button onClick={() => onRemove(item._id)} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider mt-1">Remove</button>
    </div>
  </div>
);

export default CourseMarketplace;