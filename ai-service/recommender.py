import os
import json
import google.generativeai as genai
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load env from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class ProgramRecommender:
    def __init__(self):
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key and api_key != 'your-google-api-key':
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            self.ai_enabled = True
        else:
            self.ai_enabled = False
            print("⚠️  Gemini AI not configured. Using fallback recommendations.")

        # MongoDB connection
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/learnflow')
        self.client = MongoClient(mongo_uri)
        self.db = self.client['learnflow']
        self.programs_collection = self.db['programs']

    def get_all_programs(self, exclude_id=None):
        """Get all active programs, optionally excluding one."""
        query = {'status': {'$in': ['active', 'upcoming']}}
        if exclude_id:
            try:
                query['_id'] = {'$ne': ObjectId(exclude_id)}
            except Exception:
                pass

        programs = list(self.programs_collection.find(query, {
            'title': 1, 'shortDescription': 1, 'category': 1,
            'duration': 1, 'tags': 1, 'tuitionFee': 1
        }))

        for p in programs:
            p['_id'] = str(p['_id'])
        return programs

    def recommend_with_ai(self, applicant_background, denied_program_category, exclude_id):
        """Use Gemini AI to recommend programs based on applicant profile."""
        available_programs = self.get_all_programs(exclude_id)

        if not available_programs:
            return []

        programs_text = json.dumps(available_programs, indent=2)

        prompt = f"""You are an educational counselor AI for LearnFlow, an online education platform.

An applicant was denied admission to a program in the "{denied_program_category}" category.

Here is the applicant's background:
- Highest Degree: {applicant_background.get('degree', 'Not specified')}
- Field of Study: {applicant_background.get('fieldOfStudy', 'Not specified')}
- Statement of Purpose: {applicant_background.get('statementOfPurpose', 'Not provided')}

Here are the available programs:
{programs_text}

Based on the applicant's background and interests, recommend the top 3 most suitable alternative programs.
Consider:
1. The applicant's educational background and field of study
2. Their stated interests and goals (from statement of purpose)
3. Programs that could be a stepping stone or complementary to their original choice
4. Programs with matching or related tags/categories

Return your response as a JSON array with exactly 3 objects, each having:
- "programId": the _id of the recommended program
- "reason": a brief, encouraging reason for the recommendation (1-2 sentences)

Return ONLY the JSON array, no other text or markdown formatting.
"""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Clean up response - remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('\n', 1)[1]
                if response_text.endswith('```'):
                    response_text = response_text[:-3]
                response_text = response_text.strip()

            recommendations = json.loads(response_text)
            return recommendations[:3]
        except Exception as e:
            print(f"AI recommendation error: {e}")
            return self.recommend_fallback(denied_program_category, exclude_id)

    def recommend_fallback(self, category, exclude_id):
        """Simple category-based fallback when AI is unavailable."""
        programs = self.get_all_programs(exclude_id)

        # First, try same category
        same_category = [p for p in programs if p.get('category') == category]

        # Then other programs
        other_programs = [p for p in programs if p.get('category') != category]

        recommendations = []
        for p in (same_category + other_programs)[:3]:
            recommendations.append({
                'programId': p['_id'],
                'reason': f"This {p['category']} program could be a great alternative based on your interests."
            })

        return recommendations

    def get_recommendations(self, applicant_background, denied_program_id, denied_program_category):
        """Main method to get program recommendations."""
        if self.ai_enabled:
            return self.recommend_with_ai(
                applicant_background,
                denied_program_category,
                denied_program_id
            )
        else:
            return self.recommend_fallback(
                denied_program_category,
                denied_program_id
            )
