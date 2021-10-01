/**
 * name : controllers/v1/event/Event
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : User controller to process the data
 */

 const EventService = require('../../core-services/v1/event/event');

 class Event {
 
     async fetch (req) {
         console.log('Event Controller Triggered');
         const serviceResponse = await EventService.fetchEvents();
         return serviceResponse;
     }
 
 };
 
 module.exports = new Event();