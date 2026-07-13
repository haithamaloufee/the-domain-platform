namespace TheDomain.Domain.Media;

public enum MediaType { Image = 1, Video = 2 }
public enum MediaOrientation { Unknown = 1, Portrait = 2, Landscape = 3, Square = 4 }
public enum MediaApprovalStatus { Draft = 1, Approved = 2, Hidden = 3 }
public enum EventMediaUsage { Hero = 1, Cover = 2, Poster = 3, Gallery = 4, Thumbnail = 5, HomepagePreview = 6, PreviousEventPreview = 7 }
