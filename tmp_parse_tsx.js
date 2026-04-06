const ts = require('typescript');
const fs = require('fs');
const source = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const sf = ts.createSourceFile('Dashboard.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
if (sf.parseDiagnostics.length) {
  sf.parseDiagnostics.forEach(d => {
    const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
    console.error(`DIAG ${line + 1}:${character + 1} ${d.messageText}`);
  });
  process.exit(1);
}
console.log('No parse diagnostics');
