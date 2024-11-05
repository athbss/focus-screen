import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { CirclePower, ChevronDown, ChevronUp, Play, Pause, Settings, History } from 'lucide-react';
import toast from 'react-hot-toast';
import {getRelativeTime} from "../helper/functions";

const TogglIntegration = ({
                              togglApiToken,
                              workspaceId,
                              taskDescription,
                              setTaskDescription,
                              stopwatchTime,
                              setStopwatchTime,
                              startStopwatch,
                              pauseStopwatch
                          }) => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedProject, setSelectedProject] = useState(() => {
        const savedProject = localStorage.getItem('selectedTogglProject');
        return savedProject ? JSON.parse(savedProject) : null;
    });
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [activeTimeEntryId, setActiveTimeEntryId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // ... הסטייטים הקיימים ...
    const [recentEntries, setRecentEntries] = useState([]);
    const [showRecentEntries, setShowRecentEntries] = useState(false);

    const fetchRecentEntries = async () => {
        try {
            const response = await fetch(
                `https://api.track.toggl.com/api/v9/me/time_entries`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${btoa(`${togglApiToken}:api_token`)}`,
                        'Content-Type': 'application/json'
                    }
                });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${await response.text()}`);
            }

            const data = await response.json();

            // יצירת מפתח ייחודי לכל שילוב של פרויקט ותיאור
            const uniqueEntries = data.reduce((acc, entry) => {
                if (!entry.pid) return acc;

                const uniqueKey = `${entry.pid}-${entry.description}`;

                if (!acc[uniqueKey]) {
                    acc[uniqueKey] = {
                        ...entry,
                        count: 1,  // מונה כמה פעמים הופיע
                        lastUsed: new Date(entry.at || entry.start).getTime()  // זמן אחרון שהיה בשימוש
                    };
                } else {
                    acc[uniqueKey].count += 1;
                    // עדכון הזמן האחרון רק אם הרשומה הנוכחית חדשה יותר
                    const currentEntryTime = new Date(entry.at || entry.start).getTime();
                    if (currentEntryTime > acc[uniqueKey].lastUsed) {
                        acc[uniqueKey].lastUsed = currentEntryTime;
                    }
                }

                return acc;
            }, {});

            // המרה חזרה למערך וסידור לפי זמן אחרון
            const sortedUniqueEntries = Object.values(uniqueEntries)
                .sort((a, b) => b.lastUsed - a.lastUsed)
                .slice(0, 10);

            // הוספת מידע על הפרויקט לכל רשומה
            const enrichedEntries = await Promise.all(sortedUniqueEntries.map(async entry => {
                const project = projects.find(p => p.id === entry.pid);
                return {
                    ...entry,
                    projectName: project ? project.name : 'Unknown Project',
                    projectColor: project ? project.color : '#000000',
                    usageCount: entry.count  // מוסיף את מספר הפעמים שהשילוב הזה הופיע
                };
            }));

            setRecentEntries(enrichedEntries);
        } catch (error) {
            console.error('Failed to fetch recent entries:', error);
            toast.error('לא הצלחנו לטעון את הרשומות האחרונות', {
                icon: '❌'
            });
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(`https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/projects`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${togglApiToken}:api_token`),
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setProjects(data.filter(project => project.active));
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(`https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/clients`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${togglApiToken}:api_token`),
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchClients();
        checkForActiveTimer();
        fetchRecentEntries();
    }, []);

    useEffect(() => {
        const taskDescription = localStorage.getItem('currentTask');
        if (taskDescription) {
            setTaskDescription(taskDescription);
        }
    }, [taskDescription]);

    const projectsWithClients = projects.map((project) => {
        const client = clients.find((client) => client.id === project.cid);
        return {
            ...project,
            clientName: client ? client.name : 'No client'
        };
    });

    const projectOptions = projectsWithClients.map((project) => ({
        value: project.id,
        label: `${project.name} - ${project.clientName}`,
        color: project.color || '#000000'
    }));

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: state.data.color,
            fontWeight: state.isSelected ? 'bold' : 'normal'
        }),
        singleValue: (provided, state) => ({
            ...provided,
            color: state.data.color
        })
    };

    // פונקציה להמשך רשומה קיימת
    const continueEntry = async (entry) => {
        console.log('Continuing entry:', entry);
        const project = projects.find(p => p.id === entry.pid);
        if (!project) {
            toast.error('לא נמצא הפרויקט המקורי', { icon: '⚠️' });
            return;
        }

        // stopTimer();

        setTaskDescription(entry.description);
        setSelectedProject(project);

        // התחלת מעקב זמן חדש
        startTimer();
        setShowRecentEntries(false);

        toast.success('ממשיך מעקב זמן קודם', { icon: '▶️' });
    };

    // הוספת רינדור של הרשומות האחרונות
    const renderRecentEntries = () => {

        return (<>
                <div className=" mt-2 w-full rounded-lg  z-50">
                    <h3 className="text-lg font-bold mb-4">מעקבי זמן אחרונים</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentEntries.map((entry) => (
                            <div
                                key={`${entry.pid}-${entry.description}`}
                                onClick={() => continueEntry(entry)}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full ml-2"
                                        style={{ backgroundColor: entry.projectColor }}
                                    />
                                    <div>
                                        <div className="font-medium">{entry.description || 'ללא תיאור'}</div>
                                        <div className="text-sm text-gray-500">{entry.projectName} | {getRelativeTime(entry.start)}</div>
                                    </div>
                                </div>
                                {entry.usageCount > 1 && (
                                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {entry.usageCount} פעמים
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const checkForActiveTimer = async () => {
        try {
            const response = await fetch(`https://api.track.toggl.com/api/v9/me/time_entries/current`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${btoa(`${togglApiToken}:api_token`)}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${errorText}`);
            }

            const data = await response.json();
            if (data) {
                console.log('Active timer:', data);
                setIsTimerRunning(true);
                setActiveTimeEntryId(data.id);
                setSelectedProject(projects.find((project) => project.id === data.pid));
                setStopwatchTime(getSecondsFromDate(data.start));
                startStopwatch();
            } else {
                setIsTimerRunning(false);
                setActiveTimeEntryId(null);
                pauseStopwatch();
            }
        } catch (error) {
            console.error('Failed to check for active timer:', error);
        }
    };

    const startTimer = async () => {
        if (!selectedProject || !taskDescription) {
            toast.error(
                !selectedProject ? 'נא לבחור פרויקט' : 'נא להזין תיאור למשימה',
                {
                    icon: '⚠️',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        try {
            const response = await fetch(`https://api.track.toggl.com/api/v9/workspaces/${parseInt(workspaceId)}/time_entries`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${togglApiToken}:api_token`)}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: taskDescription,
                    pid: selectedProject.id,
                    created_with: 'adhd_focus_app',
                    start: new Date().toISOString().replace('Z', '+00:00'),
                    duration: -1,
                    workspace_id: parseInt(workspaceId)
                })
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${await response.text()}`);
            }

            const data = await response.json();
            console.log('Timer started:', data);

            toast.success('מעקב הזמן החל!', {
                icon: '⏱️',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                duration: 3000,
            });
            setActiveTimeEntryId(data.id);
            setIsTimerRunning(true);
            setIsFormOpen(false);
            setStopwatchTime(getSecondsFromDate(data.start));
            startStopwatch();
        } catch (error) {
            console.error('Failed to start timer:', error);
            toast.error('לא הצלחנו להפעיל את מעקב הזמן', {
                icon: '❌',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        }
    };

    const stopTimer = async () => {
        try {
            const response = await fetch(`https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/time_entries/${activeTimeEntryId}/stop`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Basic ${btoa(`${togglApiToken}:api_token`)}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${await response.text()}`);
            }

            const data = await response.json();
            console.log('Timer stopped:', data);

            toast.success('מעקב הזמן הסתיים!', {
                icon: '⏹️',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                duration: 3000,
            });

            setIsTimerRunning(false);
            setActiveTimeEntryId(null);
            setStopwatchTime(0);
            pauseStopwatch();
            setIsFormOpen(false);
        } catch (error) {
            console.error('Failed to stop timer:', error);
            toast.error('לא הצלחנו לעצור את מעקב הזמן', {
                icon: '❌',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        }
    };

    const getSecondsFromDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const secondsDiff = Math.floor((now - date) / 1000);
        return secondsDiff;
    }

    const toggleForm = () => {
        setIsFormOpen(!isFormOpen);
    };

    // עדכון הפונקציה שמטפלת בבחירת פרויקט
    const handleProjectSelection = (option) => {
        const newProject = {
            id: option.value,
            name: option.label,
            color: option.color
        };
        localStorage.setItem('selectedTogglProject', JSON.stringify(newProject));
        setSelectedProject(newProject);

    };

    // הצגת מידע על הפרויקט שנבחר
    const renderProjectInfo = () => {
        if (!selectedProject) return null;

        return (
            <div className="flex items-center mt-2 text-sm opacity-50">
                <div
                    className="w-3 h-3 rounded-full mr-2 ml-2"
                    style={{ backgroundColor: selectedProject.color }}
                ></div>
                <span className="text-gray-600 ">
                    {selectedProject.name}
                    {/*{taskDescription && ` - ${taskDescription}`}*/}
                </span>
            </div>
        );
    };

    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative ">
            <div className="flex items-center justify-between w-full bg-gray-100 p-3 rounded-lg"  onClick={() => setIsFormOpen(!isFormOpen)}>
                <div className="flex-col items-center">
                    <span className="text-gray-500">
                         {renderProjectInfo()}
                        <span className="flex justify-center items-center justify-center ">
                         <CirclePower color="#E57CD8" size={18} className="ml-2" />
                         זמן שעבר:
                        {formatTime(stopwatchTime)}
                        </span>

                    </span>
                </div>
                <div className="flex space-x-2">
                    {!isTimerRunning ? (
                        <button
                            onClick={startTimer}
                            className="border-2 rounded-full p-1 flex items-center justify-center"
                            style={{ color: "#fff", backgroundColor: "#2C1338" }}
                            title="הפעל מעקב זמן"
                        >

                            <Play size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={stopTimer}
                            className="border-2 rounded-full p-1 flex items-center justify-center"
                            style={{ color: "#fff", backgroundColor: "#2C1338" }}
                            title="הפסק מעקב זמן"
                        >
                            {/*<CirclePower color="#E57CD8" size={20} />*/}
                            <Pause size={20} />
                        </button>
                    )}
                    {/*<button*/}

                    {/*    className="rounded-full p-1 flex items-center justify-center"*/}
                    {/*    // style={{ color: "#fff", backgroundColor: "#2C1338" }}*/}
                    {/*    title="הגדרות מעקב זמן"*/}
                    {/*>*/}
                    {/*    <Settings size={20} color="#E57CD8" />*/}
                    {/*</button>*/}
                </div>
            </div>
            {isFormOpen && (<>
                <div className="p-4 bg-white rounded-lg shadow-lg absolute w-full">
                    <input
                        type="text"
                        placeholder="תיאור המשימה"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="w-full border p-2 rounded mb-4"
                    />
                        <Select
                            options={projectOptions}
                            value={selectedProject ? {
                                value: selectedProject.id,
                                label: selectedProject.name,
                                color: selectedProject.color
                            } : null}
                            onChange={handleProjectSelection}
                            placeholder="הקלד לחיפוש פרויקט"
                            styles={customStyles}
                            className="mb-4"
                        />
                    {renderRecentEntries()}
                </div>
                    {/* ... כפתורי הפעלה/עצירה ... */}

                </>
            )}

            {/*{isTimerRunning && selectedProject && !isFormOpen && (*/}
            {/*    <div className="mt-2 text-sm text-gray-600">*/}
            {/*        {selectedProject.name}*/}
            {/*        {taskDescription && ` - ${taskDescription}`}*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

export default TogglIntegration;