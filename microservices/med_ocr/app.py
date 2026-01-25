
import base64
import json
from flask import Flask, request, jsonify, render_template
from openai import OpenAI
import os
from dotenv import load_dotenv

app = Flask(__name__)


# 🔐 Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not found in environment")


# 🔐 Set your OpenAI API key
client = OpenAI(api_key=OPENAI_API_KEY)


def image_to_base64(file_storage):
    return base64.b64encode(file_storage.read()).decode("utf-8")


def extract_medicine_details(image_base64: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a medical OCR assistant. "
                    "Extract medicine name and batch number from images. "
                    "If not visible, return null."
                )
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Extract the medicine name and batch number "
                            "from this medicine image and return ONLY JSON "
                            "in this format:\n\n"
                            "{\n"
                            '  "medicine_name": string | null,\n'
                            '  "batch_number": string | null\n'
                            "}"
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        temperature=0
    )

    return json.loads(response.choices[0].message.content)


# 🌐 Frontend page
@app.route("/")
def index():
    return render_template("index.html")


# 🔌 REST API
@app.route("/api/extract", methods=["POST"])
def extract():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_base64 = image_to_base64(image_file)

    try:
        result = extract_medicine_details(image_base64)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
