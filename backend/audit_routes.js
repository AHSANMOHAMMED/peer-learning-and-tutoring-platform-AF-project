const fs = require('fs');
const path = require('path');

const routesDir = '/Users/ahsan/peer-learning-and-tutoring-platform/backend/routes';
const routeFiles = fs.readdirSync(routesDir);

const results = [];

routeFiles.forEach(file => {
  if (!file.endsWith('.js')) return;
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Look for router.get, router.post, etc. and extract the path and authorize() calls
    const routeMatch = line.match(/router\.(get|post|put|delete|patch)\(['"](.*?)['"]/);
    if (routeMatch) {
      const method = routeMatch[1].toUpperCase();
      const routePath = routeMatch[2];
      
      // Look for authorize(['role1', 'role2']) or authorize('role1', 'role2')
      const authorizeMatch = line.match(/authorize\((.*?)\)/);
      let roles = 'public';
      if (authorizeMatch) {
        roles = authorizeMatch[1].replace(/[\[\]'"]/g, '');
      } else if (line.includes('protect') || line.includes('authenticate')) {
        roles = 'authenticated';
      }
      
      results.push({
        file,
        method,
        path: routePath,
        roles,
        line: index + 1
      });
    }
  });
});

console.log(JSON.stringify(results, null, 2));
