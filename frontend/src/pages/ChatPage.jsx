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
// 协作模式视图组件
import WarRoomView from '../components/Collaboration/WarRoomView';
import ChatRoomView from '../components/Collaboration/ChatRoomView';
import PanelView from '../components/Collaboration/PanelView';
import StandaloneView from '../components/Collaboration/StandaloneView';

function ChatPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  // Data State
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRoomInfo, setCurrentRoomInfo] = useState({});
  const [collaborationMode, setCollaborationMode] = useState('chat-room'); // 协作模式

  // UI State
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWorldInfoModal, setShowWorldInfoModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingAgents, setTypingAgents] = useState([]);
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

    const fetchRoom = async () => {
        try {
            const res = await apiService.getRoom(currentId);
            if (res.room) {
                setCurrentRoomInfo(res.room);
            } else {
                const roomFromList = rooms.find(r => r.id === currentId);
                setCurrentRoomInfo(roomFromList || { name: 'General', id: currentId });
            }
        } catch (e) {
            console.error(e);
            setCurrentRoomInfo({ name: 'General', id: currentId });
        }
    };
    fetchRoom();

    const fetchMessages = async () => {
        setMessages([]);
        try {
            const roomExists = rooms.some(r => r.id === currentId);
            if (!roomExists && currentId === 'general') {
                if (rooms.length > 0) {
                    console.log('General room not found, you may want to create it or select an existing room');
                }
            }

            const data = await apiService.getRoomMessages(currentId).catch(err => {
                if (err.response?.status === 404) {
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

    socket.emit('joinRoom', { room: currentId });

    return () => {};
  }, [roomId, rooms]);

  // --- Socket Listeners ---
  useEffect(() => {
    const handleMessage = (msg) => setMessages(prev => [...prev, msg]);
    const handleTyping = ({ user, userName, avatar, color }) => {
        setTypingUsers(prev => prev.includes(user) ? prev : [...prev, user]);
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

  // --- Memoized Actions (MUST be before conditional render) ---

  const handleSendMessage = useCallback((content = input, type = 'text', mediaUrl = null) => {
      if (!content && !mediaUrl) return;

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
  }, [input, agentList, roomId, replyingTo]);

  const handleTyping = useCallback(() => {
      const room = roomId || 'general';
      socket.emit('typing', { room, user: 'user' });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          socket.emit('stopTyping', { room, user: 'user' });
      }, 3000);
  }, [roomId]);

  const handleCreateRoom = useCallback(async () => {
      const name = prompt('请输入新聊天室名称:');
      if (name) {
          try {
              const res = await apiService.createRoom(name, 'free');
              if (res.success) {
                  const roomsData = await apiService.getRooms();
                  setRooms(roomsData.rooms || []);
                  navigate(`/chat/${res.roomId}`);
              }
          } catch (e) {
              alert('创建失败：' + e.message);
          }
      }
  }, [navigate]);

  const handleAddRobot = useCallback((robot) => {
      handleSendMessage(`@${robot.name} 欢迎加入聊天室！`, 'text');
  }, [handleSendMessage]);

  const handleImageUpload = useCallback(async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
          try {
              const res = await apiService.uploadImage(reader.result, file.name);
              if (res.success) {
                  handleSendMessage('', 'image', res.imageUrl);
                  const imgs = await apiService.getUploadedImages();
                  setUploadedImages(imgs.images || []);
              }
          } catch (e) {
              console.error(e);
          }
      };
      reader.readAsDataURL(file);
  }, [handleSendMessage]);

  // Memoized values and callbacks - MUST be before conditional render
  const members = useMemo(() => [
      { id: 'user', name: 'Current User', status: 'online', avatar: 'Me', color: 'bg-blue-500' },
      ...agentList.map(a => ({ ...a, color: a.color || 'bg-gray-400' }))
  ], [agentList]);

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

  // 根据协作模式渲染不同视图
  const renderCollaborationView = () => {
    const viewProps = {
      roomInfo: currentRoomInfo,
      members: members
    };

    switch (collaborationMode) {
      case 'war-room':
        return (
          <WarRoomView {...viewProps}>
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
          </WarRoomView>
        );
      case 'chat-room':
        return (
          <ChatRoomView {...viewProps}>
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
          </ChatRoomView>
        );
      case 'panel':
        return (
          <PanelView {...viewProps}>
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
          </PanelView>
        );
      case 'standalone':
        return (
          <StandaloneView {...viewProps}>
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
          </StandaloneView>
        );
      default:
        return (
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
        );
    }
  };

  // Conditional render - MUST be after all hooks
  if (loading) {
      return (
          <Layout>
              <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
        <div className="flex h-full bg-gradient-bg overflow-hidden">
            <ChatSidebar
                rooms={rooms}
                currentRoomId={roomId || 'general'}
                onSelectRoom={handleSelectRoom}
                onCreateRoom={handleCreateRoom}
            />

            {/* 根据协作模式渲染不同视图 */}
            {renderCollaborationView()}

            <MemberSidebar
                members={members}
                robots={agentList}
                onInvite={handleInvite}
                onAddRobot={handleAddRobot}
                onManageWorldInfo={handleManageWorldInfo}
            />

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
