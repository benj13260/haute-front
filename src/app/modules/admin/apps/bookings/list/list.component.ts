import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Booking, Location, LocationFull } from 'app/modules/admin/apps/bookings/bookings.types';
import { BookingsService } from 'app/modules/admin/apps/bookings/bookings.service';

@Component({
    selector: 'bookings-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    bookings$: Observable<Booking[]>;

    bookingsCount: number = 0;
    bookingsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedBooking: Booking;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _bookingsService: BookingsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the bookings
        this.bookings$ = this._bookingsService.bookings$;
        this._bookingsService.bookings$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((bookings: Booking[]) => {

                // Update the counts
                this.bookingsCount = bookings.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the booking
        this._bookingsService.booking$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((booking: Booking) => {

                // Update the selected booking
                this.selectedBooking = booking;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries
        /*
        this._bookingsService.locations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locations: Location[]) => {

                // Update the countries
                this.locations = locations;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            */
        this._bookingsService.locationFulls$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locationFull: LocationFull) => {
                console.log("list init")
                this._bookingsService.locations = locationFull.Locations;
                this._bookingsService.fillLocationName(this._bookingsService.locations)
                this._bookingsService.updateBookingLocationName(this._bookingsService.locations)
                console.log("list init stop")


                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>

                    // Search
                    this._bookingsService.searchBookings(query)
                )
            )
            .subscribe();

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected booking when drawer closed
                this.selectedBooking = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.createBooking();
            });
    }

    getLocationName(id: number): string {
        return this._bookingsService.locationNames.get(id)
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }




    /**
     * Create booking
     */
    createBooking(): void {
        // Create the booking

            // Go to the new booking
            this._router.navigate(['./new'], { relativeTo: this._activatedRoute });

            // Mark for check
            this._changeDetectorRef.markForCheck();

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
