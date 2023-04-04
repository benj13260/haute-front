import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { BookingsDetailsComponent } from 'app/modules/admin/apps/bookings/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateBookingsDetails implements CanDeactivate<BookingsDetailsComponent>
{
    canDeactivate(
        component: BookingsDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )

        {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/bookings'
        // it means we are navigating away from the
        // bookings app
        if ( !nextState.url.includes('/bookings') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another booking...
        if ( nextRoute.paramMap.get('id') )
        {
            // Just navigate
            return true;
        }
        // Otherwise...
        else
        {
            console.log("close Drawer")
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}
