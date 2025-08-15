echo "=== CONTACT INFORMATION AUDIT - PHASE 1F ==="
echo "Scanning for contact information issues..."

# 1. Search for incorrect email domains
echo ""
echo "🔍 SEARCHING FOR INCORRECT EMAIL DOMAINS:"
echo "Looking for @jasonjewels.com references..."
grep -r "jasonjewels\.com" . --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "Looking for any @jason references..."
grep -r "@jason" . --include="*.ts" --include="*.tsx" | head -15

# 2. Search for placeholder contact information
echo ""
echo "📞 SEARCHING FOR PLACEHOLDER CONTACT DATA:"
echo "Looking for placeholder phone numbers..."
grep -r "555-" . --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "Looking for placeholder data patterns..."
grep -r "123-456-7890\|placeholder\|example\.com" . --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "Looking for fake/mock contact data..."
grep -r "fake.*phone\|mock.*address\|sample.*contact" . --include="*.ts" --include="*.tsx" | head -10

# 3. Find all contact-related components
echo ""
echo "📄 LOCATING CONTACT COMPONENTS:"
echo "Finding contact-related files..."
find . -name "*contact*" -type f | head -10
find . -name "*Contact*" -type f | head -10

# 4. Search for social media placeholder links
echo ""
echo "🔗 CHECKING SOCIAL MEDIA LINKS:"
grep -r "facebook\.com/example\|instagram\.com/example\|twitter\.com/example" . --include="*.ts" --include="*.tsx"

echo ""
echo "=== AUDIT COMPLETE ==="
echo "Next step: Review results and proceed to centralization"

