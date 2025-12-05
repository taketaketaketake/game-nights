import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GamePlayerProps {
  sessionId: string;
  userId: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  timeLimit: number;
}

export default function GamePlayer({ sessionId, userId }: GamePlayerProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const API_URL = import.meta.env.PUBLIC_WS_URL || 'http://localhost:3000';
    const newSocket = io(API_URL, {
      auth: { userId, sessionId }
    });

    newSocket.on('connect', () => {
      console.log('Connected to game server');
      setConnected(true);
      newSocket.emit('join-game', sessionId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from game server');
      setConnected(false);
    });

    newSocket.on('question', (question: Question) => {
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setTimeRemaining(question.timeLimit);
    });

    newSocket.on('score-update', (newScore: number) => {
      setScore(newScore);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId, userId]);

  useEffect(() => {
    if (timeRemaining > 0 && currentQuestion) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, currentQuestion]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!socket || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    socket.emit('submit-answer', {
      questionId: currentQuestion?.id,
      answer: answerIndex,
      timeElapsed: (currentQuestion?.timeLimit || 0) - timeRemaining
    });
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎮</div>
          <p className="text-xl">Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl mb-4">Waiting for next question...</p>
          <p className="text-gray-400">Your score: {score}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Score & Timer */}
      <div className="flex justify-between items-center mb-8">
        <div className="bg-gray-800 px-6 py-3 rounded-lg">
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-3xl font-bold text-primary-400">{score}</div>
        </div>
        <div className="bg-gray-800 px-6 py-3 rounded-lg">
          <div className="text-sm text-gray-400">Time</div>
          <div className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-red-400' : 'text-secondary-400'}`}>
            {timeRemaining}s
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 p-8 rounded-xl mb-6">
        <h2 className="text-2xl font-bold mb-6">{currentQuestion.text}</h2>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`p-6 rounded-lg text-left font-semibold text-lg transition-all ${
                selectedAnswer === index
                  ? 'bg-primary-600 ring-4 ring-primary-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              } ${selectedAnswer !== null && selectedAnswer !== index ? 'opacity-50' : ''}`}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>
      </div>

      {selectedAnswer !== null && (
        <div className="text-center text-gray-400">
          Answer submitted! Waiting for results...
        </div>
      )}
    </div>
  );
}
