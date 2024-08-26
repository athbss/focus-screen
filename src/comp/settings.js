import React, {useState} from 'react';
import {RefreshCw} from "lucide-react";

const Settings = ({
                      showSeconds,
                      setShowSeconds,
                      darkMode,
                      setDarkMode,
                      language,
                      setLanguage,
                      currentTask,
                      setCurrentTask,
                      timerType,
                      setTimerType,
                      timerDuration,
                      setTimerDuration,
                      timerEndTime,
                      setTimerEndTime,
                      todoistApiToken,
                      setTodoistApiToken,
                      onClose,
                      onSaveTodoistSettings,
                      setShowStopwatch,
                      setShowTimer,
                      showStopwatch,
                      showTimer
                  }) => {
    const handleSave = () => {
        onSaveTodoistSettings(todoistApiToken);
        onClose();
    };
    const [refreshTodoistTasks, setRefreshTodoistTasks] = useState(false);

    const handleRefreshTodoistTasks = () => {
        setRefreshTodoistTasks(prev => !prev);
    };
    return (
        <div className="bg-white p-8 rounded-lg max-w-md w-full rtl" style={{ textAlign: 'right' }}>
            <h2 className="text-2xl font-bold mb-4">הגדרות</h2>

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showSeconds}
                        onChange={(e) => setShowSeconds(e.target.checked)}
                        className="ml-2"
                    />
                    הצג שניות
                </label>
            </div>

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="ml-2"
                    />
                    מצב כהה
                </label>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    שפה ולוקליזציה
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="he">עברית</option>
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="ar">العربية</option>
                    </select>
                </label>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    על מה אתה עובד עכשיו?
                    <input
                        type="text"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </label>
            </div>
            <div className="mb-4 flex">
                <div className="mb-4 flex-col w-1/2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={showStopwatch}
                            onChange={(e) => setShowStopwatch(e.target.checked)}
                            className="ml-2"
                        />
                        הצג שעון עצר
                    </label>
                </div>

                <div className="mb-4 flex-col w-1/2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={showTimer}
                            onChange={(e) => setShowTimer(e.target.checked)}
                            className="ml-2"
                        />
                        הצג טיימר
                    </label>
                </div>
            </div>
            <div className="mb-4 flex">
                <div className="mb-4 w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        סוג טיימר
                        <select
                            value={timerType}
                            onChange={(e) => setTimerType(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="duration">משך זמן</option>
                            <option value="specific">שעה מסוימת</option>
                        </select>
                    </label>
                </div>

                {timerType === 'duration' ? (
                    <div className="mb-4 flex-col w-1/2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            משך הטיימר (בדקות)
                            <input
                                type="number"
                                value={timerDuration}
                                onChange={(e) => setTimerDuration(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="mb-4 flex-col w-1/2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            שעת סיום
                            <input
                                type="time"
                                value={timerEndTime}
                                onChange={(e) => setTimerEndTime(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </label>
                    </div>
                )}

            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Todoist API Token
                    <input
                        type="password"
                        value={todoistApiToken}
                        onChange={(e) => setTodoistApiToken(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </label>
                <button
                    onClick={handleRefreshTodoistTasks}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    <RefreshCw className="inline-block ml-2" />
                    רענן משימות
                </button>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    שמור
                </button>
                <button
                    onClick={onClose}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    סגור
                </button>
            </div>
        </div>
    );
};

export default Settings;