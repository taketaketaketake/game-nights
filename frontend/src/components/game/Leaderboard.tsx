import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  avatar?: string;
}

interface LeaderboardProps {
  sessionId: string;
}

export default function Leaderboard({ sessionId }: LeaderboardProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.PUBLIC_WS_URL || 'http://localhost:3000';
    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      newSocket.emit('subscribe-leaderboard', sessionId);
    });

    newSocket.on('leaderboard-update', (data: LeaderboardEntry[]) => {
      setLeaderboard(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <span>🏆</span>
        <span>Leaderboard</span>
      </h2>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-lg ${
              index < 3 ? 'bg-gradient-to-r' : 'bg-gray-700'
            } ${
              index === 0
                ? 'from-yellow-600 to-yellow-700'
                : index === 1
                ? 'from-gray-400 to-gray-500'
                : index === 2
                ? 'from-orange-600 to-orange-700'
                : ''
            }`}
          >
            <div className="text-2xl font-bold w-8">
              {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}`}
            </div>

            <div className="flex-1">
              <div className="font-semibold">{entry.username}</div>
            </div>

            <div className="text-2xl font-bold">
              {entry.score}
            </div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No players yet. Be the first to join!
          </div>
        )}
      </div>
    </div>
  );
}
