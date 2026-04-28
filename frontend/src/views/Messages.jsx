import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Send, Paperclip, MoreVertical, Phone, Video, 
  ChevronLeft, MessageSquare, Clock, User, Check, CheckCheck 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import Layout from '../components/Layout';
import { messageApi } from '../services/api';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle initial conversation from navigation state
  useEffect(() => {
    fetchConversations();
    
    if (location.state?.participantId) {
      handleStartNewConversation(location.state.participantId);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await messageApi.getConversations();
      setConversations(res.data || []);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      setLoadingMessages(true);
      const res = await messageApi.getMessages(convId);
      setMessages(res.data || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleStartNewConversation = async (participantId) => {
    try {
      const res = await messageApi.getOrCreateConversation({ participantId });
      if (res.success) {
        setConversations(prev => {
          const exists = prev.find(c => c._id === res.data._id);
          if (exists) return prev;
          return [res.data, ...prev];
        });
        setActiveConversation(res.data);
      }
    } catch (err) {
      toast.error('Could not start conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = { content: newMessage.trim() };
    const tempId = Date.now().toString();
    
    // Optimistic update
    const optimisticMessage = {
      _id: tempId,
      content: newMessage.trim(),
      senderId: currentUser._id,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const res = await messageApi.sendMessage(activeConversation._id, messageData);
      if (res.success) {
        setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
        // Update last message in conversation list
        setConversations(prev => prev.map(c => 
          c._id === activeConversation._id 
            ? { ...c, lastMessage: res.data, updatedAt: new Date().toISOString() } 
            : c
        ));
      }
    } catch (err) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const filteredConversations = conversations.filter(c => {
    const participant = c.participants.find(p => p._id !== currentUser._id);
    const name = participant?.profile?.firstName || participant?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getParticipant = (conv) => {
    return conv.participants.find(p => p._id !== currentUser._id) || {};
  };

  return (
    <Layout userRole={currentUser?.role}>
      <div className="max-w-[1600px] mx-auto w-full h-[calc(100vh-120px)] flex flex-col font-sans">
        
        <div className="flex-1 flex overflow-hidden bg-white rounded-[2.5rem] shadow-soft border border-slate-100">
          
          {/* Sidebar */}
          <div className={cn(
            "w-full md:w-[350px] lg:w-[400px] border-r border-slate-100 flex flex-col transition-all",
            activeConversation ? "hidden md:flex" : "flex"
          )}>
            <div className="p-8 border-b border-slate-50">
               <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Messages</h1>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search conversations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl outline-none transition-all font-medium text-sm"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
               {loading ? (
                 <div className="flex flex-col gap-4 p-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
                 </div>
               ) : filteredConversations.length > 0 ? (
                 filteredConversations.map(conv => {
                   const participant = getParticipant(conv);
                   const isActive = activeConversation?._id === conv._id;
                   const lastMsg = conv.lastMessage;
                   
                   return (
                     <div 
                        key={conv._id}
                        onClick={() => setActiveConversation(conv)}
                        className={cn(
                          "p-4 rounded-2xl cursor-pointer transition-all flex gap-4 group relative",
                          isActive ? "bg-indigo-50 border-indigo-100" : "hover:bg-slate-50 border-transparent"
                        )}
                     >
                        <div className="relative shrink-0">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                              {participant.profile?.firstName?.[0] || participant.username?.[0]}
                           </div>
                           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-800 truncate">{participant.profile?.firstName} {participant.profile?.lastName || participant.username}</h4>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{conv.updatedAt && format(new Date(conv.updatedAt), 'HH:mm')}</span>
                           </div>
                           <p className={cn("text-xs truncate", isActive ? "text-indigo-600 font-bold" : "text-slate-400 font-medium")}>
                              {lastMsg ? lastMsg.content : 'Start a conversation'}
                           </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="absolute right-4 bottom-4 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                             {conv.unreadCount}
                          </div>
                        )}
                     </div>
                   );
                 })
               ) : (
                 <div className="text-center py-20">
                    <MessageSquare size={40} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">No conversations found</p>
                 </div>
               )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={cn(
            "flex-1 flex flex-col bg-slate-50/30",
            !activeConversation ? "hidden md:flex" : "flex"
          )}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors">
                         <ChevronLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                        {getParticipant(activeConversation).profile?.firstName?.[0] || getParticipant(activeConversation).username?.[0]}
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800">{getParticipant(activeConversation).profile?.firstName} {getParticipant(activeConversation).profile?.lastName || getParticipant(activeConversation).username}</h3>
                         <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Phone size={18} /></button>
                      <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Video size={18} /></button>
                      <button className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
                   </div>
                </div>

                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar"
                >
                   {messages.map((msg, idx) => {
                     const isMe = msg.senderId === currentUser._id;
                     const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
                     
                     return (
                       <div key={msg._id} className={cn(
                         "flex items-end gap-3",
                         isMe ? "flex-row-reverse" : "flex-row"
                       )}>
                          {!isMe && (
                            <div className={cn("w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0 mb-1", !showAvatar && "opacity-0")}>
                               {getParticipant(activeConversation).profile?.firstName?.[0]}
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[70%] group",
                            isMe ? "items-end" : "items-start"
                          )}>
                             <div className={cn(
                               "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                               isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                             )}>
                                {msg.content}
                             </div>
                             <div className={cn(
                               "flex items-center gap-2 mt-1.5 px-1",
                               isMe ? "justify-end" : "justify-start"
                             )}>
                                <span className="text-[9px] font-bold text-slate-400">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                {isMe && (
                                  msg.status === 'sending' ? <Clock size={10} className="text-slate-300" /> : 
                                  <CheckCheck size={12} className="text-indigo-500" />
                                )}
                             </div>
                          </div>
                       </div>
                     );
                   })}
                   {loadingMessages && (
                     <div className="flex justify-center p-4">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                     </div>
                   )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100">
                   <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                      <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                         <Paperclip size={20} />
                      </button>
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 py-4 px-6 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-[1.5rem] outline-none transition-all font-medium text-sm"
                      />
                      <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                      >
                         <Send size={20} />
                      </button>
                   </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                 <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare size={48} className="text-indigo-200" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select a conversation</h2>
                 <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Choose someone from the left to start chatting and coordinating study sessions.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Messages;
