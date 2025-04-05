import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatBot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import { OpenAI } from "openai";

// OpenAI configuration
const openai = new OpenAI({
  apiKey: "a46655e4f7ca48bbb5af4b60cc94c85a",
  baseURL: 'https://api.aimlapi.com',
  dangerouslyAllowBrowser: true,
});

// ActionProvider class
class ActionProvider {
  createChatBotMessage;
  setState;
  createClientMessage;
  createCustomMessage;
  stateRef;

  constructor(
    createChatBotMessage,
    setStateFunc,
    createClientMessage,
    stateRef,
    createCustomMessage,
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }

  callGenAI = async (prompt) => {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a legal assistant helping with legal queries and document analysis" },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 150,
    });
    return chatCompletion.choices[0].message.content;
  }

  timer = ms => new Promise(res => setTimeout(res, ms));

  generateResponse = async (userMessage) => {
    const responseFromGPT = await this.callGenAI(userMessage);
    const lines = responseFromGPT.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const message = this.createChatBotMessage(lines[i], {
        id: `msg-${Date.now()}-${i}` // Add unique id for each message
      });
      this.updateChatBotMessage(message);
      await this.timer(1000);
    }
  }
  
  respond = (message) => {
    this.generateResponse(message);
  }

  updateChatBotMessage = (message) => {
    this.setState(prevState => ({
      ...prevState, 
      messages: [...prevState.messages, message]
    }));
  }
}

// MessageParser class
class MessageParser {
  actionProvider;
  state;

  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    this.actionProvider.respond(message);
  }
}

// Config object
const config = {
  botName: 'LegalAssistant',
  initialMessages: [
    createChatBotMessage("Hello! I'm your AI legal assistant. How can I help you today?", {
      id: 'welcome-msg'
    })
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#3b82f6", // Changed to match the blue-500 color
    },
    chatButton: {
      backgroundColor: "#3b82f6",
    },
  },
  customComponents: {
    // Custom message component with improved styling
    botMessageBox: (props) => (
      <div key={props.message.id} className="react-chatbot-kit-chat-bot-message w-full max-w-full">
        <div className="react-chatbot-kit-chat-bot-message-container w-full">
          <div className="react-chatbot-kit-chat-bot-message-arrow"></div>
          <div className="react-chatbot-kit-chat-bot-message-text w-full text-white">
            {props.message.message}
          </div>
        </div>
      </div>
    ),
  },
  widgets: [],
  state: {
    gist: "",
  },
};

// Create chat bot message helper function
function createChatBotMessage(message, options = {}) {
  return {
    message,
    type: "bot",
    id: options.id || `msg-${Date.now()}`,
    ...options,
  };
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-[90vw] md:w-[400px] h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI Legal Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Container with Custom Styles */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full [&_.react-chatbot-kit-chat-container]:h-full [&_.react-chatbot-kit-chat-inner-container]:h-full">
              <ChatBot
                config={config}
                actionProvider={ActionProvider}
                messageParser={MessageParser}
                headerText="Chat with AI Legal Assistant"
                placeholderText="Type your legal question..."
                key="legal-chatbot"
                className="h-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Custom styles for chat widget */}
      <style jsx global>{`
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
}