# GitHub Copilot Instructions - AI4Devs Retro Web Games

## 🚫 ANTI-HALLUCINATION PROTOCOLS

### MANDATORY VERIFICATION REQUIREMENTS
1. **ALWAYS verify tool outputs before claiming success**
   - Check `run_in_terminal` results are not empty or error messages
   - Verify `get_errors` shows actual compilation/runtime errors
   - Confirm `open_simple_browser` actually loads the intended page
   - Use `read_file` to verify changes were applied correctly

2. **NEVER assume operations succeeded without verification**
   - Server status: Always check with `lsof -i :PORT` or `curl` tests
   - File changes: Always verify with `read_file` after edits
   - Game functionality: Always test in browser after code changes
   - Error states: Always check actual console output and browser errors

3. **FACT-CHECK ALL STATUS CLAIMS**
   - ❌ "Server is running" → ✅ Verify with actual port check
   - ❌ "Game is working" → ✅ Test actual gameplay and console logs
   - ❌ "Fix applied" → ✅ Verify code changes and runtime behavior
   - ❌ "No errors" → ✅ Check actual error logs and browser console

### CODE VALIDATION REQUIREMENTS
1. **Before claiming a fix works:**
   - Read the actual modified code with `read_file`
   - Check for syntax errors with `get_errors`
   - Test runtime behavior in browser
   - Verify console logs show expected behavior

2. **When troubleshooting:**
   - Always check actual error messages, not assumptions
   - Use `grep_search` to understand existing code patterns
   - Read surrounding context before making changes
   - Test changes incrementally, not all at once

3. **Server and Infrastructure:**
   - Verify server processes with `ps` commands
   - Test HTTP responses with `curl` commands
   - Check actual port usage with `lsof`
   - Never claim server is running without proof

### DEBUGGING PROTOCOL
1. **Real-world testing required:**
   - Use browser dev tools to check console errors
   - Verify actual game behavior, not theoretical fixes
   - Check network requests and responses
   - Validate user interactions work as expected

2. **Evidence-based claims only:**
   - Screenshots/logs for verification when possible
   - Actual console output for debugging
   - Real HTTP status codes for server verification
   - Actual game behavior for functionality claims

### PROJECT-SPECIFIC REQUIREMENTS
1. **Retro Game Standards:**
   - Verify 60fps performance with actual testing
   - Check ghost AI behavior in real gameplay
   - Validate fruit spawning with actual game runs
   - Ensure retro aesthetic is maintained

2. **Cross-browser compatibility:**
   - Test actual browser loading and functionality
   - Verify Canvas API operations work correctly
   - Check Web Audio API functionality
   - Validate responsive design on actual devices

## ⚠️ HALLUCINATION RED FLAGS
- Claiming success without tool verification
- Assuming server status without actual checks
- Reporting fixes without testing gameplay
- Making status claims based on code inspection alone
- Ignoring tool output errors or empty responses

## ✅ VERIFICATION CHECKLIST
Before any "✅ Working" or "✅ Fixed" claims:
- [ ] Tool outputs verified and non-empty
- [ ] Server actually responding to HTTP requests
- [ ] Games load and function in browser
- [ ] Console logs show expected behavior
- [ ] Error conditions properly handled
- [ ] Code changes actually applied and correct

**Remember: Code that compiles ≠ Code that works correctly**
**Remember: Empty tool output = Operation likely failed**
**Remember: User feedback trumps theoretical analysis**
