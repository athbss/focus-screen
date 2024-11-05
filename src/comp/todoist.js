import React, { useState, useEffect } from 'react';
import { TodoistApi } from '@doist/todoist-api-typescript';
import {ChevronDown, ChevronUp, Check, ListTodo, Calendar} from 'lucide-react';
import { formatDistanceToNow, parseISO, differenceInDays, differenceInHours, format, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { Flag } from 'lucide-react'; // או כל אייקון אחר שמתאים לך
import getRelativeTime from '../helper/functions';

const TodoistTasks = ({ apiToken, refresh, onTaskSelect, language }) => {
    const [tasks, setTasks] = useState([]);
    const [alltasks, setallTasks] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);

    function parseTextWithLinks(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"></a>;
            }
            return part;
        });
    }
    function parseTextWithoutLinks(text) {
        const regex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
        return text.replace(regex, '$1');
    }
    useEffect(() => {
        if (apiToken) {
            fetchTasks();
        }
    }, [apiToken, refresh]);

    useEffect(() => {
        if (apiToken) {
            fetchTasks();
        }
    }, [isOpen]);

    const fetchTasks = async () => {
        try {
            const api = new TodoistApi(apiToken);
            const fetchedTasks = await api.getTasks({ filter: '(overdue | today) & (!assigned to: others)' });
            const allfetchedTasks = await api.getTasks();

            setallTasks(allfetchedTasks);
            setTasks(fetchedTasks);

            setError(null);
            // debugger;

        } catch (err) {
            setError('Failed to fetch tasks. Please check your API token.');
            console.error(err);
        }
    };

    const getSubtasksObj = (task) => {
        const subtasks = alltasks.filter((t) => t.parentId === task.id);
        return subtasks;
    };

    const openTaskInTodoist = (taskId) => {
        window.open(`todoist://task?id=${taskId}`, '_blank');
    };

    const isRTL = language === 'he' || language === 'ar';
    // הצגת הממשק רק אם apiToken מוגדר
    if (!apiToken) {
        return null; // או להחזיר הודעה ריקה, או הודעת שגיאה אם רוצים להציג משהו.
    }

    return (
        <div className={`bg-white shadow-md rounded px-4 pt-4 pb-4 mb-4 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div
                className="flex justify-center items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ListTodo className="mr-2 text-gray-500 ml-2" size={24} /><h2 className="text-2xl font-bold">{tasks.length}  משימות פתוחות </h2>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>

            {isOpen && (
                <div className="mt-4" >
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : tasks.length === 0 ? (
                        <p>אין משימות להיום!</p>
                    ) : (
                        <ul>
                            {tasks.map((task) => {
                                const dueDate = task.due && task.due.datetime ? parseISO(task.due.datetime) :
                                    task.due && task.due.date ? startOfDay(parseISO(task.due.date)) : null;
                                const isOverdue = dueDate && new Date() > dueDate;
                                const overdueDays = isOverdue ? differenceInDays(new Date(), dueDate) : 0;
                                const overdueHours = isOverdue && overdueDays === 0 ? differenceInHours(new Date(), dueDate) : 0;

                                // חישוב הזמן מאז שנוצרה המשימה
                                const createdAt = task.createdAt ? parseISO(task.createdAt) : null;
                                const createdTimeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true, locale: he }) : '';

                                // חישוב הזמן שנותר עד הדדליין
                                const timeUntilDue = dueDate ? formatDistanceToNow(dueDate, { addSuffix: true, locale: he }) : '';

                                // בחירת צבע ותיאור לפי רמת התיעדוף
                                const priorityColor = task.priority === 4 ? 'text-red-500' :
                                    task.priority === 3 ? 'text-orange-500' :
                                        task.priority === 2 ? 'text-yellow-500' :
                                            'text-green-500';

                                const taskObject = {
                                    ...task,
                                    title: parseTextWithoutLinks(task.content),
                                    dueDate: dueDate,
                                    isOverdue: isOverdue,
                                    overdueDays: overdueDays,
                                    overdueHours: overdueHours,
                                    createdTimeAgo: createdTimeAgo,
                                    timeUntilDue: timeUntilDue,
                                    priorityColor: priorityColor,
                                    subtasks: getSubtasksObj(task),
                                }

                                return (
                                    <li
                                        key={task.id}
                                        className="mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between items-center"
                                    >
                                        <div className="flex-grow">
          <span onClick={() => onTaskSelect(taskObject)} className="font-bold">
            {parseTextWithoutLinks(task.content)} {getSubtasksObj(task).length > 0 && "(" + getSubtasksObj(task).length + ")"}
          </span>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {/* שורה נוספת למידע נוסף בפונט קטן */}
                                                <span className={` ${priorityColor}`}>
              <Flag size={16} className="inline" /> {/* אייקון תיעדוף */}
            </span>
                                                {getSubtasksObj(task) && getSubtasksObj(task).length > 0 && (
                                                    <span className="text-gray-500 mr-2">
                תתי-משימות: {getSubtasksObj(task).length}
              </span>
                                                )}
                                                {isOverdue && overdueDays > 0 && (
                                                    <span className="mr-2 text-red-500">
                באיחור של {overdueDays} {overdueDays === 1 ? 'יום' : 'ימים'}
              </span>
                                                )}
                                                {isOverdue && overdueDays === 0 && overdueHours > 0 && (
                                                    <span className="mr-2 text-red-500">
                באיחור של {overdueHours} {overdueHours === 1 ? 'שעה' : 'שעות'}
              </span>
                                                )}
                                                {createdAt && (
                                                    <span className="text-gray-500 mr-2">
                נוצרה {createdTimeAgo}
              </span>
                                                )}
                                                {!isOverdue && dueDate && (
                                                    <span className="mr-2 text-blue-500">
                דדליין: {timeUntilDue}
              </span>
                                                )}


                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openTaskInTodoist(task.id)}
                                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}
                                        >
                                            למשימה
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default TodoistTasks;