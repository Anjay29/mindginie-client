import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const [botMessage, setBotMessage] = useState('');
  const [typingInterrupted, setTypingInterrupted] = useState(false);
  const [partialBotMessage, setPartialBotMessage] = useState('');
  const [firstBotMessage, setFirstBotMessage] = useState(false);

  const scrollViewRef = useRef();
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    if (!firstBotMessage) {
      handleBotResponse(
        `Emma is having an ongoing panic attack. She is alone & needs to talk to someone. Please have a comforting conversation with Emma now.`
      );
      setFirstBotMessage(true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!botTyping && inputText.trim() === '') {
      alert('Please enter something!');
      return;
    }

    if (botTyping) {
      clearInterval(typingIntervalRef.current);
      setTypingInterrupted(true); 
      setBotTyping(false);
      setMessages([...messages, { text: partialBotMessage, sender: 'bot', timestamp: new Date() }]);
      setBotMessage('');
      setPartialBotMessage('');
      return;
    }

    const userMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setInputText('');
    setBotMessage('');
    handleBotResponse(userMessage.text);
  };

  const handleBotResponse = async (userText) => {
    try {
      setBotTyping(true);
      setTypingInterrupted(false);
      const response = await axios.post('https://mind-ginie-chatbot-backend.vercel.app/chat', { userText });
      const botMessageContent = response.data.botMessage;
      typeBotMessage(botMessageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      setBotTyping(false);
    }
  };

  const typeBotMessage = (fullBotMessage) => {
    let index = 0;
    setBotMessage('');
    setTypingInterrupted(false);

    clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      setBotMessage((prev) => {
        const newMessage = prev + fullBotMessage[index];
        setPartialBotMessage(newMessage);
        scrollToBottom();
        return newMessage;
      });
      index++;
      if (index === fullBotMessage.length && fullBotMessage.length !== 0) {
        clearInterval(typingIntervalRef.current);
        setMessages((prev) => [
          ...prev,
          { text: fullBotMessage, sender: 'bot', timestamp: new Date() },
        ]);
        setBotTyping(false);
        setTypingInterrupted(false);
        setBotMessage('');
        setPartialBotMessage('');
        scrollToBottom();
      }
    }, 50);
  };

  const formatTime = (date) => {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className='flex flex-col h-screen w-full'>
      <div className="flex flex-col flex-grow overflow-y-auto p-4 rounded-lg']" ref={scrollViewRef}>
        <div className="flex flex-col items-center mb-4">
          <img
            src="/MindGinie_Original.jpg"
            alt="Mindginie Logo"
            className="h-20 w-20 rounded-full mt-12 shadow-lg"
          />
          <h1 className="text-2xl mt-4 mb-2">Mindginie : Your Friend</h1>
          <div className="flex flex-row opacity-40">
            <a href="https://www.mindginie.com/" className="mr-2 mb-4">
              By mindginie.com
            </a>
            <img src="/www.png" alt="Mindginie" className="h-3 w-3 mt-1.5" />
          </div>
        </div>

        <div className='flex flex-col'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.sender === 'user' ? 'self-end bg-gray-200 rounded-t-xl rounded-bl-xl max-w-[70%]' : ' self-start bg-teal-500 text-white rounded-t-xl rounded-br-xl max-w-[70%]'
              } p-2 mb-2`}
            >
              <p>{message.text}</p>
              <div className="text-xs text-right pt-1">
                {formatTime(new Date(message.timestamp))}
              </div>
            </div>
          ))}

          {botTyping && (
            <div className="self-start bg-teal-500 text-white p-2 rounded-t-xl rounded-br-xl mb-2 max-w-[70%]">
              <p>{botMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex ml-2 mt-2 mb-2">
        <input
          className="border border-gray-300 p-2 rounded-3xl flex-grow"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message Mindginie..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className={`p-2 rounded-lg opacity-45`}
          onClick={handleSend}
        >
          <div className='h-10 w-10'>
            <img src={botTyping ? '/stop.png' : "/up-arrow.png"} alt='control-icon' />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
