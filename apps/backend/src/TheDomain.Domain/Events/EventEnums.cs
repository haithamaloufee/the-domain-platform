namespace TheDomain.Domain.Events;

public enum EventPublicationStatus { Draft = 1, Published = 2, Cancelled = 3, Archived = 4 }
public enum EventDisplayStatus { Upcoming = 1, Live = 2, Finished = 3, Cancelled = 4 }
public enum BookingAvailability { Hidden = 1, NotOpenYet = 2, Open = 3, Closed = 4, SoldOut = 5 }
