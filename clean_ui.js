const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove weird suffix junk
  content = content.replace(/_α/g, '');
  content = content.replace(/_IX/g, '');
  content = content.replace(/_TX/g, '');
  content = content.replace(/_STABLE/g, '');
  content = content.replace(/_v4\.2/g, '');

  // Remove text-[xx]
  content = content.replace(/text-\[8px\]/g, 'text-xs');
  content = content.replace(/text-\[9px\]/g, 'text-xs');
  content = content.replace(/text-\[10px\]/g, 'text-sm');
  content = content.replace(/text-\[11px\]/g, 'text-base');

  // Remove tracking-[xx]
  content = content.replace(/tracking-\[[^\]]+\]/g, 'tracking-normal');

  // Less aggressive formatting
  content = content.replace(/\sfont-black/g, ' font-medium');
  content = content.replace(/\sitalic/g, '');
  
  // Remove unnecessary terminal command center texts if they are just strings (optional, I'll just leave string replacements)
  content = content.replace(/Aura Access Hub/g, 'Welcome Back');
  content = content.replace(/Initialize Session/g, 'Login');
  content = content.replace(/Registry Identifier \(Email\)/g, 'Email Address');
  content = content.replace(/Registry Identifier/g, 'Email Address');
  content = content.replace(/Access Key \(Password\)/g, 'Password');
  content = content.replace(/Access Key/g, 'Password');
  content = content.replace(/Enter Node Hub/g, 'Login');
  content = content.replace(/Create Identity/g, 'Register');
  content = content.replace(/Verify Token/g, 'Verify OTP');
  content = content.replace(/Finalize Sync/g, 'Submit');
  content = content.replace(/Send Sync Token/g, 'Send OTP');
  content = content.replace(/Access UID \(Username\)/g, 'Username');

  // Aggressive Matrix jargon removal
  content = content.replace(/Luminous System Telemetry Overlays Architecture.*/g, 'Dashboard Background');
  content = content.replace(/Luminous System Telemetry Bar Command Interface.*/g, 'Command Bar');
  content = content.replace(/Luminous System Telemetry Bar/g, 'Navigation Bar');
  content = content.replace(/Protocol Active :: v4\.2 Excellence/g, 'System Online');
  content = content.replace(/Auth Command Node α Sector IX v4\.2/g, 'Authentication Service');
  content = content.replace(/Identity Sync: Sovereign stable :: Hub Verified α node hub/g, 'Secure Connectivity');
  content = content.replace(/Access the Luminous Matrix alpha node strictly\./g, 'Secure learning platform.');
  content = content.replace(/ELEVATED <br \/> <span[^>]*>INTELLIGENCE\.<\/span>/g, 'Empowering <br /> <span className="text-blue-600 underline">Education.</span>');
  content = content.replace(/provision node credentials into grid/g, 'enter your credentials below');
  content = content.replace(/Alternative Sync Matrix/g, 'Alternative Login');
  content = content.replace(/SYNC_FIDELITY/g, 'USER RATING');
  content = content.replace(/ACTIVE_PEER_NODES/g, 'ACTIVE STUDENTS');
  content = content.replace(/Identity Sync v4\.2 stable IX/g, 'Secure Portal');
  content = content.replace(/USER@AURA\.NODE/g, 'user@example.com');
  content = content.replace(/OTP_Sync/g, 'OTP Login');
  content = content.replace(/_ABORT_SYNC/g, '');
  content = content.replace(/Terminal Command Center/g, 'Dashboard Area');
  // General suffix purges across the board
  content = content.replace(/_NODE_XI/g, '');
  content = content.replace(/_ROOT_XI/g, '');
  content = content.replace(/NODE_ROOT_XI/g, '');
  content = content.replace(/alpha_v4\.2/g, '');
  content = content.replace(/_alpha/g, '');
  content = content.replace(/alpha/ig, '');
  content = content.replace(/v4\.2/g, '');
  content = content.replace(/stable/ig, '');
  content = content.replace(/_HUB/g, '');
  content = content.replace(/_SYNC/g, '');
  content = content.replace(/_FLUX/g, '');
  content = content.replace(/_MATRIX/g, '');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      cleanFile(fullPath);
    }
  }
}

processDirectory('./frontend/src/views');
processDirectory('./frontend/src/components');
console.log('UI cleanup complete.');
