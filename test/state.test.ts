

import { assert, expect } from 'chai';
import { loadDescription, newTx } from './helper';
import { buildContractClass, VerifyError, buildTypeClasses } from '../src/contract';
import { Bool, Bytes, Int, PrivKey, PubKey, Ripemd160, Sha256, SigHashPreimage, SigHashType, OpCodeType, SigHash, Sig } from '../src/scryptTypes';
import { bsv, toHex, getPreimage } from '../src/utils';

const inputIndex = 0;
const inputSatoshis = 100000;

const outputAmount = 222222

const StateExample = buildContractClass(loadDescription('state_desc.json'));


describe('state_test', () => {


    it('should serializer state success', () => {
        const stateExample = new StateExample(1000, new Bytes('0101'), true,
            new PrivKey("11"),
            new PubKey("03f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf"),
            new Ripemd160("40933785f6695815a7e1afb59aff20226bbb5bd4"),
            new Sha256("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
            new OpCodeType('76'),
            new SigHashType(SigHash.ALL | SigHash.FORKID),
            new Sig("304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541"),
        );

        expect(stateExample.dataPart.toHex()).to.be.equal('02e80302010101010b2103f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf1440933785f6695815a7e1afb59aff20226bbb5bd420ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad0176014147304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541ad00000000');
        stateExample.counter++;
        stateExample.state_bytes = new Bytes('010101');
        stateExample.state_bool = false;

        expect(stateExample.dataPart.toHex()).to.be.equal('02e9030301010100010b2103f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf1440933785f6695815a7e1afb59aff20226bbb5bd420ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad0176014147304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541ae00000000');


    });


    it('should deserializer state success', () => {
        const stateExample = new StateExample(1000, new Bytes('0101'), true,
            new PrivKey("11"),
            new PubKey("03f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf"),
            new Ripemd160("40933785f6695815a7e1afb59aff20226bbb5bd4"),
            new Sha256("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
            new OpCodeType('76'),
            new SigHashType(SigHash.ALL | SigHash.FORKID),
            new Sig("304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541")
        );

        let newStateExample = StateExample.fromHex(stateExample.lockingScript.toHex());

        expect(newStateExample.counter.equals(new Int(1000))).to.be.true;
        expect(newStateExample.state_bytes.equals(new Bytes('0101'))).to.be.true;
        expect(newStateExample.state_bool.equals(new Bool(true))).to.be.true;
        expect(newStateExample.privKey.equals(new PrivKey("11"))).to.be.true;
        expect(newStateExample.ripemd160.equals(new Ripemd160("40933785f6695815a7e1afb59aff20226bbb5bd4"))).to.be.true;
        expect(newStateExample.sha256.equals(new Sha256("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"))).to.be.true;
        expect(newStateExample.opCodeType.equals(new OpCodeType('76'))).to.be.true;
        expect(newStateExample.sigHashType.equals(new SigHashType(SigHash.ALL | SigHash.FORKID))).to.be.true;
        expect(newStateExample.sig.equals(new Sig("304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541"))).to.be.true;
    });


    it('should call success', () => {
        const stateExample = new StateExample(1000, new Bytes('0101'), true,
            new PrivKey("11"),
            new PubKey("03f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf"),
            new Ripemd160("40933785f6695815a7e1afb59aff20226bbb5bd4"),
            new Sha256("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
            new OpCodeType('76'),
            new SigHashType(SigHash.ALL | SigHash.FORKID),
            new Sig("304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541")
        );
        // update state
        stateExample.counter = 1001
        stateExample.state_bytes = new Bytes('010101');
        stateExample.state_bool = false;
        const tx1 = newTx(inputSatoshis);
        tx1.addOutput(new bsv.Transaction.Output({
            script: bsv.Script.fromHex(stateExample.lockingScript.toHex()),
            satoshis: outputAmount
        }))

        const preimage1 = getPreimage(tx1, stateExample.prevLockingScript, inputSatoshis)

        stateExample.txContext = {
            tx: tx1,
            inputIndex,
            inputSatoshis
        }

        const result1 = stateExample.unlock(new SigHashPreimage(toHex(preimage1)), outputAmount).verify()
        expect(result1.success, result1.error).to.be.true

        //should call commitState to update counter.prevLockingScript
        stateExample.commitState();


        stateExample.counter = 1002
        stateExample.state_bytes = new Bytes('01010101');
        stateExample.state_bool = true;


        const tx2 = newTx(inputSatoshis);
        tx2.addOutput(new bsv.Transaction.Output({
            script: bsv.Script.fromHex(stateExample.lockingScript.toHex()),
            satoshis: outputAmount
        }))

        const preimage2 = getPreimage(tx2, stateExample.prevLockingScript, inputSatoshis)

        stateExample.txContext = {
            tx: tx2,
            inputIndex,
            inputSatoshis
        }

        const result2 = stateExample.unlock(new SigHashPreimage(toHex(preimage2)), outputAmount).verify()
        expect(result2.success, result2.error).to.be.true

    });

})