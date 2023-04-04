import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class HauteFormat
{

    constructor()
    {
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    locale = 'en-US'
    getDate(date: string): string
    {
        return formatDate(date,'YYYY-MM-ddTHH:mm:ssZZZZZ',this.locale)
    }
}
