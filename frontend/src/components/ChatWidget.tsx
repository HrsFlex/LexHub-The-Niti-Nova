"use client";

import React, { useState } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import ChatBot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import {
  createChatBotMessage as createChatBotMessageType,
} from "react-chatbot-kit";
import IWidget from 'react-chatbot-kit/build/src/interfaces/IWidget';

// Types for clarity
type ChatMessage = {
  message: string;
  type: string;
  id: number;
  loading?: boolean;
  widget?: string;
  delay?: number;
  payload?: unknown;
};

type ChatState = {
  messages: ChatMessage[];
  gist?: string;
  isLoading: boolean;
  error?: string;
};

type MessageOptions = {
  id?: string;
  loading?: boolean;
  widget?: string;
  delay?: number;
  payload?: unknown;
};

type ChatbotConfig = {
  botName: string;
  initialMessages: ChatMessage[];
  customStyles?: Record<string, unknown>;
  customComponents?: Record<string, React.ComponentType<unknown>>;
  widgets?: IWidget[];
  state?: Record<string, unknown>;
};

// ActionProvider
class ActionProvider {
  createChatBotMessage: typeof createChatBotMessageType;
  setState: React.Dispatch<React.SetStateAction<ChatState>>;
  createClientMessage: (message: string, options?: MessageOptions) => ChatMessage;
  stateRef: ChatState;
  createCustomMessage: (component: React.ReactNode, options?: MessageOptions) => ChatMessage;

  constructor(
    createChatBotMessage: typeof createChatBotMessageType,
    setStateFunc: React.Dispatch<React.SetStateAction<ChatState>>,
    createClientMessage: (message: string, options?: MessageOptions) => ChatMessage,
    stateRef: ChatState,
    createCustomMessage: (component: React.ReactNode, options?: MessageOptions) => ChatMessage
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }

  timer = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

  callGenAI = async (prompt: string): Promise<string> => {
    try {
      this.setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await res.json();
      return data.response;
    } catch (error) {
      this.setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }));
      throw error;
    } finally {
      this.setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  generateResponse = async (userMessage: string) => {
    const responseFromGPT = await this.callGenAI(userMessage);
    const lines = responseFromGPT.split("\n").filter((line: string) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const message = this.createChatBotMessage(lines[i], {
        delay: 0,
        loading: false
      });
      this.updateChatBotMessage(message);
      await this.timer(1000);
    }
  };

  respond = (message: string) => {
    this.generateResponse(message);
  };

  updateChatBotMessage = (message: ChatMessage) => {
    this.setState((prevState: ChatState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

// MessageParser
class MessageParser {
  actionProvider: ActionProvider;
  state: ChatState;

  constructor(actionProvider: ActionProvider, state: ChatState) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message: string) {
    this.actionProvider.respond(message);
  }
}

// Helper
function createChatBotMessage(message: string, options: Partial<MessageOptions> = {}): ChatMessage {
  return {
    message,
    type: "bot",
    id: typeof options.id === 'number' ? options.id : Date.now(),
    loading: options.loading,
    widget: options.widget,
    delay: options.delay,
    payload: options.payload
  };
}

// Config
const config: ChatbotConfig = {
  botName: "LegalAssistant",
  initialMessages: [
    createChatBotMessage("Hello! I'm your AI legal assistant. How can I help you today?", {
      id: "welcome-msg",
    }),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#3b82f6",
    },
    chatButton: {
      backgroundColor: "#3b82f6",
    },
  },
  customComponents: {
    botMessageBox: (props: unknown) => {
      const { message } = props as { message: ChatMessage };
      return (
        <div key={message.id} className="react-chatbot-kit-chat-bot-message w-full max-w-full">
          <div className="react-chatbot-kit-chat-bot-message-container w-full">
            <div className="react-chatbot-kit-chat-bot-message-arrow"></div>
            <div className="react-chatbot-kit-chat-bot-message-text w-full text-white">
              {message.message}
            </div>
          </div>
        </div>
      );
    },
  },
  widgets: [],
  state: {
    gist: "",
  },
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-[90vw] md:w-[400px] h-[600px] flex flex-col">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI Legal Assistant</h3>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full [&_.react-chatbot-kit-chat-container]:h-full [&_.react-chatbot-kit-chat-inner-container]:h-full">
              <ChatBot
                config={config}
                actionProvider={ActionProvider}
                messageParser={MessageParser}
                placeholderText="Type your legal question..."
                key="legal-chatbot"
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          aria-label="Open chat"
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      <style>{`
        .react-chatbot-kit-chat-container {
          width: 100% !important;
        }
        .react-chatbot-kit-chat-message-container {
          padding: 1rem;
        }
        .react-chatbot-kit-chat-bot-message {
          width: 100%;
          margin: 0.5rem 0;
        }
        .react-chatbot-kit-chat-bot-message-container {
          width: 100%;
          background-color: #3b82f6;
          border-radius: 0.5rem;
        }
        .react-chatbot-kit-chat-input {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        .react-chatbot-kit-chat-btn-send {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          background-color: #3b82f6;
        }
        .react-chatbot-kit-chat-btn-send:hover {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;