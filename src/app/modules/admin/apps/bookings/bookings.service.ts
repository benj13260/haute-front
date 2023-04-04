import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Booking, Location, BookingPaymentStatus, BookingTransportStatus, LocationFull, Group } from 'app/modules/admin/apps/bookings/bookings.types';
import { environment } from 'app/environments/environment';
import { formatDate } from '@angular/common';
import { HauteFormat } from 'app/core/common/haute.format';
import { Contact } from '../contacts/contacts.types';



@Injectable({
    providedIn: 'root'
})
export class BookingsService {
    // Private
    private _booking: BehaviorSubject<Booking | null> = new BehaviorSubject(null);
    private _bookings: BehaviorSubject<Booking[] | null> = new BehaviorSubject(null);
    private _locationsFull: BehaviorSubject<LocationFull | null> = new BehaviorSubject(null);

    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);

    private _locations: BehaviorSubject<Location[] | null> = new BehaviorSubject(null);
    private _groups: BehaviorSubject<Group[] | null> = new BehaviorSubject(null);
    private _bookingPaymentStatuses: BehaviorSubject<BookingPaymentStatus[] | null> = new BehaviorSubject(null);
    private _bookingTransportStatuses: BehaviorSubject<BookingTransportStatus[] | null> = new BehaviorSubject(null);

    private bookingUrl: string = environment.backend + "/bookings"
    private contactUrl: string = environment.backend + "/users"

    locationNames: Map<number, string> = new Map<number, string>()
    locations: Location[];


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _hauteFormat: HauteFormat) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for booking
     */
    get booking$(): Observable<Booking> {
        return this._booking.asObservable();
    }

    /**
     * Getter for bookings
     */
    get bookings$(): Observable<Booking[]> {
        return this._bookings.asObservable();
    }

    /**
     * Getter for countries
     */

    get locationFulls$(): Observable<LocationFull> {
        console.log(this._locationsFull.getValue())

        return this._locationsFull.asObservable();
    }

    get locations$(): Observable<Location[]> {
        return this._locations.asObservable();
    }

    get bookingPaymentStatuses$(): Observable<BookingPaymentStatus[]> {
        return this._bookingPaymentStatuses.asObservable();
    }

    get bookingTransportStatus$(): Observable<BookingTransportStatus[]> {
        return this._bookingTransportStatuses.asObservable();
    }




    getLocationName(id: number): string {
        return this.locationNames.get(id)
    }

    updateBookingLocationName(locations: Location[]) {
        // Update location
        this.locations = locations;
        for (let i = 0; i < this.locations.length; i++) {
            const e = this.locations[i];
            for (let j = 0; j < locations.length; j++) {
                if (e.locationGroupID == locations[j].id) {
                    e.locationGroup = locations[j].name
                }
            }
        }
    }

    fillLocationName(locations: Location[]) {
        locations.forEach(e => {
            this.locationNames.set(e.id, e.name)
        });
    }


    /**
     * Get bookings
     */
    getBookings(): Observable<Booking[]> {
        return this._httpClient.get<Booking[]>(this.bookingUrl).pipe(
            tap((bookings) => {
                this._bookings.next(bookings);
            })
        );
    }

    getContactById(id: string): Observable<Contact>
    {
        return this._httpClient.get<Contact>(this.contactUrl, {
            params: {id}
        }).pipe(
            tap((contact) => {
                this._contact.next(contact);
            })
        );
    }

    /**
     * Search bookings with given query
     *
     * @param query
     */
    searchBookings(query: string): Observable<Booking[]> {
        return this._httpClient.get<Booking[]>(this.bookingUrl + '/search', {
            params: { query }
        }).pipe(
            tap((bookings) => {
                this._bookings.next(bookings);
            })
        );
    }

    createNewBooking(): Booking{
        let b : Booking ={ id: "new"}
        return b;
    }

    /**
     * Get booking by id
     */
    getBookingById(id: string): Observable<Booking> {
        return this._bookings.pipe(
            take(1),
            map((bookings) => {

                // Find the booking
                let booking = bookings.find(item => item.id === id) || this.createNewBooking();
                
                // Update the booking
                this._booking.next(booking);

                // Return the booking
                return booking;
            }),
            switchMap((booking) => {



                if (!booking) {
                    return throwError(() => new Error('Could not found booking with id of ' + id + '!'))
                }

                return of(booking);
            })
        );
    }

    /**
     * Create booking NOT REQUIRED
     */
    createBooking(): Observable<Booking> {

        let o: Booking = { id: "new"}

        let ob = new Observable<Booking>(i => i.next(o))
        //this._bookings.next([o, ...this._bookings.getValue()]);
        return ob;
        /*
        return this.bookings$.pipe(
            take(1),
            switchMap(bookings => this._httpClient.post<Booking>(this.bookingUrl, {}).pipe(
                map((newBooking) => {

                    // Update the bookings with the new booking
                    this._bookings.next([newBooking, ...bookings]);

                    // Return the new booking
                    return newBooking;
                })
            ))
        );
        */
    }


    /**
     * Update booking
     *
     * @param id
     * @param booking
     */
    updateBooking(id: string, bookingI: any): Observable<Booking> {
        console.log("a  " + bookingI)

        let booking: Booking = {
            from: bookingI.from,
            dateFrom: this._hauteFormat.getDate(bookingI.dateFrom),
            to: bookingI.to,
            dateTo: this._hauteFormat.getDate(bookingI.dateTo),
        }

        console.log(booking)

        return this.bookings$.pipe(
            take(1),
            switchMap(bookings => this._httpClient.post<Booking>(this.bookingUrl,
                booking
            ).pipe(
                map((updatedBooking) => {

                    // Find the index of the updated booking
                    const index = bookings.findIndex(item => item.id === id);

                    // Update the booking
                    bookings[index] = updatedBooking;

                    // Update the bookings
                    this._bookings.next(bookings);

                    // Return the updated booking
                    return updatedBooking;
                }),
                switchMap(updatedBooking => this.booking$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the booking if it's selected
                        this._booking.next(updatedBooking);

                        // Return the updated booking
                        return updatedBooking;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the booking
     *
     * @param id
     */
    deleteBooking(id: string): Observable<boolean> {
        return this.bookings$.pipe(
            take(1),
            switchMap(bookings => this._httpClient.delete(this.bookingUrl+"/"+id ).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted booking
                    const index = bookings.findIndex(item => item.id === id);

                    // Delete the booking
                    bookings.splice(index, 1);

                    // Update the bookings
                    this._bookings.next(bookings);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get Locations
     
    getLocationFulls(): Observable<LocationFull[]> {
         return this._httpClient.get<LocationFull[]>(this.bookingUrl + "/locations").pipe(
            tap((j) => {
                this._locationsFull.next(j);
            })
        );
        return null;
    }
    */
    /**
 * Get BookingPaymentStatus
 */
    getLocationFulls(): Observable<LocationFull> {
        return this._httpClient.get<LocationFull>(this.bookingUrl + "/locations").pipe(
            tap((j) => {
                this._locations.next(j.Locations);
                return this._locationsFull.next(j);
            })
        );
    }

    /**
     * Get BookingPaymentStatus
     */
    getBookingPaymentStatuses(): Observable<BookingPaymentStatus[]> {
        return this._httpClient.get<BookingPaymentStatus[]>(this.bookingUrl + "/booking_payment_status").pipe(
            tap((bookingPaymentStatuses) => {
                this._bookingPaymentStatuses.next(bookingPaymentStatuses);
            })
        );
    }

    /**
    * Get BookingTransportStatus
    */
    getBookingTransportStatus(): Observable<BookingTransportStatus[]> {
        return this._httpClient.get<BookingPaymentStatus[]>(this.bookingUrl + "/booking_payment_status").pipe(
            tap((bookingTransportStatuses) => {
                this._bookingTransportStatuses.next(bookingTransportStatuses);
            })
        );
    }


}
