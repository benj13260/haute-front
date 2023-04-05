import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, distinctUntilChanged, filter, finalize, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Booking, BookingPaymentStatus, BookingTransportStatus, Location, LocationFull } from 'app/modules/admin/apps/bookings/bookings.types';
import { BookingsListComponent } from 'app/modules/admin/apps/bookings/list/list.component';
import { BookingsService } from 'app/modules/admin/apps/bookings/bookings.service';
import { UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'bookings-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('roundTripSection') private _roundTripSection: ElementRef;


    editMode: boolean = false;
    booking: Booking;
    bookingForm: UntypedFormGroup;
    bookings: Booking[];
    locations: Location[];

    roundTrip: boolean = true

    bookingPaymentStatus: BookingPaymentStatus[];
    bookingTransportStatus: BookingTransportStatus[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();



    searchContactsCtrl = new FormControl();
    filteredContacts: any;
    isLoading = false;
    errorMsg!: string;
    minLengthTerm = 3;
    selectedContact: any = "";

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _bookingsListComponent: BookingsListComponent,
        private _bookingsService: BookingsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {
    }


    onSelected() {
        console.log(this.selectedContact);
        this.selectedContact = this.selectedContact;
      }
    
      displayWith(value: any) {
        return value?.Title;
      }
    
      clearSelection() {
        this.selectedContact = "";
        this.filteredContacts = [];
      }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.searchContactsCtrl.valueChanges
        .pipe(
          filter(res => {
            return res !== null && res.length >= this.minLengthTerm
          }),
          distinctUntilChanged(),
          debounceTime(1000),
          tap(() => {
            this.errorMsg = "";
            this.filteredContacts = [];
            this.isLoading = true;
          }),
          switchMap(value => this._bookingsService.getContactById(value)
            .pipe(
              finalize(() => {
                this.isLoading = false
              }),
            )
          )
        )
        .subscribe((data: any) => {
          if (data['Search'] == undefined) {
            this.errorMsg = data['Error'];
            this.filteredContacts = [];
          } else {
            this.errorMsg = "";
            this.filteredContacts = data['Search'];
          }
          console.log(this.filteredContacts);
        });

        // Open the drawer
        this._bookingsListComponent.matDrawer.open();

        // Create the booking form
        this.bookingForm = this._formBuilder.group({
            id: [''],
            roundTrip: [true],
            adults: [0],
            children: [0],
            from: [''],
            dateFrom: [null],
            to: [''],
            dateTo: [null],
            notes: [null],
            bookingTransportStatus: [''],
            bookingPaymentStatus: [''],
        });



        // Get the bookings
        this._bookingsService.bookings$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((bookings: Booking[]) => {
                this.bookings = bookings;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the booking
        this._bookingsService.booking$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((booking: Booking) => {

                // Open the drawer in case it is closed
                this._bookingsListComponent.matDrawer.open();

                // Get the booking
                this.booking = booking;

                // Patch values to the form
                this.bookingForm.patchValue(booking);

                // Toggle the edit mode off
                this.toggleEditMode(false);
                console.log("***")
                console.log(booking.dateFrom)
                console.log(booking.dateTo)
                if (booking.dateFrom === undefined) {
                    this.toggleEditMode(true);

                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        /*
                // Get the locations
                this._bookingsService.locations$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((locations: Location[]) => {
                        this.locations = locations;
        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
        */


        this._bookingsService.locationFulls$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locationFull: LocationFull) => {
                this.locations = locationFull.Locations;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the bookingPaymentStatuses
        this._bookingsService.bookingPaymentStatuses$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((b: BookingPaymentStatus[]) => {
                this.bookingPaymentStatus = b;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the bookingTransportStatus
        this._bookingsService.bookingTransportStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((b: BookingTransportStatus[]) => {
                this.bookingTransportStatus = b;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._bookingsListComponent.matDrawer.close();
    }

    /**
     * Toggle round trip
     *
     * @param roundTrip
     */
    toggleRoundTrip(): void {

        this.roundTrip = this.bookingForm.controls['roundTrip'].value;
        this._renderer2.setStyle(this._roundTripSection.nativeElement, 'transition', 'all 2s');

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    getLocations(): Location[] {
        return this._bookingsService.locations
    }


    getLocationName(id: number): string {
        return this._bookingsService.locationNames.get(id)
    }

    getContactName(id: number): string {
        return this._bookingsService.locationNames.get(id)
    }


    /**
     * Update the booking
     */
    updateBooking(): void {
        // Get the booking object
        const booking = this.bookingForm.getRawValue();
        console.log("updateBooking " + this.bookingForm.getRawValue())

        // Update the booking on the server
        this._bookingsService.updateBooking(booking.id, booking).subscribe(() => {

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Delete the booking
     */
    deleteBooking(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete booking',
            message: 'Are you sure you want to delete this booking? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current booking's id
                const id = this.booking.id;

                // Get the next/previous booking's id
                const currentBookingIndex = this.bookings.findIndex(item => item.id === id);
                const nextBookingIndex = currentBookingIndex + ((currentBookingIndex === (this.bookings.length - 1)) ? -1 : 1);
                const nextBookingId = (this.bookings.length === 1 && this.bookings[0].id === id) ? null : this.bookings[nextBookingIndex].id;

                // Delete the booking
                this._bookingsService.deleteBooking(id)
                    .subscribe((isDeleted) => {

                        // Return if the booking wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next booking if available
                        if (nextBookingId) {
                            this._router.navigate(['../', nextBookingId], { relativeTo: this._activatedRoute });
                        }
                        // Otherwise, navigate to the parent
                        else {
                            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

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
