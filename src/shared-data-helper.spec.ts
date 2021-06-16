/*
 * SPDX-License-Identifier: Apache-2.0
 */
import {SharedDataHelper} from './shared-data-helper.utils';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);


describe('SharedDataHelper', () => {
    it('should convert array to string', () => {
        const result = SharedDataHelper.sharedWithToString(['a', 'b']);
        expect(result).equal('a,b');
    });

    it('should convert array to string empty', () => {
        const result = SharedDataHelper.sharedWithToString([]);
        expect(result).equal('');
    });

    it('should convert string to arr', () => {
        const result = SharedDataHelper.sharedWithToArray('a,b');
        expect(result).to.be.an('array').to.does.include('a').and.to.does.include('b');
    });

    it('should convert string to arr empty', () => {
        const result = SharedDataHelper.sharedWithToArray('');
        expect(result).to.be.an('array');
        expect(result.length).to.equal(0);
    });

});
