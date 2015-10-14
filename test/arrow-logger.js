import assert from 'power-assert';
import here from 'here';
import arrowLogger from '../src/arrow-logger';

describe('arrowLogger', () => {
  describe('#run', () => {
    context('when commented on ExpressionStatement', () => {
      it('should log expression', (done) => {
        let code = "var string = 'abc';\nstring; // =>";
        arrowLogger.run(code).then( (result) => {
          assert(result === "var string = 'abc';\nstring;    // => abc\n");
            done();
        }).catch(done);
      });
    });
  });
});
