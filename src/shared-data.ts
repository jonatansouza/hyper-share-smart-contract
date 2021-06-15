/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

export enum PermissionTypes {
    Granted,
    Denied,
    NA
}

export interface SharedDataModel {
    ownerId: string;
    sharedWith: string[];
    sharedDataDescription: string;
    updated?: number;
    requester?: string;
    permission?: PermissionTypes;
    mode?: string; // method name

}

@Object()
export class SharedData {

    @Property()
    public ownerId: string;

    @Property()
    public sharedWith: string[];

    @Property()
    public sharedDataDescription: string;

    @Property()
    public updated: number;

    @Property()
    public requester: string;

    @Property()
    public permission: PermissionTypes;

    @Property()
    public mode: string; // method name
}
