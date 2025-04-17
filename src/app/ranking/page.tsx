'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

import React, { useEffect, useState } from 'react';

interface Player {
  name: string;
  score: number;
  finalScore: number;
}

const RankingPage = () => {
  const initialPlayers: Player[] = [
    { name: 'Alice', score: 0, finalScore: 50 },
    { name: 'Bob', score: 0, finalScore: 75 },
    { name: 'Charlie', score: 0, finalScore: 100 },
    { name: 'Diana', score: 0, finalScore: 25 },
    { name: 'Eve', score: 0, finalScore: 90 },
  ];

  const [players, setPlayers] = useState(initialPlayers);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prevPlayers) => {
        const newPlayers = prevPlayers.map((player) => ({
          ...player,
          score: Math.min(player.score + 1, player.finalScore),
        }));

        // スコアでソート
        return [...newPlayers].sort((a, b) => b.score - a.score);
      });
    }, 50);

    // すべてのプレイヤーが最終スコアに達したら終了
    if (players.every((player) => player.score === player.finalScore)) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [players]);

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4'>ランキング</h1>
      <AnimatePresence>
        <LayoutGroup>
          <div className='h-[400px] overflow-auto'>
            <div className='space-y-2'>
              {players.map((player, index) => (
                <motion.div
                  key={player.name}
                  layout
                  className='flex items-center space-x-2 whitespace-nowrap'
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <span className='font-bold'>{index + 1}位:</span>
                  <span className='w-24 truncate'>{player.name}</span>
                  <div className='bg-gray-200 h-4 flex-grow rounded overflow-hidden'>
                    <motion.div
                      className='bg-blue-500 h-4 rounded w-0'
                      animate={{ width: `${player.score}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <div className='w-16 text-right'>{player.score}点</div>
                </motion.div>
              ))}
            </div>
          </div>
        </LayoutGroup>
      </AnimatePresence>
    </div>
  );
};

export default RankingPage;
