import React, { useState, useEffect } from 'react';
import {CircleX} from 'lucide-react';

const CalendarSelector = ({ calendarService, selectedCalendars, onCalendarSelectionChange, CloseModal }) => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const calendarList = await calendarService.getCalendarList();
      setCalendars(calendarList);
      setError(null);
    } catch (err) {
      setError('Failed to fetch calendars');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>טוען יומנים...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-bold mb-4">יומנים זמינים</h3>
      <button onClick={() => CloseModal()} className={`p-2 rounded text-sm`}>
        <CircleX className="mr-2" size={24} />
      </button>
        </div>
      <div className="space-y-2">
        {calendars.map((calendar) => (
          <label key={calendar.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedCalendars.includes(calendar.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onCalendarSelectionChange([...selectedCalendars, calendar.id]);
                } else {
                  onCalendarSelectionChange(selectedCalendars.filter(id => id !== calendar.id));
                }
              }}
              className="ml-2"
            />
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2 ml-2"
                style={{ backgroundColor: calendar.backgroundColor }}
              />
              <span>{calendar.summary}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CalendarSelector;
