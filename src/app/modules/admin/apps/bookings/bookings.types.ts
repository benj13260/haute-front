//export const dateFromInit = "0001-01-01T00:09:21+00:09"

export interface Booking {
    id?: string | null;
    contactId?: string | null;
    roundTrip?: string | 'true';
    from?: string | null;
    to?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    bookingPaymentStatus?: number | null;
    bookingTransportStatus?: number | null;
}


export interface LocationFull {
    Groups: Group[];
    Locations: Location[];
}


export interface Group {
    id: number;
    name: string;
}

export interface Location {
    id: number;
    name: string;
    country: string;
    code: string;
    isTransitPoint: boolean;
    transitMethodId: number;
    parent: number;
    order: number;
    locationGroupID: number;
    locationGroup: string;
}

export interface BookingPaymentStatus {
    id?: string;
    title?: string;
}

export interface BookingTransportStatus {
    id?: string;
    title?: string;
}