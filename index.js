var pj = require("prettyjson");
var here = require('here').here;
var escodegen = require('escodegen');

var code = here(/*
var hoge = 1; // =>
*/).unindent();

var espree = require('espree')
var originalAst = espree.parse(code, {comments: true, attachComment: true})

var estraverse = require('estraverse')

console.log('---------end----------------------')
var output = escodegen.generate(originalAst, {comment: true});
console.log(output)

appendConsoleLog = function (ast) {
  var comments = ast.trailingComments
  ast.trailingComments = []
  return {
      "type": "CallExpression",
      "callee": {
        "type": "MemberExpression",
        "computed": false,
        "object": {
          "type": "Identifier",
          "name": "console"
        },
        "property": {
          "type": "Identifier",
          "name": "log"
        }
      },
      "arguments": [
        ast
      ],
      trailingComments: comments
  }
}

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

console.log("aa")

var clone = require('clone');
var weavedAst = clone(originalAst)
weavedAst = estraverse.replace(weavedAst, {
  leave: function (node) {
    //if (node.type == 'BinaryExpression' && node.left.type == 'Literal' && node.right.type == 'Literal') {
    //  return {
    //    type: 'Literal',
    //    value: 6
    //  }
    //}
    //if (node.type == 'Literal' && node.value == 6) {
    //  return {
    //    type: 'BinaryExpression',
    //    operator: '*',
    //    left: { type: 'Literal', value: 4000},
    //    right: { type: 'Literal', value: 3},
    //  }
    //}
    if (node.trailingComments && node.trailingComments[0].value.indexOf('=>') > 0) {
      console.log(pj.render(node))
      //return appendConsoleLog(node)
      return appendSendMessage(node, node.trailingComments[0])
      return {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 40 },
        right: { type: 'Literal', value: 2 }
      }
    }
    return node;
  }
})
// console.log(ast.comments[0].value= ' hoggeee')
//console.log("-------hoge-----")
//console.log(pj.render(weavedAst))
var output = escodegen.generate(weavedAst, {comment: true});
console.log(output)


var child_process = require("child_process");
//var command = child_process.spawn(process.argv[0], ['-e', 'console.log("haaaaage");console.log("hoge")']);
//command.stdout.on('data', function(data) {
//  result += data.toString();
//});
//command.on('close', function(code) {
//  return console.log(result);
//});

var tmp = require('tmp');

var tmpobj = tmp.fileSync();
console.log("File: ", tmpobj.name);
console.log("Filedescriptor: ", tmpobj.fd);

var fs = require('fs');
fs.writeSync(tmpobj.fd, output)

var child = child_process.fork(tmpobj.name)

var result = 'result ¥n';
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
