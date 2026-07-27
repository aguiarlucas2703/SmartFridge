const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'components/MenuDrawer.js',
  'screens/CreateProfileScreen.js',
  'screens/EditProfileScreen.js',
  'screens/FavoritesScreen.js',
  'screens/HomeScreen.js',
  'screens/PantryScreen.js',
  'screens/ProfileScreen.js',
  'screens/RecipeDetailScreen.js',
  'screens/ResultsScreen.js',
  'screens/TipsDetailScreen.js',
  'screens/TipsScreen.js'
];

for (const relPath of filesToUpdate) {
  const filePath = path.join(__dirname, relPath);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace import
  content = content.replace(
    /import \{ colors \} from '\.\.\/theme\/colors';/g,
    "import { useTheme } from '../context/ThemeContext';"
  );

  // 2. Wrap styles in getStyles
  content = content.replace(
    /const styles = StyleSheet\.create\(\{/g,
    "const getStyles = (colors) => StyleSheet.create({"
  );

  // 3. Inject useTheme and getStyles in the default export
  content = content.replace(
    /export default function (\w+)\((.*?)\) \{/,
    "export default function $1($2) {\n  const { colors, isDark, toggleTheme } = useTheme();\n  const styles = getStyles(colors);"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', relPath);
}
