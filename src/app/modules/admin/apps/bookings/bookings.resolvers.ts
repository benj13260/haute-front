import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { BookingsService } from 'app/modules/admin/apps/bookings/bookings.service';
import { Booking, Location, LocationFull } from 'app/modules/admin/apps/bookings/bookings.types';

@Injectable({
    providedIn: 'root'
})
export class BookingsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _bookingsService: BookingsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Booking[]>
    {
        return this._bookingsService.getBookings();
    }
}

@Injectable({
    providedIn: 'root'
})
export class BookingsBookingResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _bookingsService: BookingsService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Booking>
    {
        return this._bookingsService.getBookingById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested booking is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}


@Injectable({
    providedIn: 'root'
})
export class BookingsLocationsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _bookingsService: BookingsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LocationFull>
    {
        return this._bookingsService.getLocationFulls();
    }
}
