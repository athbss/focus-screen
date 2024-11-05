import React from 'react';
import { ExternalLink } from 'lucide-react';

const GoogleCalendarHelp = ({ onClose }) => {
  return (
    <div className="bg-white p-8 rounded-lg max-w-2xl w-full rtl overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">הגדרת יומן גוגל - הסבר</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      </div>

      <div className="space-y-4">
        <section>
          <h3 className="text-xl font-semibold mb-2">שלב 1: יצירת פרויקט</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>היכנס ל-Google Cloud Console</li>
            <li>צור פרויקט חדש עם שם לבחירתך</li>
          </ol>
          <a 
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center mt-2"
          >
            פתח Google Cloud Console
            <ExternalLink size={16} className="mr-1" />
          </a>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">שלב 2: הפעלת Google Calendar API</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>עבור ל-"APIs & Services" > "Library"</li>
            <li>חפש "Google Calendar API"</li>
            <li>הפעל את ה-API</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">שלב 3: יצירת Credentials</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>עבור ל-"APIs & Services" > "Credentials"</li>
            <li>צור OAuth client ID לאפליקציית web</li>
            <li>הגדר את מסך ההסכמה</li>
            <li>צור API Key</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">שלב 4: הגדרה באפליקציה</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>העתק את ה-Client ID וה-API Key</li>
            <li>הזן אותם בהגדרות האפליקציה</li>
            <li>לחץ על "התחבר ליומן גוגל"</li>
          </ol>
        </section>

        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <p className="text-blue-800">
            <strong>טיפ:</strong> בסביבת פיתוח, השתמש ב-localhost:3000 כ-Authorized JavaScript origin.
            בסביבת ייצור, תצטרך להשתמש בדומיין האמיתי של האפליקציה.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          הבנתי, תודה
        </button>
      </div>
    </div>
  );
};

export default GoogleCalendarHelp;
