import React, { useState, useEffect, useCallback } from 'react';
import TodoistTasks from './comp/todoist';
import Camera from './comp/camera';
import Settings from './comp/settings';
import { GoogleCalendarService } from './comp/google-calendar-service';
import TodayEvents from "./comp/today-events-list";
import  { getRelativeTime, isFuture } from './helper/functions';
import { format, isToday, parseISO, compareAsc } from 'date-fns';
import TogglIntegration from "./comp/toggl";
import { Toaster } from 'react-hot-toast';
import packageJson from '../package.json';



// import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import {
  Settings as SettingsIcon,
  Timer,
  Clock,
  Calendar,
  RefreshCw,
  Play,
  Pause,
  Square,
  RotateCw,
  Flag,
  CirclePower
} from 'lucide-react';
import toggl from "./comp/toggl";
// import { CirclePower } from 'lucide-preact';


const App = () => {
// console.log('App');
// console.log(packageJson)
  const [googleClientId, setGoogleClientId] = useState(() =>
      localStorage.getItem('googleClientId') || process.env.REACT_APP_GOOGLE_CLIENT_ID
  );
  const [googleApiKey, setGoogleApiKey] = useState(() =>
      localStorage.getItem('googleApiKey') || process.env.REACT_APP_GOOGLE_API_KEY
  );
  const [isGoogleConnected, setIsGoogleConnected] = useState(() => !!localStorage.getItem('googleClientId'));
  const [calendarService, setCalendarService] = useState( () => {
    const service = new GoogleCalendarService(googleClientId, googleApiKey);
    const success = service.init();
    if (success) {
      return service;
    }
    return null;
  });

  const [allCalendars, setAllCalendars] = useState(async() =>  {
    let calendars = await calendarService.getCalendarList();
    if (calendars) {
      return calendars;
    }
    return [];
  });

  const handleGoogleConnect = async () => {
    const service = new GoogleCalendarService(googleClientId, googleApiKey);
    const success = await service.init();

    if (success) {
      setCalendarService(service);
      setIsGoogleConnected(true);
      localStorage.setItem('googleClientId', googleClientId);
      localStorage.setItem('googleApiKey', googleApiKey);
    } else {
      alert('Failed to connect to Google Calendar');
    }
  };

  const handleGoogleDisconnect = () => {
    if (calendarService) {
      calendarService.disconnectFromGoogle();
    }
    setCalendarService(null);
    setIsGoogleConnected(false);
    setSelectedCalendars([]);
    localStorage.removeItem('selectedCalendars');
  };

  const [showAllDayEvents, setShowAllDayEvents] = useState(() =>
      JSON.parse(localStorage.getItem('showAllDayEvents')) ?? false
  );

// שמירת ההגדרה ב-localStorage כאשר היא משתנה
  useEffect(() => {
    localStorage.setItem('showAllDayEvents', JSON.stringify(showAllDayEvents));
  }, [showAllDayEvents]);

  const addToGoogleCalendar = async (task) => {
    if (!calendarService) {
      alert('Please connect to Google Calendar first');
      return;
    }

    try {
      const event = {
        summary: task,
        start: {
          dateTime: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await calendarService.addEvent(event);
      alert('Event added to Google Calendar');
    } catch (error) {
      alert('Failed to add event to Google Calendar');
    }
  };

  const [showCalendarEvents, setShowCalendarEvents] = useState(() =>
      JSON.parse(localStorage.getItem('showCalendarEvents')) ?? false
  );
  const [selectedCalendars, setSelectedCalendars] = useState(() =>
      JSON.parse(localStorage.getItem('selectedCalendars')) ?? []
  );

  const [nextEvent, setNextEvent] = useState(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('showCalendarEvents', JSON.stringify(showCalendarEvents));
  }, [showCalendarEvents]);

  useEffect(() => {
    localStorage.setItem('selectedCalendars', JSON.stringify(selectedCalendars));
  }, [selectedCalendars]);

  // const [showCalendarModal, setShowCalendarModal] = useState(false);
  //
  // const handleCalendarToggle = () => {
  //   setShowCalendarModal(!showCalendarModal);
  // };

  // Fetch next event when needed
  useEffect(() => {
    const fetchNextEvent = async () => {
      if (showCalendarEvents && selectedCalendars.length > 0 && calendarService) {
        try {
          const event = await calendarService.getNextEventToday(selectedCalendars, showAllDayEvents);
          setNextEvent(event);
          if (!timerRunning) {
            console.log('Setting timer for next event:', event);
            const timeOnly = new Date(event.start.dateTime).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            setTimerEndTime(timeOnly);
            setTimerType('specific');
            startTimer();
          }
        } catch (error) {
          console.error('Error fetching next event:', error);
        }
      } else {
        setNextEvent(null);
      }
    };
    fetchNextEvent();
    // Set up polling every minute
    const interval = setInterval(fetchNextEvent, 60000);
    return () => clearInterval(interval);
  }, [showCalendarEvents, selectedCalendars, calendarService]);

  const [rotationAngle, setRotationAngle] = useState(0);
  // פונקציה שמסובבת את המצלמה ב-90 מעלות
  const rotateCamera = () => {
    setRotationAngle((prevAngle) => (prevAngle + 90) % 360);
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showSeconds, setShowSeconds] = useState(() => JSON.parse(localStorage.getItem('showSeconds')) ?? true);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) ?? false);
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'he');
  const [currentTask, setCurrentTask] = useState(() => localStorage.getItem('currentTask') || '');
  const [currentTaskObj, setCurrentTaskObj] = useState(() => JSON.parse(localStorage.getItem('currentTaskObj')) ?? true);

  const [timerType, setTimerType] = useState(() => localStorage.getItem('timerType') || 'duration');
  const [timerDuration, setTimerDuration] = useState(() => JSON.parse(localStorage.getItem('timerDuration')) || 60);
  const [timerEndTime, setTimerEndTime] = useState(() => localStorage.getItem('timerEndTime') || '');
  const [todoistApiToken, setTodoistApiToken] = useState(() => localStorage.getItem('todoistApiToken') || '');
  const [refreshTodoistTasks, setRefreshTodoistTasks] = useState(false);

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [timerTime, setTimerTime] = useState(0);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const [showStopwatch, setShowStopwatch] = useState(() => JSON.parse(localStorage.getItem('showStopwatch')) ?? false);
  const [showTimer, setShowTimer] = useState(() => JSON.parse(localStorage.getItem('showTimer')) ?? false);

  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  const [workspaceId, setWorkspaceId] = useState(() => localStorage.getItem('workspaceId') || '');
  const [togglApiToken, setTogglApiToken] = useState(() => localStorage.getItem('togglApiToken') || '');
  const [taskDescription, setTaskDescription] = useState(() => localStorage.getItem('currentTask') || '');


  const handleSaveTogglSettings = () => {
    localStorage.setItem('togglApiToken', togglApiToken);
    localStorage.setItem('workspaceId', workspaceId);
  };


  // שמירת ההגדרות ב-localStorage כאשר הן משתנות
  useEffect(() => {
    localStorage.setItem('showSeconds', JSON.stringify(showSeconds));
  }, [showSeconds]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currentTask', currentTask);
    setTaskDescription(currentTask);
  }, [currentTask]);

  useEffect(() => {
    localStorage.setItem('timerType', timerType);

    if (timerType !== 'duration' && timerEndTime) {
      // המרת הזמנים לשניות עם דיוק מקסימלי
      const timeToExactSeconds = (timeStr) => {
        const now = new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);

        // יצירת תאריך להיום עם השעה הרצויה
        const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // אם השעה כבר עברה היום, נוסיף יום
        if (targetDate < now) {
          targetDate.setDate(targetDate.getDate() + 1);
        }

        // חישוב ההפרש במילישניות והמרה לשניות
        const diffMilliseconds = targetDate.getTime() - now.getTime();
        return Math.floor(diffMilliseconds / 1000);
      };

      try {
        // חישוב ההפרש בשניות
        const diffSeconds = timeToExactSeconds(timerEndTime);

        console.log('Target time:', timerEndTime);
        console.log('Current time:', new Date().toLocaleTimeString('he-IL'));
        console.log('Difference in seconds:', diffSeconds);

        if (diffSeconds > 0) {
          setTimerTime(diffSeconds);
        } else {
          // במקרה של זמן שלילי או 0
          setTimerTime(0);
          toast.error('זמן היעד כבר עבר');
        }
      } catch (error) {
        console.error('Error calculating time difference:', error);
        toast.error('שגיאה בחישוב הזמן');
      }
    }
  }, [timerType, timerEndTime]);


  useEffect(() => {
    console.log('Timer duration changed:', timerDuration);
    if (timerDuration != NaN && timerDuration > 0)
    localStorage.setItem('timerDuration', JSON.stringify(timerDuration));
  }, [timerDuration]);

  useEffect(() => {
    console.log('timerEndTime:', timerEndTime);
    localStorage.setItem('timerEndTime', timerEndTime);
  }, [timerEndTime]);

  useEffect(() => {
    localStorage.setItem('todoistApiToken', todoistApiToken);
  }, [todoistApiToken]);

  useEffect(() => {
    localStorage.setItem('showStopwatch', JSON.stringify(showStopwatch));
  }, [showStopwatch]);

  useEffect(() => {
    localStorage.setItem('showTimer', JSON.stringify(showTimer));
  }, [showTimer]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(showSeconds ? now.toLocaleTimeString('he-IL') : now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('he-IL', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [showSeconds]);


  // Stopwatch logic
  useEffect(() => {
    let interval;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!stopwatchRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  useEffect(() => {
    handleRefreshTodoistTasks();
  }, [showSettings]);

  const startStopwatch = () => setStopwatchRunning(true);
  const pauseStopwatch = () => {
    setStopwatchRunning(false);
    TogglIntegration.stopTimer();
  }
  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timerTime === 0) {
      setTimerRunning(false);
      // Here you could add some notification logic when the timer ends
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerTime]);

  const startTimer = () => {
    if (timerType === 'duration') {
      setTimerTime(timerDuration * 60); // Convert minutes to seconds
    } else {
      const endTime = new Date(`${new Date().toDateString()} ${timerEndTime}`);
      const now = new Date();
      setTimerTime(Math.floor((endTime - now) / 1000));
    }
    setTimerRunning(true);
  };

  const pauseTimer = () => setTimerRunning(false);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerTime(0);
  };

  const handleTodoistSettingsSave = (token) => {
    setTodoistApiToken(token);
    localStorage.setItem('todoistApiToken', token);
  };

  const handleRefreshTodoistTasks = () => {
    setRefreshTodoistTasks(prev => !prev);
  };

  const handleTaskSelect = (task) => {
    console.log(task);
    setCurrentTask(task.title);
    setTaskDescription(task.title);
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setCurrentTaskObj(task);
  };


  // from clude for todoist
  const formatTime = useCallback((time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // from openAI to events
  function formatEventTime(event) {
    const now = new Date();
    const eventTime = new Date(event.start.dateTime || event.start.date);
    const diffMs = eventTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // בדיקה אם האירוע בעוד פחות מ-12 שעות
    if (diffHours < 12 && diffMs > 0) {
      return `נותרו עוד ${diffHours} שעות ו-${diffMinutes} דקות`;
    } else {
      // הצגת תאריך בלבד עבור אירועים רחוקים מ-12 שעות
      return eventTime.toLocaleString('he-IL');
    }
  }

  const openTaskInTodoist = (taskId) => {
    window.open(`todoist://task?id=${taskId}`, '_blank');
  };

  return (<>
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              // הגדרות ברירת מחדל לכל ההודעות
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
              duration: 3000,
            }}
        />
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} ${language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Left side */}
        <div className="w-1/2 flex items-center justify-center bg-gray-800" style={{overflow: 'hidden'}}>
          <div className="w-full h-full">
            <Camera rotationAngle={rotationAngle} /> {/* העברת זווית הסיבוב ל-Camera */}
          </div>
        </div>

        {/* Right side - Camera */}
        <div className="w-1/2 p-8 flex flex-col justify-between relative">
          <div className="flex">
            <button
                onClick={() => setShowSettings(true)}
                className=""
            >
              <SettingsIcon size={24} className="inline-block ml-2" />
            </button>
            <button onClick={rotateCamera} className="">
              <RotateCw size={24} />
            </button>
          </div>

          <div>
            <div className="mb-12">
              <TogglIntegration togglApiToken={togglApiToken} workspaceId={workspaceId} taskDescription={currentTask} setTaskDescription={setTaskDescription} setStopwatchTime={setStopwatchTime} stopwatchTime={stopwatchTime} startStopwatch={startStopwatch} pauseStopwatch={pauseStopwatch} />
              <h1 className="text-3xl font-bold text-center" onClick={() => {if (currentTask) openTaskInTodoist(currentTaskObj.id)}} >{currentTask || 'אז על מה אתה עכשיו?'}</h1>
              <div className="flex justify-center mt-1 text-gray-500 text-sm">
                {/* שורה נוספת למידע נוסף בפונט קטן */}
                {/*<span className={` ${currentTaskObj.priorityColor}`}>*/}
                {/*  {currentTask && (*/}
                {/*      <Flag size={16} className="inline" />*/}
                {/*  )}*/}
                {/*</span>*/}
                {currentTaskObj.subtasks && currentTaskObj.subtasks.length > 0 && (
                    <span className="text-gray-500 mr-2">
                תתי-משימות: {currentTaskObj.subtasks.length}
              </span>
                )}
                {currentTaskObj.isOverdue && currentTaskObj.overdueDays > 0 && (
                    <span className="mr-2 text-red-500">
                באיחור של {currentTaskObj.overdueDays} {currentTaskObj.overdueDays === 1 ? 'יום' : 'ימים'}
              </span>
                )}
                {currentTaskObj.isOverdue && currentTaskObj.overdueDays === 0 && currentTaskObj.overdueHours > 0 && (
                    <span className="mr-2 text-red-500">
                באיחור של {currentTaskObj.overdueHours} {currentTaskObj.overdueHours === 1 ? 'שעה' : 'שעות'}
              </span>
                )}
                {currentTaskObj.createdAt && (
                    <span className="text-gray-500 mr-2">
                נוצרה {currentTaskObj.createdTimeAgo}
              </span>
                )}
                {!currentTaskObj.isOverdue && currentTaskObj.dueDate && (
                    <span className="mr-2 text-blue-500">
                דדליין: {currentTaskObj.timeUntilDue}
              </span>
                )}


              </div>
            </div>

            <div className="text-8xl font-bold mb-2 text-center">{time}</div>
            <div className="text-s, mb-12 text-center text-gray">{date}</div>
            {showCalendarEvents && nextEvent && (
                <div className="text-center mb-12 mt-12">
                  <div className="text-lg font-semibold flex items-center justify-center">
                    <Calendar className="mr-2 ml-2 text-gray-500" size={24} /> {/* אייקון לוח שנה */}
                    האירוע הקרוב {getRelativeTime(nextEvent.start.dateTime)}
                  </div>
                  <div className="text-xl">{nextEvent.summary}</div>
                  <div className="text-sm text-gray-500">
                    {formatEventTime(nextEvent)}
                  </div>
                </div>
            )}

            {showTimer && (
                <div className="mb-4 mt-12">
                  <div className="bg-gray-300 rounded-full mb-2 " style={{maxWidth: '500px', margin: 'auto' }}>

                    <div
                        className="bg-blue-600 rounded-full text-center"
                        style={{width: `${(timerTime / (timerDuration * 60)) * 100}%`, transition: 'width 1s linear'}}
                    >
                      {((timerTime / (timerDuration * 60)) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-xl mb-2 text-center text-gray-500 items-center justify-center flex">
                    {timerRunning ? (
                        <button
                            onClick={pauseTimer}
                            className=""
                        >
                          <Pause size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={startTimer}
                            className=""
                        >
                          <Play size={20} />
                        </button>
                    )}
                    <span className="text-xl text-center text-gray-500 ml-4 mr-4">זמן שנותר: {formatTime(timerTime)}</span>
                  </div>
                </div>
            )}
          </div>
          <div className="mt-4" style={{ overflow: "scroll" }}>
            <TodayEvents calendarService={calendarService} selectedCalendars={selectedCalendars} setSelectedCalendars={setSelectedCalendars} allCalendars={allCalendars} />

            {/* Todoist Tasks */}
            <TodoistTasks
                apiToken={todoistApiToken}
                refresh={refreshTodoistTasks}
                onTaskSelect={handleTaskSelect}
                language={language}
            />
          </div>

          <footer className="mt-4 text-sm text-center w-full text-gray-500" style={{position: 'absolute', bottom: '0'}}>
            {packageJson.version} | Made from the Israeli Desert by <a className="" href="https://amit-trabelsi.co.il" target="_blank">Amit Trabelsi</a>
          </footer>
        </div>
        {/* Settings overlay */}
        {showSettings && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Settings
                  showSeconds={showSeconds}
                  setShowSeconds={setShowSeconds}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  language={language}
                  setLanguage={setLanguage}
                  currentTask={currentTask}
                  setCurrentTask={setCurrentTask}
                  timerType={timerType}
                  setTimerType={setTimerType}
                  timerDuration={timerDuration}
                  setTimerDuration={setTimerDuration}
                  timerEndTime={timerEndTime}
                  setTimerEndTime={setTimerEndTime}
                  todoistApiToken={todoistApiToken}
                  setTodoistApiToken={setTodoistApiToken}
                  onClose={() => setShowSettings(false)}
                  onSaveTodoistSettings={handleTodoistSettingsSave}
                  setShowStopwatch={setShowStopwatch}
                  showStopwatch={showStopwatch}
                  setShowTimer={setShowTimer}
                  showTimer={showTimer}
                  googleClientId={googleClientId}
                  setGoogleClientId={setGoogleClientId}
                  googleApiKey={googleApiKey}
                  setGoogleApiKey={setGoogleApiKey}
                  isGoogleConnected={isGoogleConnected}
                  onGoogleConnect={handleGoogleConnect}
                  onGoogleDisconnect={handleGoogleDisconnect}
                  showCalendarEvents={showCalendarEvents}
                  setShowCalendarEvents={setShowCalendarEvents}
                  calendarService={calendarService}
                  selectedCalendars={selectedCalendars}
                  setSelectedCalendars={setSelectedCalendars}
                  showAllDayEvents={showAllDayEvents}
                  setShowAllDayEvents={setShowAllDayEvents}
                  onSaveTogglSettings={handleSaveTogglSettings}
                  togglApiToken={togglApiToken}
                  setTogglApiToken={setTogglApiToken}
                  workspaceId={workspaceId}
                  setWorkspaceId={setWorkspaceId}

              />
            </div>
        )}

      </div>
    </>
  );
};

export default App;