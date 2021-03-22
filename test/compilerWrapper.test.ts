import { assert, expect } from 'chai';
import path = require("path");
import { loadDescription,getContractFilePath, getInvalidContractFilePath } from './helper'
import { ABIEntityType, CompileResult, desc2CompileResult, compilerVersion} from '../src/compilerWrapper';
import { compileContract, getCIScryptc } from '../src/utils';
import * as minimist from 'minimist';

describe('compile()', () => {
  it('compile successfully', () => {
    const result = compileContract(getContractFilePath('p2pkh.scrypt'));

    assert.typeOf(result, 'object');
    assert.equal(result.errors.length, 0, "No Errors");
  })



  it('should generate description file properly', () => {
    const result = compileContract(getContractFilePath('bar.scrypt'));
    const outputFile = path.join(__dirname, 'fixture/bar_desc.json');

    assert.typeOf(result, 'object');

    const content = loadDescription('bar_desc.json');

    assert.deepEqual(content.abi, [
      {
        "type": ABIEntityType.FUNCTION,
        "name": "unlock",
        "index": 0,
        "params": [
          {
            "name": "y",
            "type": "int"
          }
        ]
      }, {
        "type": ABIEntityType.CONSTRUCTOR,
        "params": [
          {
            "name": "_x",
            "type": "int"
          },
          {
            "name": "y",
            "type": "int"
          },
          {
            "name": "z",
            "type": "int"
          }
        ]
      }
    ])
  })

  it('should generate structs properly', () => {
    const result = compileContract(getContractFilePath('person.scrypt'));

    assert.equal(result.structs.length, 2);

    expect(result.structs).to.deep.include.members([{
      name: 'Person',
      params: [{
        "name": "addr",
        "type": "bytes"
      }, {
        "name": "isMale",
        "type": "bool"
      }, {
        "name": "age",
        "type": "int"
      }]
    }, {
      name: 'Block',
      params: [{
        "name": "hash",
        "type": "bytes"
      }, {
        "name": "header",
        "type": "bytes"
      }, {
        "name": "time",
        "type": "int"
      }]
    }
    ])
  })

  describe('test compilerVersion', () => {
    const argv = minimist(process.argv.slice(2));

    let scryptc = argv.scryptc;
    if(argv.ci || !scryptc) {
      scryptc = getCIScryptc();
    }

    const version = compilerVersion(scryptc);
    console.log('compilerVersion', version)
    expect(/^(\d)+\.(\d)+\.(\d)+\+commit\./.test(version)).to.be.true
  })
 


  describe('desc should be as expected', () => {
    let desc;
    before(() => {
      desc = loadDescription('tokenUtxo_desc.json');
    });

    it('source should be sort as expected', () => {
      expect(desc.sources[0]).to.contains("std");
      expect(desc.sources[1]).to.contains("util.scrypt");
      expect(desc.sources[2]).to.contains("tokenUtxo.scrypt");
    })


    it('compileResult file should be main contract', () => {
      const compileResult: CompileResult = desc2CompileResult(desc)
      expect(compileResult.file).to.contains("tokenUtxo.scrypt");
    })

  });


  describe('compile error test', () => {
    it('should compile fail with import error', () => {
      const result = compileContract(getInvalidContractFilePath('main.scrypt'));
  
      assert.typeOf(result.errors, 'array');
  
      result.errors.forEach(e => {
        e.filePath = path.basename(e.filePath);
      })
  
      expect(result.errors).to.deep.include.members([{
          filePath: "main.scrypt",
          message: "File not found: \" lib.scrypt\"",
          position: [
            {
              "column": 8,
              "line": 1
            },
            {
              "column": 21,
              "line": 1
            }
          ],
          type: "SemanticError"
        
      }])
  
    })
  
  
    it('should compile fail with import error', () => {
      const result = compileContract(getInvalidContractFilePath('main0.scrypt'));
  
      assert.typeOf(result.errors, 'array');
  
      result.errors.forEach(e => {
        e.filePath = path.basename(e.filePath);
      })
  
      expect(result.errors).to.deep.include.members([{
          filePath: "main0.scrypt",
          message: "File not found: \"libx.scrypt\"",
          position: [
            {
              "column": 8,
              "line": 1
            },
            {
              "column": 21,
              "line": 1
            }
          ],
          type: "SemanticError"
      }])
    })
  
    it('should compile fail with import error', () => {
      const result = compileContract(getInvalidContractFilePath('demo.scrypt'));
  
      assert.typeOf(result.errors, 'array');
  
      result.errors.forEach(e => {
        e.filePath = path.basename(e.filePath);
      })
  
      expect(result.errors).to.deep.include.members([{
          filePath: "main0.scrypt",
          message: "File not found: \"libx.scrypt\"",
          position: [
            {
              "column": 8,
              "line": 1
            },
            {
              "column": 21,
              "line": 1
            }
          ],
          type: "SemanticError"
      }])
    })
  
  
    it('should compile fail with ImportCycleError', () => {
      const result = compileContract(getInvalidContractFilePath('importCycleA.scrypt'));
  
      assert.typeOf(result.errors, 'array');
  
      result.errors.forEach(e => {
        e.filePath = path.basename(e.filePath);
      })
  
      expect(result.errors).to.deep.include.members([{
          filePath: "importCycleB.scrypt",
          message: "Dependency cycle detected: (\"importCycleB.scrypt\" -> \"importCycleC.scrypt\", \"importCycleC.scrypt\" -> \"importCycleA.scrypt\", \"importCycleA.scrypt\" -> \"importCycleB.scrypt\")",
          position: [
            {
              "column": 8,
              "line": 1
            },
            {
              "column": 31,
              "line": 1
            }
          ],
          type: "SemanticError"
      }])
    })


    it('must have at least one public function', () => {
      const result = compileContract(getInvalidContractFilePath('lib.scrypt'));
  
      assert.typeOf(result.errors, 'array');
  
      result.errors.forEach(e => {
        e.filePath = path.basename(e.filePath);
      })
  
      expect(result.errors).to.deep.include.members([{
          filePath: "lib.scrypt",
          message: "Contact `Lib` must have at least one public function",
          position: [
            {
              "column": 10,
              "line": 1
            },
            {
              "column": 13,
              "line": 1
            }
          ],
          type: "SemanticError"
      }])
    })

  })


  describe('compile result with autoTypedVars', () => {
    const result = compileContract(getContractFilePath('autoTyped.scrypt'));

    it('autoTypedVars', () => {

      expect(result.autoTypedVars[0]).to.deep.property("name", "Main.y");
      expect(result.autoTypedVars[0]).to.deep.property("type", "int");


      expect(result.autoTypedVars[1]).to.deep.property("name", "y");
      expect(result.autoTypedVars[1]).to.deep.property("type", "int");


      expect(result.autoTypedVars[2]).to.deep.property("name", "z");
      expect(result.autoTypedVars[2]).to.deep.property("type", "int");


      expect(result.autoTypedVars[3]).to.deep.property("name", "aa");
      expect(result.autoTypedVars[3]).to.deep.property("type", "int[2]");


      expect(result.autoTypedVars[4]).to.deep.property("name", "ss");
      expect(result.autoTypedVars[4]).to.deep.property("type", "struct ST1 {}[2]");

      expect(result.autoTypedVars[5]).to.deep.property("name", "evel");
      expect(result.autoTypedVars[5]).to.deep.property("type", "int");

      expect(result.autoTypedVars[6]).to.deep.property("name", "ss1");
      expect(result.autoTypedVars[6]).to.deep.property("type", "struct ST1 {}[2]");

    })

  })

})