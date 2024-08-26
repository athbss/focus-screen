import React, { useState, useEffect, useCallback } from 'react';
import TodoistTasks from './comp/todoist';
import Camera from './comp/camera';
import Settings from './comp/settings';

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
  Flag
} from 'lucide-react';

const App = () => {

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
  }, [currentTask]);

  useEffect(() => {
    localStorage.setItem('timerType', timerType);
    if (timerType !== 'duration')
    {
      const endTime = new Date(`${new Date().toDateString()} ${timerEndTime}`);
      const now = new Date();
      setTimerDuration(Math.floor((endTime - now) / 1000) / 60);
    }
  }, [timerType]);

  useEffect(() => {
    localStorage.setItem('timerDuration', JSON.stringify(timerDuration));
  }, [timerDuration]);

  useEffect(() => {
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
  const pauseStopwatch = () => setStopwatchRunning(false);
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
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setCurrentTaskObj(task);
  };

  const formatTime = useCallback((time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const openTaskInTodoist = (taskId) => {
    window.open(`todoist://task?id=${taskId}`, '_blank');
  };

  return (
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
              {showStopwatch && (
                  <div className="text-center">
                    <div className="text-xl mb-2 text-center text-gray-500 items-center justify-center flex">
                      {stopwatchRunning ? (
                          <button
                              onClick={pauseStopwatch}
                              className=""
                          >
                            <Pause size={20} />
                          </button>
                      ) : (
                          <button
                              onClick={startStopwatch}
                              className=""
                          >
                            <Play size={20} />
                          </button>
                      )}
                      <span  className="ml-4 mr-4" >
                    זמן שעבר:
                        {formatTime(stopwatchTime)}
                    </span>
                      <button
                          onClick={resetStopwatch}
                          className=""
                      >
                        <RotateCw size={20} />
                      </button>
                    </div>
                  </div>
              )}
              <h1 className="text-3xl font-bold text-center"   onClick={() => openTaskInTodoist(currentTaskObj.id)} >{currentTask || 'אין משימה נוכחית'}</h1>
              <div className="flex justify-center mt-1 text-gray-500 text-sm">
                {/* שורה נוספת למידע נוסף בפונט קטן */}
                <span className={` ${currentTaskObj.priorityColor}`}>
              <Flag size={16} className="inline" /> {/* אייקון תיעדוף */}
            </span>
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
            {showTimer && (
                <div className="mb-4">
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

          {/* Todoist Tasks */}
          <div className="mt-4" style={{ overflow: "scroll" }}>
            <TodoistTasks
                apiToken={todoistApiToken}
                refresh={refreshTodoistTasks}
                onTaskSelect={handleTaskSelect}
                language={language}
            />
          </div>

          <footer className="mt-4 text-sm text-center w-full text-gray-500" style={{position: 'absolute', bottom: '0'}}>
            Made from the Israeli Desert by <a className="" href="https://amit-trabelsi.co.il" target="_blank">Amit Trabelsi</a>
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
              />
            </div>
        )}
      </div>
  );
};

export default App;