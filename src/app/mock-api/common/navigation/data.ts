/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id      : 'apps',
        title   : 'Applications',
        subtitle: 'Custom made application designs',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [    
            {
                id   : 'apps.scrumboard',
                title: 'Scrumboard',
                type : 'basic',
                icon : 'heroicons_outline:view-boards',
                link : '/apps/scrumboard'
            },
            {
                id   : 'apps.bookings',
                title: 'Bookings',
                type : 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/apps/bookings'
            },            
            {
                id   : 'apps.contacts',
                title: 'Contacts',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/contacts'
            },
        ]
    },    
    {
        id      : 'others',
        title   : 'Others',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [    
            {
                id   : 'apps.ecommerce.inventory',
                title: 'Inventory',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/ecommerce/inventory'
            },            
        ]
    }    
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
