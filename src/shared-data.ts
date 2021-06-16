/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

export enum PermissionTypes {
    Granted = 1,
    Denied = 2,
    NA = 3
}
@Object()
export class SharedData {

    @Property()
    public ownerId: string;

    @Property()
    public sharedWith: string;

    @Property()
    public sharedDataDescription: string;

    @Property()
    public updated: number;

    @Property()
    public requester: string;

    @Property()
    public permission: number;

    @Property()
    public mode: string; // method name
}
