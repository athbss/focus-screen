import React, { useState, useEffect } from 'react';

const GoogleCalendarSettings = ({ 
  clientId,
  setClientId,
  apiKey,
  setApiKey,
  onSave,
  onClose,
  isConnected,
  onConnect,
  onDisconnect 
}) => {
  return (
    <div className="bg-white p-8 rounded-lg max-w-md w-full rtl">
      <h2 className="text-2xl font-bold mb-4">הגדרות יומן גוגל</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Client ID
          <input
            type="password"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          API Key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
      </div>

      <div className="flex justify-between">
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={!clientId || !apiKey}
          >
            התחבר ליומן גוגל
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            התנתק מיומן גוגל
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarSettings;
