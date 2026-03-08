import React from 'react';

const SystemMessage = ({ content }) => {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
        {content}
      </div>
    </div>
  );
};

export default SystemMessage;
