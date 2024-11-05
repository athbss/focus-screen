import  { getRelativeTime, isFuture } from '../helper/functions';

export class GoogleCalendarService {
  constructor(clientId, apiKey) {
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.tokenClient = null;
  }


  async init() {
    try {
      await this.loadGoogleApi();

      // Initialize the gapi.client
      await new Promise((resolve, reject) => {
        try {
          gapi.load('client', async () => {
            await gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });

            // Try to set the token if it exists in localStorage
            const savedToken = localStorage.getItem('googleAccessToken');
            if (savedToken) {
              gapi.client.setToken({ access_token: savedToken });
            }

            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });

      // Load the Google Identity Services
      await this.loadGIS();

      // Initialize token client
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events', // הוספנו scope נוסף
        callback: (response) => {
          if (response.access_token) {
            // Save the token to localStorage
            localStorage.setItem('googleAccessToken', response.access_token);
            // Set the token for immediate use
            gapi.client.setToken({ access_token: response.access_token });
          }
        },
      });

      // Check if we need to get a new token
      const currentToken = gapi.client.getToken();
      if (!currentToken) {
        // Try to use the saved token first
        const savedToken = localStorage.getItem('googleAccessToken');
        if (savedToken) {
          gapi.client.setToken({ access_token: savedToken });
          try {
            // Verify the token works
            await this.getCalendarList();
            return true;
          } catch (error) {
            // Token is invalid or expired
            localStorage.removeItem('googleAccessToken');
          }
        }

        // Request a new token
        return new Promise((resolve) => {
          this.tokenClient.requestAccessToken({
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
          });
          const checkToken = setInterval(() => {
            if (gapi.client.getToken()) {
              clearInterval(checkToken);
              resolve(true);
            }
          }, 100);
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
      localStorage.removeItem('googleAccessToken');
      return false;
    }
  }

  async handleTokenError() {
    localStorage.removeItem('googleAccessToken');
    return new Promise((resolve) => {
      this.tokenClient.requestAccessToken({
        prompt: 'consent',
        scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
      });
      const checkToken = setInterval(() => {
        if (gapi.client.getToken()) {
          clearInterval(checkToken);
          resolve(true);
        }
      }, 100);
    });
  }

  loadGoogleApi() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadGIS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async getCalendarList() {
    try {
      const response = await gapi.client.calendar.calendarList.list();
      return response.result.items;
    } catch (error) {
      if (error.status === 401) {
        // Token expired or invalid
        await this.handleTokenError();
        // Retry the request
        const response = await gapi.client.calendar.calendarList.list();
        return response.result.items;
      }
      console.error('Error fetching calendar list:', error);
      throw error;
    }
  }

  async getNextEvent(calendarIds, showAllDayEvents) {
    try {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); // הגדרת סוף היום

      const events = await Promise.all(calendarIds.map(async (calendarId) => {
        try {
          const response = await gapi.client.calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date().toISOString(),
            timeMax: endOfDay.toISOString(), // הגבלת האירועים לסוף היום
            maxResults: 1, // קבלת האירוע הקרוב ביותר להיום בלבד
            singleEvents: true,
            orderBy: 'startTime'
          });
          return response.result.items[0] ? { ...response.result.items[0], calendarId } : null;
        } catch (error) {
          if (error.status === 401) {
            await this.handleTokenError();
            const response = await gapi.client.calendar.events.list({
              calendarId: calendarId,
              timeMin: new Date().toISOString(),
              timeMax: endOfDay.toISOString(),
              maxResults: 1,
              singleEvents: true,
              orderBy: 'startTime'
            });
            return response.result.items[0] ? { ...response.result.items[0], calendarId } : null;
          }
          throw error;
        }
      }));
console.log(events);
      // סינון אירועים לפי ההגדרה של showAllDayEvents
      const validEvents = events.filter(event =>
          event !== null && (showAllDayEvents || event.start.dateTime) // מסנן אירועי יום שלם אם showAllDayEvents אינו מסומן
      );
      console.log(validEvents);
      // החזרת האירוע הקרוב ביותר, אם יש כזה
      return validEvents[0] || null;
    } catch (error) {
      console.error('Error fetching next event:', error);
      throw error;
    }
  }

  async getNextEventToday(calendarIds, showAllDayEvents) {
    try {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); // הגדרת סוף היום הנוכחי

      const events = await Promise.all(calendarIds.map(async (calendarId) => {
        try {
          const response = await gapi.client.calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date().toISOString(),
            timeMax: endOfDay.toISOString(), // הגבלת האירועים לסוף היום
            maxResults: 10, // הגבלת התוצאה למקסימום של 10 אירועים (תוכל לשנות את המספר בהתאם)
            singleEvents: true,
            orderBy: 'startTime'
          });
          return response.result.items ? response.result.items.map(event => ({ ...event, calendarId })) : [];
        } catch (error) {
          if (error.status === 401) {
            await this.handleTokenError();
            const response = await gapi.client.calendar.events.list({
              calendarId: calendarId,
              timeMin: new Date().toISOString(),
              timeMax: endOfDay.toISOString(),
              maxResults: 10,
              singleEvents: true,
              orderBy: 'startTime'
            });
            return response.result.items ? response.result.items.map(event => ({ ...event, calendarId })) : [];
          }
          throw error;
        }
      }));

      console.log(events);

      // מיזוג כל האירועים מכל היומנים לרשימה אחת
      const allEvents = events.flat();
      console.log(allEvents);
      // סינון אירועים לפי ההגדרה של showAllDayEvents וסינון אירועי workingLocation
      const validEvents = allEvents.filter(event =>
          event !== null &&
          (event.start.dateTime && isFuture(event.start.dateTime)) && // מסנן אירועי יום שלם אם showAllDayEvents אינו מסומן
          event.eventType !== 'workingLocation' // סינון אירועים עם eventType של workingLocation
      );
      console.log('validEvents', validEvents);
      // מיון האירועים בסדר כרונולוגי
      validEvents.sort((a, b) => {
        const aTime = new Date(a.start.dateTime);
        const bTime = new Date(b.start.dateTime);
        return aTime - bTime;
      });

      // החזרת האירוע הקרוב ביותר להיום בלבד
      return validEvents[0] || null;
    } catch (error) {
      console.error('Error fetching next event today:', error);
      throw error;
    }
  }

  disconnectFromGoogle() {
    localStorage.removeItem('googleAccessToken');
    if (gapi.client) {
      gapi.client.setToken(null);
    }
  }

  async addEvent(event) {
    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      return response.result;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    }
  }

  async listEvents(params = {}) {
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0); // הגדרת סוף היום הנוכחי
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDay.toISOString(),
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
        ...params
      });
      return response.result.items;
    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw error;
    }
  }

  async findCalendarById(calendarID){
    try {
      const response = await gapi.client.calendar.calendarList.list();
      const calendars = response.result.items;
      return calendars.find(calendar => calendar.id === calendarID) || null;
    } catch (error) {
      if (error.status === 401) {
        // Token expired or invalid
        await this.handleTokenError();
        // Retry the request
        const response = await gapi.client.calendar.calendarList.list();
        const calendars = response.result.items;
        return calendars.find(calendar => calendar.id === calendarID) || null;
      }
      console.error('Error fetching calendar list:', error);
      throw error;
    }

  }

}

export default GoogleCalendarService;