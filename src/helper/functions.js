import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { he } from 'date-fns/locale';

export const getRelativeTime = (dateInput) => {
    let date;

    // בדיקה אם ה-input הוא תאריך תקין
    if (typeof dateInput === 'string' || dateInput instanceof String) {
        date = parseISO(dateInput);
    } else {
        date = new Date(dateInput);
    }

    // בדיקה אם התאריך תקין
    if (!isValid(date)) {
        return 'תאריך לא תקין';
    }

    // חישוב הזמן היחסי
    return formatDistanceToNow(date, { addSuffix: true, locale: he });
};



export const isFuture = (dateInput) => {
    let date;

    // בדיקה אם ה-input הוא תאריך תקין
    if (typeof dateInput === 'string' || dateInput instanceof String) {
        date = parseISO(dateInput);
    } else {
        date = new Date(dateInput);
    }

    // בדיקה אם התאריך תקין
    if (!isValid(date)) {
        return 'תאריך לא תקין';
    }

    // השוואה בין התאריך הנוכחי לתאריך הניתן
    const now = new Date();
    return date > now ? true : false;
};