import espree from 'espree';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import clone from 'clone';
import child_process from 'child_process';
import tmp from 'tmp';
import fs from 'fs';
import { Promise } from "es6-promise";

const arrowLogger = {
  parse(code) {
    let ast = espree.parse(code, {comments: true, attachComment: true})
    estraverse.replace(ast, {
      enter: function (node) {
        if (node.leadingComments) {
          node.leadingComments = []
        }
        return node;
      }
    })
    return ast;
  },

  mark(ast) {
    const appendSendMessage = function (ast, comment) {
      var comments = ast.trailingComments
      ast.trailingComments = []
      var value = ast.expression || ast;

      if (ast.type == 'VariableDeclaration') {
        return ast;
      }

      return {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "process"
            },
            "property": {
              "type": "Identifier",
              "name": "send"
            }
          },
          "arguments": [
            {
              "type": "ObjectExpression",
              "properties": [
                {
                  "type": "Property",
                  "key": {
                    "type": "Identifier",
                    "name": "commentRange"
                  },
                  "computed": false,
                  "value": {
                    "type": "ArrayExpression",
                    "elements": [
                      {
                        "type": "Literal",
                        "value": comment.range[0],
                        "raw": "1"
                      },
                      {
                        "type": "Literal",
                        "value": comment.range[1],
                        "raw": "2"
                      }
                    ]
                  },
                  "kind": "init",
                  "method": false,
                  "shorthand": false
                },
                {
                  "type": "Property",
                  "key": {
                    "type": "Identifier",
                    "name": "result"
                  },
                  "computed": false,
                  "value": value,
                  "kind": "init",
                  "method": false,
                  "shorthand": false
                }
              ]
            }
          ]
        }
      }
    };
    return estraverse.replace(clone(ast), {
      leave: function (node) {
        if (node.trailingComments && node.trailingComments[0].value.indexOf('=>') > 0) {
          return appendSendMessage(node, node.trailingComments[0])
        }
        return node;
      }
    });
  },
  toCode (ast) {
    return escodegen.generate(ast, {comment: true});
  },
  invoke (code) {
    const tmpobj = tmp.fileSync();
    fs.writeSync(tmpobj.fd, code)
    return child_process.fork(tmpobj.name)
  },

  run(originalCode, config) {
    const originalAst = this.parse(originalCode);
    const markedAst = this.mark(originalAst);

    return new Promise( (resolve) => {
      const childProcess = this.invoke(this.toCode(markedAst))
      childProcess.on("message", (msg) => {
        originalAst.comments.forEach( (comment) => {
          if (comment.range[0] === msg.commentRange[0] && comment.range[1] === msg.commentRange[1]) {
            comment.value += " " + msg.result
          }
        });
      });
      childProcess.on('exit', () => {
        resolve(this.toCode(originalAst));
      })
    });
  }
}
export default arrowLogger;
