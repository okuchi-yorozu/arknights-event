import React, { useState } from 'react';

import ContractScoreDisplay from './ContractScoreDisplay';

interface ContractCalculatorProps {
  fiveStarOperatorImages: string[];
}

const ContractCalculator: React.FC<ContractCalculatorProps> = ({ fiveStarOperatorImages }) => {
  const [sixStarCount, setSixStarCount] = useState(0);
  const [teamSize, setTeamSize] = useState(12);

  const [fiveStarCheckedCount, setFiveStarCheckedCount] = useState(12);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked ? -1 : 1;
    setFiveStarCheckedCount((prevCount) => prevCount + value);
  };

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4'>契約計算機</h1>
      <div className='mb-4'>
        <div className='flex items-center gap-2 mb-2'>
          <label className='font-bold'>星6オペレーターの使用人数</label>
          <p className='text-gray-500 text-xs'>一人減ると+3点</p>
        </div>
        <div className='flex flex-wrap gap-2 max-w-[360px]'>
          {Array.from({ length: 14 }, (_, i) => (
            <button
              key={i}
              onClick={() => setSixStarCount(i)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                sixStarCount === i ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className='mb-4'>
        <div className='flex items-center gap-2'>
          <p className='font-bold'>BAN星5オペレーターの使用人数</p>
          <p className='text-gray-500 text-xs'>一人減ると+1点</p>
        </div>
        <p className='text-gray-500 text-xs mb-2'>選定基準は、億千よろずのクリア時の編成</p>
        <div className='grid grid-cols-4 gap-2 mb-2 max-w-[360px]'>
          {fiveStarOperatorImages.map((image, i) => (
            <div key={i} className='flex flex-col items-center'>
              <label className='cursor-pointer'>
                <input type='checkbox' onChange={handleCheckboxChange} className='hidden peer' />
                <img
                  src={image}
                  alt={`星5オペレーター ${i + 1}`}
                  className='w-16 h-16 object-cover rounded border-solid border-2 peer-checked:border-blue-500 peer-checked:opacity-100 border-gray-300 opacity-50'
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className='mb-4'>
        <div className='flex items-center gap-2 mb-2'>
          <label className='font-bold'>編成人数</label>
          <p className='text-gray-500 text-xs'>一人減ると+5点</p>
        </div>
        <div className='flex flex-wrap gap-2 max-w-[360px]'>
          {Array.from({ length: 14 }, (_, i) => (
            <button
              key={i}
              onClick={() => setTeamSize(i)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                teamSize === i ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <ContractScoreDisplay
        sixStarCount={sixStarCount}
        teamSize={teamSize}
        fiveStarCheckedCount={fiveStarCheckedCount}
      />
    </div>
  );
};

export default ContractCalculator;
