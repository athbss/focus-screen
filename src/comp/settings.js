import React, {useState, useEffect} from 'react';
import {RefreshCw} from "lucide-react";
import GoogleCalendarHelp from './google-calendar-help';
import CalendarSelector from './calendar-selector';


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
                      showTimer,
                      googleClientId,
                      setGoogleClientId,
                      googleApiKey,
                      setGoogleApiKey,
                      isGoogleConnected,
                      onGoogleConnect,
                      onGoogleDisconnect,
                      showCalendarEvents,
                      setShowCalendarEvents,
                      calendarService,
                      selectedCalendars,
                      setSelectedCalendars,
                      showAllDayEvents,
                      setShowAllDayEvents,
                      onSaveTogglSettings, // הוספת onSaveTogglSettings כפרופס לשמירת ההגדרות
                      togglApiToken,
                      setTogglApiToken,
                      workspaceId,
                      setWorkspaceId,
                  }) => {

    const [showHelp, setShowHelp] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    // const [togglApiToken, setTogglApiToken] = useState(''); // משתנה מצב עבור Toggl API Token
    // const [workspaceId, setWorkspaceId] = useState(''); // משתנה מצב עבור Toggl API Token



    // טוען את ה-Toggl API Token מ-localStorage בעת הטעינה
    useEffect(() => {
        const savedTogglToken = localStorage.getItem('togglApiToken');
        if (savedTogglToken) {
            setTogglApiToken(savedTogglToken);
        }
    }, []);

    // טוען את ה-Toggl API Token מ-localStorage בעת הטעינה
    useEffect(() => {
        const savedTogglWorkspaceID = localStorage.getItem('workspaceId');
        if (savedTogglWorkspaceID) {
            setWorkspaceId(savedTogglWorkspaceID);
        }
    }, []);

    // שמירת ה-Toggl API Token ב-localStorage בעת שינוי
    const handleTogglTokenChange = (e) => {
        const token = e.target.value;
        setTogglApiToken(token);
        localStorage.setItem('togglApiToken', token);
    };

    const handleWorkspaceIdChange = (e) => {
        const id = e.target.value;
        setWorkspaceId(id);
        localStorage.setItem('workspaceId', id);
    };

    const handleSave = () => {
        onSaveTodoistSettings(todoistApiToken);
        onSaveTogglSettings(togglApiToken); // קריאה לפונקציה שמירת Toggl API Token
        onClose();
    };


    const handleCalendarToggle = () => {
        setShowCalendarModal(!showCalendarModal);
    };
    useEffect(() => {
        localStorage.setItem('showCalendarEvents', JSON.stringify(showCalendarEvents));
    }, [showCalendarEvents]);

    const resetGoogleCredentials = () => {
        setGoogleClientId(process.env.REACT_APP_GOOGLE_CLIENT_ID);
        setGoogleApiKey(process.env.REACT_APP_GOOGLE_API_KEY);
        localStorage.removeItem('googleClientId');
        localStorage.removeItem('googleApiKey');
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

            {/* שדה הזנה עבור Toggl API Token */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Toggl API Token
                    <input
                        type="password"
                        value={togglApiToken}
                        onChange={handleTogglTokenChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="הזן את ה-Toggl API Token"
                    />
                </label>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Workspace ID</label>
                <input
                    type="text"
                    value={workspaceId}
                    onChange={handleWorkspaceIdChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="הזן את ה-Workspace ID"
                />
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

            <div className="border-t border-b pb-4 my-4 pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">הגדרות יומן גוגל</h3>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        צריך עזרה?
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Client ID
                        <input
                            type="password"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </label>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        API Key
                        <input
                            type="password"
                            value={googleApiKey}
                            onChange={(e) => setGoogleApiKey(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </label>
                </div>

                <div className="flex justify-between mb-4">
                    <button
                        onClick={resetGoogleCredentials}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        אפס להגדרות ברירת מחדל
                    </button>

                    {!isGoogleConnected ? (
                        <button
                            onClick={onGoogleConnect}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            disabled={!googleClientId || !googleApiKey}
                        >
                            התחבר ליומן גוגל
                        </button>
                    ) : (
                        <button
                            onClick={onGoogleDisconnect}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            התנתק מיומן גוגל
                        </button>

                    )}
                </div>

                <div className="flex justify-between">
                    <div className="mb-4 ml-2 mr-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showCalendarEvents}
                                onChange={(e) => setShowCalendarEvents(e.target.checked)}
                                className="ml-2"
                            />
                            הצג אירועים במסך הראשי
                        </label>
                    </div>

                    {isGoogleConnected && showCalendarEvents && (
                        <>
                            <button onClick={handleCalendarToggle} className="bg-blue-500 text-white p-2 rounded">בחר יומנים להצגה</button>
                            <div className="flex justify-between">
                                <div className="mb-4 ml-2 mr-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={showAllDayEvents}
                                            onChange={(e) => setShowAllDayEvents(e.target.checked)}
                                            className="ml-2"
                                        />
                                        הצג אירועי יום שלם
                                    </label>
                                </div>
                            </div>

                            {showCalendarModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                                        <CalendarSelector
                                            calendarService={calendarService}
                                            selectedCalendars={selectedCalendars}
                                            onCalendarSelectionChange={(calendars) => {
                                                setSelectedCalendars(calendars);
                                            }}
                                            onClose={() =>  handleCalendarToggle()}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
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

            {showHelp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <GoogleCalendarHelp onClose={() => setShowHelp(false)} />
                </div>
            )}
        </div>
    );
};

export default Settings;