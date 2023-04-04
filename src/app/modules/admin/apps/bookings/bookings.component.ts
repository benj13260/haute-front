import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'bookings',
    templateUrl    : './bookings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
