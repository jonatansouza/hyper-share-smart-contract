/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';
import { PermissionTypes, SharedData } from './shared-data';

@Info({title: 'SharedDataContract', description: 'My Smart Contract' })
export class SharedDataContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async sharedDataExists(ctx: Context, sharedDataId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createSharedData(ctx: Context, sharedDataId: string, requester: string, sharedDataDescription: string, timestamp: number): Promise<void> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (exists) {
            throw new Error(`The shared data ${sharedDataId} already exists`);
        }
        const sharedData: SharedData = new SharedData();
        sharedData.ownerId = requester;
        sharedData.sharedWith = '';
        sharedData.sharedDataDescription = sharedDataDescription;
        sharedData.mode = 'createSharedData';
        sharedData.updated = timestamp;
        sharedData.requester = requester;
        sharedData.permission = PermissionTypes.NA;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
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
    public async updateSharedData(ctx: Context, sharedDataId: string, requester: string, sharedDataDescription: string, timestamp: number): Promise<void> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (exists) {
            throw new Error(`The shared data ${sharedDataId} already exists`);
        }
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        if(!data) {
            throw new Error(`The shared data ${sharedDataId} not found on ledger`);
        }
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        if(sharedData.ownerId !== requester) {
            throw new Error(`The shared data ${sharedDataId} does not belong to ${requester}`);
        }
        sharedData.sharedDataDescription = sharedDataDescription;
        sharedData.mode = 'updateSharedData';
        sharedData.updated = timestamp;
        sharedData.permission = PermissionTypes.NA;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
    }

    @Transaction()
    public async deleteSharedData(ctx: Context, sharedDataId: string, requester: string): Promise<void> {
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
                const data = JSON.parse(current.value.value.toString())
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
                const data = JSON.parse(current.value.value.toString())
                result.push(data);
            }
            current = await iterator.next();
        }
        await iterator.close();
        return result;
    }
}
