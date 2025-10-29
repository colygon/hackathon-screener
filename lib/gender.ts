// Common male first names
const maleNames = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas', 'charles',
  'christopher', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua',
  'kenneth', 'kevin', 'brian', 'george', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan',
  'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon',
  'benjamin', 'samuel', 'raymond', 'gregory', 'frank', 'alexander', 'patrick', 'jack', 'dennis', 'jerry',
  'tyler', 'aaron', 'jose', 'adam', 'henry', 'nathan', 'douglas', 'zachary', 'peter', 'kyle',
  'walter', 'ethan', 'jeremy', 'harold', 'keith', 'christian', 'roger', 'noah', 'gerald', 'carl',
  'terry', 'sean', 'austin', 'arthur', 'lawrence', 'jesse', 'dylan', 'bryan', 'joe', 'jordan',
  'billy', 'bruce', 'albert', 'willie', 'gabriel', 'logan', 'alan', 'juan', 'wayne', 'roy',
  'ralph', 'randy', 'eugene', 'vincent', 'russell', 'elijah', 'louis', 'bobby', 'philip', 'johnny',
  'arjun', 'raj', 'amit', 'rahul', 'rohan', 'aditya', 'aman', 'akshay', 'varun', 'siddharth',
  'mohammed', 'ahmed', 'ali', 'omar', 'yusuf', 'hassan', 'hussein', 'hamza', 'amir', 'karim',
  'wei', 'chen', 'li', 'wang', 'zhang', 'ming', 'jun', 'yang', 'jian', 'feng',
  'carlos', 'miguel', 'francisco', 'antonio', 'diego', 'manuel', 'alejandro', 'pablo', 'pedro', 'ricardo'
]);

// Common female first names
const femaleNames = new Set([
  'mary', 'patricia', 'jennifer', 'linda', 'barbara', 'elizabeth', 'susan', 'jessica', 'sarah', 'karen',
  'nancy', 'lisa', 'betty', 'margaret', 'sandra', 'ashley', 'kimberly', 'emily', 'donna', 'michelle',
  'dorothy', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia',
  'kathleen', 'amy', 'angela', 'shirley', 'anna', 'brenda', 'pamela', 'emma', 'nicole', 'helen',
  'samantha', 'katherine', 'christine', 'debra', 'rachel', 'carolyn', 'janet', 'catherine', 'maria', 'heather',
  'diane', 'ruth', 'julie', 'olivia', 'joyce', 'virginia', 'victoria', 'kelly', 'lauren', 'christina',
  'joan', 'evelyn', 'judith', 'megan', 'andrea', 'cheryl', 'hannah', 'jacqueline', 'martha', 'gloria',
  'teresa', 'ann', 'sara', 'madison', 'frances', 'kathryn', 'janice', 'jean', 'abigail', 'sophia',
  'alice', 'judy', 'isabella', 'julia', 'grace', 'amber', 'denise', 'danielle', 'marilyn', 'beverly',
  'charlotte', 'natalie', 'brittany', 'diana', 'doris', 'kayla', 'alexis', 'lori', 'marie', 'tiffany',
  'priya', 'anjali', 'pooja', 'neha', 'sneha', 'kavya', 'divya', 'ananya', 'riya', 'shreya',
  'fatima', 'aisha', 'maryam', 'zainab', 'amina', 'noor', 'hana', 'layla', 'yasmin',
  'sofia', 'camila', 'valentina', 'lucia', 'martina', 'gabriela', 'daniela', 'ana', 'carolina',
  'evangeline', 'eve', 'genevieve', 'vivian', 'vivienne', 'madeline', 'josephine', 'eleanor',
  'penelope', 'scarlett', 'violet', 'hazel', 'ivy', 'rose', 'lily', 'daisy', 'iris',
  'savannah', 'claire', 'stella', 'nora', 'elena', 'aurora', 'lucy', 'maya', 'willow',
  'ava', 'mia', 'ella', 'aria', 'chloe', 'zoe', 'riley', 'leah', 'hannah', 'audrey',
  'sweta', 'shweta', 'smita', 'sita', 'geeta', 'meena', 'seema', 'reena', 'veena',
  'isha', 'tara', 'maya', 'sonia', 'monica', 'anita', 'sunita', 'lalita', 'savita',
  'desiree', 'heidi', 'megan', 'vamika', 'riddhi', 'sinem', 'amitha', 'janavi'
]);

// Female name patterns (endings that typically indicate female names)
const femalePatterns = [
  /ine$/i,  // Christine, Caroline, Evangeline
  /elle$/i, // Michelle, Gabrielle, Belle
  /ette$/i, // Annette, Colette
  /ina$/i,  // Christina, Angelina, Martina
  /anna$/i, // Anna, Joanna, Brianna
  /ia$/i,   // Maria, Julia, Olivia (but be careful with some male names)
  /ara$/i,  // Sara, Clara, Tara
  /een$/i,  // Maureen, Kathleen
];

export type Gender = 'Male' | 'Female' | 'Non-binary/Unknown';

export function detectGender(fullName: string): Gender {
  // Extract first name
  const firstName = fullName.trim().split(/\s+/)[0].toLowerCase();
  
  // Remove common prefixes
  const cleanName = firstName.replace(/^(mr|ms|mrs|dr|prof)\.?\s*/i, '');
  
  // Check against name databases
  if (maleNames.has(cleanName)) {
    return 'Male';
  }
  
  if (femaleNames.has(cleanName)) {
    return 'Female';
  }
  
  // Check female name patterns
  for (const pattern of femalePatterns) {
    if (pattern.test(cleanName)) {
      // Additional check: avoid false positives for names like "Andrea" which can be male in some cultures
      // But for most patterns, we can be confident
      return 'Female';
    }
  }
  
  // If not found in either list, return non-binary/unknown
  return 'Non-binary/Unknown';
}

// Function to update all applicants with gender
import { sql } from '@vercel/postgres';

export async function updateApplicantGender(apiId: string, gender: Gender) {
  try {
    const result = await sql`
      UPDATE applicants SET
        gender = ${gender},
        updated_at = CURRENT_TIMESTAMP
      WHERE api_id = ${apiId}
      RETURNING *
    `;
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Update gender error:', error);
    return { success: false, error };
  }
}
