import { Route } from '@angular/router';
import { CanDeactivateBookingsDetails } from 'app/modules/admin/apps/bookings/bookings.guards';
import { BookingsBookingResolver, BookingsResolver, BookingsLocationsResolver } from 'app/modules/admin/apps/bookings/bookings.resolvers';
import { BookingsComponent } from 'app/modules/admin/apps/bookings/bookings.component';
import { BookingsListComponent } from 'app/modules/admin/apps/bookings/list/list.component';
import { BookingsDetailsComponent } from 'app/modules/admin/apps/bookings/details/details.component';

export const bookingsRoutes: Route[] = [
    {
        path     : '',
        component: BookingsComponent,
        resolve  : {
            locations: BookingsLocationsResolver
        },
        children : [
            {
                path     : '',
                component: BookingsListComponent,
                resolve  : {
                    bookings : BookingsResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : BookingsDetailsComponent,
                        resolve      : {
                            booking  : BookingsBookingResolver,
                        },
                        canDeactivate: [CanDeactivateBookingsDetails]
                    }
                ]
            }
        ]
    }
];
