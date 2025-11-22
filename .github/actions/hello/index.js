const fs = require('fs');

const name = process.env['INPUT_WHO-TO-GREET'] || 'World';
const greeting = `Hello, ${name}!`;

console.log(greeting);

// Prefer writing to GITHUB_OUTPUT (new recommended way), fall back to set-output if not available
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `greeting=${greeting}\n`);
} else {
  console.log(`::set-output name=greeting::${greeting}`);
}