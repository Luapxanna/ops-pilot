import { api } from 'encore.dev/api';
import { createOrganization, findAll } from './organization.service';
import { Organization } from './organization.service';

export const create = api(
    {
        method: 'POST',
        path: '/organizations',
    },
    async ({ name, description }: { name: string, description: string}) => {
        const organization = await createOrganization(name, description);
        return {
            success: true,
            data: organization
        };
    }
);


export const listOrganizations = api(
    {
        method: 'GET',
        path: '/organizations',
    },
    async () => {
        const organizations = await findAll();
        return {
            success: true,
            data: organizations
        };
    }
);
