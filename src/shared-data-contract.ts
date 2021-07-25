/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';
import { PermissionTypes, SharedData } from './shared-data';
import { SharedDataHelper } from './shared-data-helper.utils';

@Info({title: 'SharedDataContract', description: 'My Smart Contract' })
export class SharedDataContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async sharedDataExists(ctx: Context, sharedDataId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    @Returns('SharedData')
    public async createSharedData(ctx: Context, sharedDataId: string, requester: string, sharedDataDescription: string, bucket: string, resourceLocation: string, timestamp: number): Promise<SharedData> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (exists) {
            throw new Error(`The shared data ${sharedDataId} already exists`);
        }
        const sharedData: SharedData = new SharedData();
        sharedData.id = sharedDataId;
        sharedData.ownerId = requester;
        sharedData.sharedWith = '';
        sharedData.sharedDataDescription = sharedDataDescription;
        sharedData.mode = 'createSharedData';
        sharedData.updated = timestamp;
        sharedData.requester = requester;
        sharedData.permission = PermissionTypes.NA;
        sharedData.bucket = bucket;
        sharedData.resourceLocation = resourceLocation;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
        return sharedData;
    }

    @Transaction(false)
    @Returns('SharedData')
    public async readSharedData(ctx: Context, sharedDataId: string, requester: string ): Promise<SharedData> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        if(sharedData.ownerId !== requester) {
            throw new Error(`The shared data ${sharedDataId} does not belong to ${requester}`);
        }
        return sharedData;
    }

    @Transaction()
    @Returns('SharedData')
    public async updateSharedData(ctx: Context, sharedDataId: string, requester: string, sharedDataDescription: string, bucket: string, resourceLocation: string ,timestamp: number): Promise<SharedData> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exists`);
        }
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        if(!data) {
            throw new Error(`The shared data ${sharedDataId} not found on ledger`);
        }
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        if(sharedData.ownerId !== requester) {
            throw new Error(`The shared data ${sharedDataId} does not belong to ${requester}`);
        }
        sharedData.sharedDataDescription = sharedDataDescription || sharedData.sharedDataDescription;
        sharedData.bucket = bucket || sharedData.bucket;
        sharedData.resourceLocation = resourceLocation || sharedData.resourceLocation;
        sharedData.mode = 'updateSharedData';
        sharedData.updated = timestamp;
        sharedData.requester = requester;
        sharedData.permission = PermissionTypes.NA;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
        return sharedData;
    }

    @Transaction()
    @Returns('SharedData')
    public async deleteSharedData(ctx: Context, sharedDataId: string, requester: string): Promise<SharedData> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        if(sharedData.ownerId !== requester) {
            throw new Error(`The shared data ${sharedDataId} does not belong to ${requester}`);
        }
        await ctx.stub.deleteState(sharedDataId);
        return sharedData;

    }

    @Transaction(false)
    @Returns('SharedData')
    public async historySharedData(ctx: Context, sharedDataId: string): Promise<SharedData[]> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exist`);
        }
        const result: SharedData[] = [];
        const iterator: Iterators.HistoryQueryIterator = await ctx.stub.getHistoryForKey(sharedDataId);
        let current = await iterator.next();
        while(!current.done) {
            if(current.value) {
                const data = JSON.parse(current.value.value.toString());
                result.push(data);
            }
            current = await iterator.next();
        }
        await iterator.close();
        return result;
    }

    @Transaction(false)
    @Returns('SharedData')
    public async allSharedDataFromOwner(ctx: Context, ownerId: string): Promise<SharedData[]> {
        const query = {
            selector: { ownerId }
        };
        const result: SharedData[] = [];
        const iterator: Iterators.StateQueryIterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        let current = await iterator.next();
        while(!current.done) {
            if(current.value) {
                const data = JSON.parse(current.value.value.toString());
                result.push(data);
            }
            current = await iterator.next();
        }
        await iterator.close();
        return result;
    }

    @Transaction()
    @Returns('SharedData')
    public async grantAccess(ctx: Context, sharedDataId: string, requester: string, thirdUser: string, timestamp: number): Promise<SharedData> {
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        if(!data) {
            throw new Error(`The shared data ${sharedDataId} does not exists`);
        }
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        if(sharedData.ownerId !== requester) {
            throw new Error(`The shared data ${sharedDataId} does not belong to ${requester}`);
        }
        const sharedWith = SharedDataHelper.sharedWithToArray(sharedData.sharedWith);
        if(sharedWith.includes(thirdUser)) {
            throw new Error(`The shared data ${sharedDataId} already allow ${thirdUser}`);
        }
        sharedWith.push(thirdUser);
        sharedData.sharedWith = SharedDataHelper.sharedWithToString(sharedWith);
        sharedData.mode = 'grantAccess';
        sharedData.updated = timestamp;
        sharedData.requester = requester;
        sharedData.permission = PermissionTypes.NA;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
        return sharedData;
    }
    @Transaction()
    @Returns('SharedData')
    public async revokeAccess(ctx: Context, sharedDataId: string, requester: string, thirdUser: string, timestamp: number): Promise<SharedData> {
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        if(!data) {
            throw new Error(`The shared data ${sharedDataId} does not exists`);
        }
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        if(sharedData.ownerId !== requester) {
            throw new Error(`The shared data ${sharedDataId} does not belong to ${requester}`);
        }
        const sharedWith = SharedDataHelper.sharedWithToArray(sharedData.sharedWith);
        if(!sharedWith.includes(thirdUser)) {
            throw new Error(`The shared data ${sharedDataId} already does not allow ${thirdUser}`);
        }
        const removed = sharedWith.filter(el => el !== thirdUser);
        sharedData.sharedWith = SharedDataHelper.sharedWithToString(removed);
        sharedData.mode = 'revokeAccess';
        sharedData.updated = timestamp;
        sharedData.requester = requester;
        sharedData.permission = PermissionTypes.NA;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
        return sharedData;
    }
    @Transaction()
    public async requestPermission(ctx: Context, sharedDataId: string, requester: string, timestamp: number): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        if(!data) {
            throw new Error(`The shared data ${sharedDataId} does not exists`);
        }
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        const sharedWith = SharedDataHelper.sharedWithToArray(sharedData.sharedWith);
        const isAllowed = sharedWith.includes(requester);
        sharedData.mode = 'requestPermission';
        sharedData.requester = requester;
        sharedData.updated = timestamp;
        sharedData.permission = isAllowed ? PermissionTypes.Granted : PermissionTypes.Denied;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
        return isAllowed;
    }
    @Transaction(false)
    @Returns('SharedData')
    public async AllSharedWithThird(ctx: Context, thirdUser: string): Promise<SharedData[]> {
        const query = {
            selector: {
                sharedWith: {
                    $regex: `.*${thirdUser}.*`
                }
            }
        };
        const result: SharedData[] = [];
        const iterator: Iterators.StateQueryIterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        let current = await iterator.next();
        while(!current.done) {
            if(current.value) {
                const data = JSON.parse(current.value.value.toString());
                result.push(data);
            }
            current = await iterator.next();
        }
        await iterator.close();
        return result;
    }
}
