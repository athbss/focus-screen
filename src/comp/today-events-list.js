import React, {useState, useEffect, useCallback} from 'react';
import {Calendar, ChevronDown, ChevronUp, Map} from 'lucide-react';
import { format, isToday, parseISO, compareAsc } from 'date-fns';
import { he } from 'date-fns/locale';
import  { getRelativeTime, isFuture } from '../helper/functions';
import CalendarSelector from './calendar-selector';
import GoogleCalendarService from "./google-calendar-service";

// import { formatDistanceToNow, parseISO, differenceInDays, differenceInHours, format, startOfDay } from 'date-fns';

const TodayEvents = ({ calendarService, selectedCalendars, setSelectedCalendars, allCalendars}) => {
    const [events, setEvents] = useState([]);
    const [futureEvents, setfutureEvents] = useState([]);
    const [alldayEvents, setAlldayEvents] = useState([]);

    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);

    const handleCalendarToggle = () => {
        setShowCalendarModal(!showCalendarModal);
    };

    useEffect(() => {
        if (calendarService && selectedCalendars.length > 0) {
            fetchTodayEvents();
        }
    }, [calendarService, selectedCalendars]);

    useEffect(() => {
        if (isOpen) {
            fetchTodayEvents();
        }
        console.log('isOpen', allCalendars);
    }, [isOpen]);

    function formatTime(event) {
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
    const fetchTodayEvents = async () => {
        try {
            const todayEvents = [];
            const allDayEvents = [];
            const todayPastEvent = [];
            console.log(selectedCalendars);
            for (const calendarId of selectedCalendars) {
                const startDay = new Date();
                startDay.setHours(0, 0, 0, 0); // הגדרת סוף היום הנוכחי

                const eventsList = await calendarService.listEvents({
                    calendarId,
                    timeMin: startDay.toISOString(),
                    timeMax: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime'
                });

                todayEvents.push(...eventsList.filter(event => isToday(parseISO(event.start.dateTime || event.start.date)) && // מסנן אירועי יום שלם אם showAllDayEvents אינו מסומן
                    event.eventType !== 'workingLocation'));
                allDayEvents.push(...eventsList.filter(event => isToday(parseISO(event.start.dateTime || event.start.date))));
                todayPastEvent.push(...eventsList.filter(event => isFuture(parseISO(event.start.dateTime || event.start.date))));
            }

            todayEvents.sort((a, b) => compareAsc(
                parseISO(a.start.dateTime || a.start.date),
                parseISO(b.start.dateTime || b.start.date)
            ));
            setEvents(todayEvents);

            allDayEvents.sort((a, b) => compareAsc(
                parseISO(a.start.dateTime || a.start.date),
                parseISO(b.start.dateTime || b.start.date)
            ));
            setAlldayEvents(allDayEvents);

            todayPastEvent.sort((a, b) => compareAsc(
                parseISO(a.start.dateTime || a.start.date),
                parseISO(b.start.dateTime || b.start.date)
            ));
            setfutureEvents(todayPastEvent);
            console.log(todayEvents);
            setError(null);
        } catch (err) {
            setError('Failed to fetch events.');
            console.error(err);
        }
    };

    const findCalendarById = async (calendarID) => {
        const calendars = await calendarService.getCalendarList()
        return calendars.find(calendar => calendar.id === calendarID) || null;
    };

    return (
        <div className="bg-white shadow-md rounded px-4 pt-4 pb-4 mb-4">
            <div
                className="flex justify-center items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar className="mr-2 text-gray-500 ml-2" size={24} /> <h2 className="text-2xl font-bold">
                נותרו {futureEvents.length} אירועים  מתוך {events.length} אירועים להיום
            </h2>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>

            {isOpen && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-center mb-4">{format(new Date(), 'dd/MM/yyyy', { locale: he })}</h3>
                        <button onClick={() => handleCalendarToggle()}  className="bg-blue-500 text-white p-2 rounded text-sm">בחר יומנים להצגה</button>

                    </div>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : events.length === 0 ? (
                        <>
                        <p>אין אירועים להיום!</p>
                        </>
                    ) : (
                        <>
                            <ul>
                                {events.map(event => (

                                    <li key={event.id}
                                        className={`mb-2 p-2 rounded flex justify-between items-center hover:bg-gray-200 ${ !isFuture(event.start.dateTime) ? 'opacity-50 ' : 'opacity-100 bg-gray-100' }`}
                                        // style={{ backgroundColor: findCalendarById(event.calendarId).backgroundColor }}
                                    >
                                        <div className="flex-grow">
                                            <span className="font-bold">{event.summary}</span>
                                            <span className="text-xs"> {getRelativeTime(event.start.dateTime)} </span>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {event.location ? (
                                                    <>
                                                        <span>{event.location} - </span>
                                                    </>
                                                ) : null}
                                                {event.start.dateTime ? (
                                                    format(parseISO(event.start.dateTime), 'HH:mm', { locale: he })  + ' - ' + format(parseISO(event.end.dateTime), 'HH:mm', { locale: he })
                                                ) : (
''
                                                )}
                                            </div>
                                        </div>

                                        {event.htmlLink && (
                                            <a
                                                href={event.htmlLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                                            >
                                                לפרטים
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {showCalendarModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                                <CalendarSelector
                                    calendarService={calendarService}
                                    selectedCalendars={selectedCalendars}
                                    onCalendarSelectionChange={(calendars) => {
                                        setSelectedCalendars(calendars);
                                    }}
                                    CloseModal={() =>  handleCalendarToggle()}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TodayEvents;