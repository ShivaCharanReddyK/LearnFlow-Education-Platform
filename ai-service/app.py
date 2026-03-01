from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import ProgramRecommender
import os

app = Flask(__name__)
CORS(app)

recommender = ProgramRecommender()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'ai_enabled': recommender.ai_enabled,
        'service': 'LearnFlow AI Recommender'
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()

        applicant_background = data.get('applicantBackground', {})
        denied_program_id = data.get('deniedProgramId')
        denied_program_category = data.get('deniedProgramCategory', '')

        if not denied_program_id:
            return jsonify({'error': 'deniedProgramId is required'}), 400

        recommendations = recommender.get_recommendations(
            applicant_background,
            denied_program_id,
            denied_program_category
        )

        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'ai_powered': recommender.ai_enabled
        })

    except Exception as e:
        print(f"Recommendation error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 5001))
    print(f"""
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   🤖 LearnFlow AI Service Running         ║
    ║   📡 Port: {port}                          ║
    ║   🧠 AI: {'Enabled ✅' if recommender.ai_enabled else 'Disabled ⚠️ '}                    ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=port, debug=True)
