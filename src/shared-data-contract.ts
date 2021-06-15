/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { SharedData } from './shared-data';

@Info({title: 'SharedDataContract', description: 'My Smart Contract' })
export class SharedDataContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async sharedDataExists(ctx: Context, sharedDataId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createSharedData(ctx: Context, sharedDataId: string, value: string): Promise<void> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (exists) {
            throw new Error(`The shared data ${sharedDataId} already exists`);
        }
        const sharedData: SharedData = new SharedData();
        sharedData.value = value;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
    }

    @Transaction(false)
    @Returns('SharedData')
    public async readSharedData(ctx: Context, sharedDataId: string): Promise<SharedData> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(sharedDataId);
        const sharedData: SharedData = JSON.parse(data.toString()) as SharedData;
        return sharedData;
    }

    @Transaction()
    public async updateSharedData(ctx: Context, sharedDataId: string, newValue: string): Promise<void> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exist`);
        }
        const sharedData: SharedData = new SharedData();
        sharedData.value = newValue;
        const buffer: Buffer = Buffer.from(JSON.stringify(sharedData));
        await ctx.stub.putState(sharedDataId, buffer);
    }

    @Transaction()
    public async deleteSharedData(ctx: Context, sharedDataId: string): Promise<void> {
        const exists: boolean = await this.sharedDataExists(ctx, sharedDataId);
        if (!exists) {
            throw new Error(`The shared data ${sharedDataId} does not exist`);
        }
        await ctx.stub.deleteState(sharedDataId);
    }

}
