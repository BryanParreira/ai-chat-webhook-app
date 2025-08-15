import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  user?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    model?: string;
  };
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  messageCount: number;
  lastMessageTime: string | null;
  exportMessages: () => Promise<string>;
  searchMessages: (query: string) => Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Storage key for persisting messages
const STORAGE_KEY = '@chat_messages';

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  maxMessages?: number; // Optional limit for message history
  persistMessages?: boolean; // Whether to save messages to storage
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  maxMessages = 1000,
  persistMessages = true 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages from storage on mount
  useEffect(() => {
    if (persistMessages) {
      loadMessagesFromStorage();
    }
  }, [persistMessages]);

  // Save messages to storage whenever messages change
  useEffect(() => {
    if (persistMessages && messages.length > 0) {
      saveMessagesToStorage();
    }
  }, [messages, persistMessages]);

  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
  };

  const saveMessagesToStorage = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      timestamp: new Date().toISOString(),
      status: message.sender === 'user' ? 'sent' : 'delivered',
    };

    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      
      // Limit message history if maxMessages is set
      if (maxMessages && updatedMessages.length > maxMessages) {
        return updatedMessages.slice(-maxMessages);
      }
      
      return updatedMessages;
    });
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearMessages = async () => {
    setMessages([]);
    if (persistMessages) {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing messages from storage:', error);
      }
    }
  };

  const exportMessages = async (): Promise<string> => {
    const exportData = {
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        user: msg.user,
      })),
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const searchMessages = (query: string): Message[] => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return messages.filter(msg => 
      msg.text.toLowerCase().includes(lowercaseQuery) ||
      (msg.user && msg.user.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Computed values
  const messageCount = messages.length;
  const lastMessageTime = messages.length > 0 
    ? messages[messages.length - 1].timestamp 
    : null;

  const contextValue: ChatContextType = {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    isTyping,
    setIsTyping,
    messageCount,
    lastMessageTime,
    exportMessages,
    searchMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Additional utility hooks
export const useMessageSearch = () => {
  const { searchMessages } = useChatContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchMessages(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchMessages]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults: searchResults.length > 0,
  };
};

export const useMessageStats = () => {
  const { messages, messageCount, lastMessageTime } = useChatContext();

  const userMessageCount = messages.filter(msg => msg.sender === 'user').length;
  const botMessageCount = messages.filter(msg => msg.sender === 'bot').length;
  
  const todayMessages = messages.filter(msg => {
    const messageDate = new Date(msg.timestamp);
    const today = new Date();
    return messageDate.toDateString() === today.toDateString();
  }).length;

  const averageMessageLength = messages.length > 0 
    ? Math.round(messages.reduce((sum, msg) => sum + msg.text.length, 0) / messages.length)
    : 0;

  return {
    totalMessages: messageCount,
    userMessages: userMessageCount,
    botMessages: botMessageCount,
    todayMessages,
    averageMessageLength,
    lastMessageTime,
    conversationStarted: messages.length > 0 ? messages[0].timestamp : null,
  };
};

export const useTypingIndicator = (duration: number = 3000) => {
  const { setIsTyping } = useChatContext();

  const showTyping = (customDuration?: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, customDuration || duration);
  };

  return { showTyping };
};

export { ChatContext };
export default ChatProvider;