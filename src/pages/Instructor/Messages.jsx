import { useState, useEffect, useRef } from "react";
import api from "../../utils/Api";
import { Search, Send, ArrowLeft, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "react-router-dom";

export default function Communication() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   // handle starting a conversation from navigation state
  useEffect(() => {
    // Check if we have state from navigation
    if (location.state?.startConversation && location.state?.recipient) {
      const recipient = location.state.recipient;
      
      // Format recipient to match your user format
      const userToStartConversation = {
        id: recipient.id,
        name: recipient.name,
        email: recipient.email,
        photo_url: recipient.photo,
        role: recipient.role || 'student'
      };
      
      // Start conversation with this user
      startConversation(userToStartConversation);
      
      // Clear the state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Load conversations error:", err);
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/${otherUserId}`);
      setMessages(res.data.data.messages);
      setSelectedConversation(res.data.data.otherUser);
      loadConversations();
    } catch (err) {
      console.error("Load messages error:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await api.post("/messages/send", {
        receiverId: selectedConversation.id,
        content: newMessage,
      });

      setMessages([...messages, res.data.data]);
      setNewMessage("");
      loadConversations();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const res = await api.get(`/messages/search/users?query=${query}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const startConversation = (user) => {
    setSelectedConversation(user);
    setMessages([]);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-200px)]">
        <div className="flex h-full">
          
          {/* LEFT SIDEBAR - Conversations List */}
          <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
            
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Messages</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Search Results or Conversations */}
            <div className="flex-1 overflow-y-auto">
              {isSearching && searchResults.length > 0 ? (
                <div>
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startConversation(user)}
                      className="w-full p-4 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 transition"
                    >
                      {user.photo_url ? (
                        <img
                          src={user.photo_url}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.otherUser.id}
                    onClick={() => loadMessages(conv.otherUser.id)}
                    className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 transition ${
                      selectedConversation?.id === conv.otherUser.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    {conv.otherUser.photo_url ? (
                      <img
                        src={conv.otherUser.photo_url}
                        alt={conv.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {conv.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {conv.otherUser.name}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage.isSentByMe ? 'You: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                  <User className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">Search for students above to start messaging</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Message Thread */}
          <div className="flex-1 flex flex-col">
            
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  {selectedConversation.photo_url ? (
                    <img
                      src={selectedConversation.photo_url}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                      {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  
                  <div>
                    <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{selectedConversation.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            msg.isSentByMe
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.isSentByMe ? 'text-purple-200' : 'text-gray-400'}`}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}