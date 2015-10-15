import assert from 'power-assert';
import here from 'here';
import arrowLogger from '../src/arrow-logger';

describe('arrowLogger', () => {
  describe('#run', () => {
    context('when commented on ExpressionStatement', () => {
      it('should log string', (done) => {
        const code = [
          "var string = 'abc';",
          "string; // =>"
        ];
        arrowLogger.run(code.join('\n')).then( (result) => {
          const expect = [
            "var string = 'abc';",
            "string;    // => 'abc'",
            ""
          ];
          assert.equal(result, expect.join('\n'));
          done();
        }).catch(done);
      });
      it('should log object', (done) => {
        const code = [
          "var obj = {abc: 'aaa'};",
          "obj; // =>"
        ];
        arrowLogger.run(code.join('\n')).then( (result) => {
          const expect = [
            "var obj = { abc: 'aaa' };",
            "obj;    // => { abc: 'aaa' }",
            ""
          ];
          assert.equal(result, expect.join('\n'));
          done();
        }).catch(done);
      });
    });
  });
});
