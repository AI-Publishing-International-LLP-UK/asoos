require('dotenv').config();
console.log('DR_CLAUDE_API defined:', !!process.env.DR_CLAUDE_API);
if (process.env.DR_CLAUDE_API) {
  console.log('Starts with:', process.env.DR_CLAUDE_API.substring(0, 6) + '...');
}
