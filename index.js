var pj = require("prettyjson");
var here = require('here').here;
var escodegen = require('escodegen');

var code = here(/*
var string = 'abc';
string.charAt(1); // =>
string.concat('def'); // =>
string.slice(0,1); // =>
*/).unindent();

var espree = require('espree')
var originalAst = espree.parse(code, {comments: true, attachComment: true})

var estraverse = require('estraverse')

console.log('-----------before--------------------')
var output = escodegen.generate(originalAst, {comment: true});
console.log(output)
console.log('-----------before--------------------')


appendSendMessage = function (ast, comment) {
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
}

var clone = require('clone');
var weavedAst = clone(originalAst)
weavedAst = estraverse.replace(weavedAst, {
  leave: function (node) {
    if (node.trailingComments && node.trailingComments[0].value.indexOf('=>') > 0) {
      return appendSendMessage(node, node.trailingComments[0])
    }
    return node;
  }
})
var output = escodegen.generate(weavedAst, {comment: true});
console.log('---------weaved code----------------------')
console.log(output)
console.log('---------weaved code----------------------')


var child_process = require("child_process");
var tmp = require('tmp');
var tmpobj = tmp.fileSync();
var fs = require('fs');
fs.writeSync(tmpobj.fd, output)
var child = child_process.fork(tmpobj.name)

child.on("message", function (msg) {
  originalAst.comments.forEach(function (comment) {
    if (comment.range[0] === msg.commentRange[0] && comment.range[1] === msg.commentRange[1]) {
      comment.value += " " + msg.result
    }
  });
});
child.on('exit',function (){
  console.log('---------result----------------------')
  var output = escodegen.generate(originalAst, {comment: true});
  console.log(output)
  console.log('---------result----------------------')
})
