import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/api';
import { apiService } from '../services/api';
import Layout from '../components/Layout';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatArea from '../components/Chat/ChatArea';
import MemberSidebar from '../components/Chat/MemberSidebar';
import InviteModal from '../components/Chat/InviteModal';
import WorldInfoManager from '../components/WorldInfo/WorldInfoManager';

function ChatPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  // Data State
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRoomInfo, setCurrentRoomInfo] = useState({});
  
  // UI State
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWorldInfoModal, setShowWorldInfoModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingAgents, setTypingAgents] = useState([]); // Detailed typing agent info
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Resources
  const [emojiList, setEmojiList] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Refs
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // --- Data Fetching ---

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // 并行但独立地获取数据，避免一个失败影响全部
        const agentsData = await apiService.getAgents().catch(() => ({ agents: [] }));
        const emojisData = await apiService.getEmojis().catch(() => ({ emojis: [] }));
        const imagesData = await apiService.getUploadedImages().catch(() => ({ images: [] }));
        const roomsData = await apiService.getRooms().catch(() => ({ rooms: [] }));

        setAgentList(agentsData.agents || []);
        setEmojiList(emojisData.emojis || []);
        setUploadedImages(imagesData.images || []);
        setRooms(roomsData.rooms || []);

      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Room Info & Messages
  useEffect(() => {
    const currentId = roomId || 'general';

    // Fetch Room Info
    const fetchRoom = async () => {
        try {
            const res = await apiService.getRoom(currentId);
            if (res.room) {
                setCurrentRoomInfo(res.room);
            } else {
                // Fallback for general or non-existent
                const roomFromList = rooms.find(r => r.id === currentId);
                setCurrentRoomInfo(roomFromList || { name: 'General', id: currentId });
            }
        } catch (e) {
            console.error(e);
            setCurrentRoomInfo({ name: 'General', id: currentId });
        }
    };
    fetchRoom();

    // Fetch Messages - only if we have a valid room
    const fetchMessages = async () => {
        setMessages([]);
        try {
            // Check if room exists in the list first
            const roomExists = rooms.some(r => r.id === currentId);
            if (!roomExists && currentId === 'general') {
                // General room doesn't exist, try to get first available room
                if (rooms.length > 0) {
                    console.log('General room not found, you may want to create it or select an existing room');
                }
            }

            const data = await apiService.getRoomMessages(currentId).catch(err => {
                // 404 means room not found, return empty messages
                if (err.response?.status === 404) {
                    console.log(`Room "${currentId}" not found, showing empty messages`);
                    return { messages: [] };
                }
                throw err;
            });
            setMessages(data.messages || []);
        } catch (e) {
            console.error('Failed to fetch messages:', e);
        }
    };
    fetchMessages();

    // Socket Join
    socket.emit('joinRoom', { room: currentId });

    return () => {
        // Cleanup if needed
    };
  }, [roomId, rooms]);

  // --- Socket Listeners ---
  useEffect(() => {
    const handleMessage = (msg) => setMessages(prev => [...prev, msg]);
    const handleTyping = ({ user, userName, avatar, color }) => {
        // Add to typingUsers list (for backward compatibility)
        setTypingUsers(prev => prev.includes(user) ? prev : [...prev, user]);
        // Add detailed agent info to typingAgents
        setTypingAgents(prev => {
            const exists = prev.find(a => a.id === user);
            if (exists) return prev;
            return [...prev, { id: user, name: userName, avatar, color }];
        });
    };
    const handleStopTyping = ({ user }) => {
        setTypingUsers(prev => prev.filter(u => u !== user));
        setTypingAgents(prev => prev.filter(a => a.id !== user));
    };
    const handleReaction = ({ messageId, userId, emoji, action }) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = msg.reactions || [];
                if (action === 'add') {
                    return { ...msg, reactions: [...reactions, { message_id: messageId, user_id: userId, emoji }] };
                } else if (action === 'remove') {
                    return { ...msg, reactions: reactions.filter(r => !(r.user_id === userId && r.emoji === emoji)) };
                }
            }
            return msg;
        }));
    };

    socket.on('messageReceived', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('reactionUpdate', handleReaction);

    return () => {
        socket.off('messageReceived', handleMessage);
        socket.off('typing', handleTyping);
        socket.off('stopTyping', handleStopTyping);
        socket.off('reactionUpdate', handleReaction);
    };
  }, []);

  // --- Actions ---

  const handleSendMessage = (content = input, type = 'text', mediaUrl = null) => {
      if (!content && !mediaUrl) return;
      
      // Parse mentions
      const mentions = [];
      const mentionRegex = /@(\S+)/g;
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
          const name = match[1];
          const agent = agentList.find(a => a.name === name || a.id === name);
          if (agent) mentions.push(agent.id);
      }

      socket.emit('sendMessage', {
          room: roomId || 'general',
          sender: 'user',
          content,
          messageType: type,
          mediaUrl,
          mentions,
          replyToId: replyingTo?.id
      });

      if (!mediaUrl) setInput('');
      setShowEmojiPicker(false);
      setReplyingTo(null);
  };

  const handleTyping = () => {
      const room = roomId || 'general';
      socket.emit('typing', { room, user: 'user' });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          socket.emit('stopTyping', { room, user: 'user' });
      }, 3000);
  };

  const handleCreateRoom = async () => {
      const name = prompt('请输入新聊天室名称:');
      if (name) {
          try {
              const res = await apiService.createRoom(name, 'free');
              if (res.success) {
                  // Refresh rooms
                  const roomsData = await apiService.getRooms();
                  setRooms(roomsData.rooms || []);
                  navigate(`/chat/${res.roomId}`);
              }
          } catch (e) {
              alert('创建失败: ' + e.message);
          }
      }
  };

  const handleAddRobot = (robot) => {
      // Logic to add robot to room?
      // Currently robots are global, so maybe just mention them or send a system message
      handleSendMessage(`@${robot.name} 欢迎加入聊天室！`, 'text');
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          try {
              const res = await apiService.uploadImage(reader.result, file.name);
              if (res.success) {
                  handleSendMessage('', 'image', res.imageUrl);
                  // Refresh images
                  const imgs = await apiService.getUploadedImages();
                  setUploadedImages(imgs.images || []);
              }
          } catch (e) {
              console.error(e);
          }
      };
      reader.readAsDataURL(file);
  };

  if (loading) {
      return (
          <Layout>
              <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
          </Layout>
      );
  }

  // Prepare Member List (User + Online Agents) - memoized
  const members = useMemo(() => [
      { id: 'user', name: 'Current User', status: 'online', avatar: 'Me', color: 'bg-blue-500' },
      ...agentList.map(a => ({ ...a, color: a.color || 'bg-gray-400' }))
  ], [agentList]);

  // Memoized callback handlers
  const handleSelectRoom = useCallback((id) => navigate(`/chat/${id}`), [navigate]);

  const handleEmojiSelect = useCallback((emoji) => {
      setInput(prev => prev + emoji);
      setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleImageSelect = useCallback((url) => {
      handleSendMessage('', 'image', url);
      setShowImagePicker(false);
  }, [handleSendMessage]);

  const handleInvite = useCallback(() => setShowInviteModal(true), []);
  const handleManageWorldInfo = useCallback(() => setShowWorldInfoModal(true), []);

  return (
    <Layout>
        <div className="flex h-full bg-white overflow-hidden">
            {/* Left Column: Chat Sidebar */}
            <ChatSidebar
                rooms={rooms}
                currentRoomId={roomId || 'general'}
                onSelectRoom={handleSelectRoom}
                onCreateRoom={handleCreateRoom}
            />

            {/* Middle Column: Chat Area */}
            <ChatArea
                roomInfo={currentRoomInfo}
                messages={messages}
                currentUser="user"
                input={input}
                setInput={setInput}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                typingUsers={typingUsers}
                typingAgents={typingAgents}
                agentList={agentList}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                showImagePicker={showImagePicker}
                setShowImagePicker={setShowImagePicker}
                fileInputRef={fileInputRef}
                handleImageUpload={handleImageUpload}
                emojiList={emojiList}
                handleEmojiSelect={handleEmojiSelect}
                uploadedImages={uploadedImages}
                handleImageSelect={handleImageSelect}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                inputRef={inputRef}
            />

            {/* Right Column: Member Sidebar */}
            <MemberSidebar
                members={members}
                robots={agentList}
                onInvite={handleInvite}
                onAddRobot={handleAddRobot}
                onManageWorldInfo={handleManageWorldInfo}
            />

            {/* Modals */}
            <InviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                roomId={roomId}
            />
            <WorldInfoManager
                isOpen={showWorldInfoModal}
                onClose={() => setShowWorldInfoModal(false)}
            />
        </div>
    </Layout>
  );
}

export default ChatPage;
