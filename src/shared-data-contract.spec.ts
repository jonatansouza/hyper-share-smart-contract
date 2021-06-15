/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { SharedDataContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('SharedDataContract', () => {

    let contract: SharedDataContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new SharedDataContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"shared data 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"shared data 1002 value"}'));
    });

    describe('#sharedDataExists', () => {

        it('should return true for a shared data', async () => {
            await contract.sharedDataExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a shared data that does not exist', async () => {
            await contract.sharedDataExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createSharedData', () => {

        it('should create a shared data', async () => {
            await contract.createSharedData(ctx, '1003', 'shared data 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"shared data 1003 value"}'));
        });

        it('should throw an error for a shared data that already exists', async () => {
            await contract.createSharedData(ctx, '1001', 'myvalue').should.be.rejectedWith(/The shared data 1001 already exists/);
        });

    });

    describe('#readSharedData', () => {

        it('should return a shared data', async () => {
            await contract.readSharedData(ctx, '1001').should.eventually.deep.equal({ value: 'shared data 1001 value' });
        });

        it('should throw an error for a shared data that does not exist', async () => {
            await contract.readSharedData(ctx, '1003').should.be.rejectedWith(/The shared data 1003 does not exist/);
        });

    });

    describe('#updateSharedData', () => {

        it('should update a shared data', async () => {
            await contract.updateSharedData(ctx, '1001', 'shared data 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"shared data 1001 new value"}'));
        });

        it('should throw an error for a shared data that does not exist', async () => {
            await contract.updateSharedData(ctx, '1003', 'shared data 1003 new value').should.be.rejectedWith(/The shared data 1003 does not exist/);
        });

    });

    describe('#deleteSharedData', () => {

        it('should delete a shared data', async () => {
            await contract.deleteSharedData(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a shared data that does not exist', async () => {
            await contract.deleteSharedData(ctx, '1003').should.be.rejectedWith(/The shared data 1003 does not exist/);
        });

    });

});
